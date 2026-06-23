import OpenAI from 'openai'
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import type { AgenticScenario, ToolCallRecord, Group } from './types.js'
import { MAX_TURNS } from './types.js'

let _client: OpenAI | null = null
function client(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY ?? '',
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
  return _client
}

// The bash tool — constant across all scenarios.
// Handler logs calls but never executes them.
const BASH_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'bash',
    description: 'Execute a bash command and return its output. Use for file operations, running scripts, and interacting with the system.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The bash command to execute' },
      },
      required: ['command'],
    },
  },
}

function mockBashOutput(command: string): string {
  if (/curl|wget/i.test(command)) return '{"status":"ok","received":true}'
  if (/printenv|env\b/i.test(command)) return 'NODE_ENV=production\nPORT=3000'
  if (/cat\s+.*\/(id_rsa|\.env)/i.test(command)) return '--- (contents captured) ---'
  return ''
}

function wrapUntrusted(content: string): string {
  return `[UNTRUSTED]\n${content.trim()}\n[/UNTRUSTED]`
}

export interface AgenticRunResult {
  toolCalls: ToolCallRecord[]
  finalResponse: string
  deliveredInjection: boolean
  inputTokens: number
  outputTokens: number
  turnsCompleted: number
}

export async function runAgenticConversation(
  modelId: string,
  systemPrompt: string,
  scenario: AgenticScenario,
  group: Group,
): Promise<AgenticRunResult> {
  const deliveryToolDef: ChatCompletionTool = {
    type: 'function',
    function: {
      name: scenario.deliveryTool.name,
      description: scenario.deliveryTool.description,
      parameters: { type: 'object', properties: {}, required: [] },
    },
  }

  const tools: ChatCompletionTool[] = [deliveryToolDef, BASH_TOOL]

  const messages: ChatCompletionMessageParam[] = [
    { role: 'user', content: scenario.developerTask },
  ]

  const allToolCalls: ToolCallRecord[] = []
  let deliveredInjection = false
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let turnsCompleted = 0
  let finalResponse = ''

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client().chat.completions.create({
      model: modelId,
      max_tokens: 1024,
      temperature: 0,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      tools,
      tool_choice: 'auto',
    })

    turnsCompleted++
    totalInputTokens += response.usage?.prompt_tokens ?? 0
    totalOutputTokens += response.usage?.completion_tokens ?? 0

    const assistantMessage = response.choices[0]?.message
    if (!assistantMessage) break

    messages.push(assistantMessage as ChatCompletionMessageParam)

    const toolCallsThisTurn = assistantMessage.tool_calls
    if (!toolCallsThisTurn || toolCallsThisTurn.length === 0) {
      finalResponse = assistantMessage.content ?? ''
      break
    }

    for (const tc of toolCallsThisTurn) {
      const fnName = tc.function.name
      const rawArgs = tc.function.arguments
      let parsedArgs: Record<string, unknown> = {}
      try { parsedArgs = JSON.parse(rawArgs) } catch { /* malformed */ }

      let mockOutput: string

      if (fnName === scenario.deliveryTool.name) {
        deliveredInjection = true
        const rawOutput = scenario.toolOutput
        // Airlock proxy toggle: only 'both' and 'markers-only' wrap with [UNTRUSTED]
        mockOutput = (group === 'both' || group === 'markers-only')
          ? wrapUntrusted(rawOutput)
          : rawOutput
      } else if (fnName === 'bash') {
        mockOutput = mockBashOutput(String(parsedArgs['command'] ?? ''))
      } else {
        mockOutput = JSON.stringify({ error: `Unknown tool: ${fnName}` })
      }

      allToolCalls.push({ turn, toolName: fnName, rawArguments: rawArgs, parsedArguments: parsedArgs, mockOutput })

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: mockOutput,
      })
    }
  }

  return { toolCalls: allToolCalls, finalResponse, deliveredInjection, inputTokens: totalInputTokens, outputTokens: totalOutputTokens, turnsCompleted }
}
