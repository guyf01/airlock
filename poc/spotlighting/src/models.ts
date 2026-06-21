import OpenAI from 'openai'
import type { ModelConfig } from './types.js'

// Single OpenRouter client — one key, all models, OpenAI-compatible API.
// No session overhead, no CLAUDE.md contamination, ~1-2s per call.
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

export async function callModel(
  model: ModelConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const response = await client.chat.completions.create({
    model: model.id,
    max_tokens: 1024,
    temperature: 0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })
  return response.choices[0]?.message?.content ?? ''
}
