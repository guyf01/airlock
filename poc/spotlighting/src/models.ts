import OpenAI from 'openai'
import type { ModelConfig } from './types.js'

// Lazy-initialized so the constructor doesn't throw before main() checks the env var.
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

export interface ModelResponse {
  text: string
  inputTokens: number
  outputTokens: number
}

export async function callModel(
  model: ModelConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<ModelResponse> {
  const response = await client().chat.completions.create({
    model: model.id,
    max_tokens: 1024,
    temperature: 0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })
  return {
    text: response.choices[0]?.message?.content ?? '',
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  }
}
