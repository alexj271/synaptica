import { AI_ENV } from '@/config/ai'
import type { CallAIParams, CallAIResponse } from './callAI.types'

const SYSTEM_PROMPT = `You are a health assistant AI for the Synaptica app.
You MUST respond with a valid JSON object matching this exact schema:
{
  "intent": "<original intent string>",
  "summary": "<short human-readable summary of what you did>",
  "domainActions": [
    { "type": "<redux action type>", "payload": { ... } }
  ],
  "explanations": ["<optional reasoning>"]
}

Allowed domainAction types:
- "journal/entryParsed"   — payload: { id: string, parsed: { energy?: number, stress?: number, mood?: number } }
- "plan/strategyUpdated"  — payload: { goal: string, priorities: string[], constraints: string[], updatedAt: string }
- "plan/actionsReplaced"  — payload: Array<{ id: string, title: string, done: boolean }>

If no domain action is needed, return an empty domainActions array.
Always respond with ONLY the JSON object, no markdown, no extra text.`

export async function callAI(params: CallAIParams): Promise<CallAIResponse> {
  const { model, intent, message, context } = params

  const apiKey = AI_ENV.OPENAI_API_KEY
  const baseUrl = AI_ENV.OPENAI_BASE_URL

  if (!apiKey) {
    console.warn('[callAI] No OPENAI_API_KEY set, returning empty response')
    return {
      intent,
      summary: 'No API key configured',
      domainActions: [],
    }
  }

  const userContent = [
    `Intent: ${intent}`,
    message ? `User message: ${message}` : null,
    Object.keys(context).length > 0
      ? `Context:\n${JSON.stringify(context, null, 2)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n')

  const body = {
    model,
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: 'json_object' as const },
  }

  console.log(`🌐 [callAI] POST ${baseUrl}/chat/completions | model=${model}`)

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `[callAI] API error ${response.status}: ${errorText}`,
    )
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('[callAI] Empty response from LLM')
  }

  console.log('✅ [callAI] Raw LLM response received')

  const parsed: CallAIResponse = JSON.parse(content)
  return parsed
}
