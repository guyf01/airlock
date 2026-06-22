import OpenAI from 'openai'
import type { ModelConfig } from './types.js'

// Single OpenRouter client — one key, all models, OpenAI-compatible API.
// No session overhead, no CLAUDE.md contamination, ~1-2s per call.
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

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
  const response = await client.chat.completions.create({
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
