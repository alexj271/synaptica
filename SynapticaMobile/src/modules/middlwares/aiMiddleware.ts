import { Middleware } from '@reduxjs/toolkit'
import { AIResponseSchema, AIResponse } from '@/ai/schemas/aiResponse.schema'
import { detectIntent } from '@/ai/intent/detectIntent'
import { AIIntent } from '@/ai/intent/intent.types'
import { routeModel } from '@/ai/router/modelRouter'
import { buildContext } from '@/ai/context/buildContext'
import { evaluateActions } from '@/ai/policy/policyEngine'
import { logPolicyDecision } from '@/ai/policy/auditLogger'
import type { RootState } from '../store'

/**
 * ===============================
 * Типы и контракты
 * ===============================
 */

type AIResponsePayload = AIResponse

/**
 * ===============================
 * Конфигурация
 * ===============================
 */

const AI_ACTION_TRIGGERS = [
  'chat/messageSent',
  'journal/entryAdded',
  'health/manualMetricAdded',
]

/**
 * ===============================
 * Pipeline:
 *
 *   Redux Event
 *        ↓
 *   Intent Detection
 *        ↓
 *   Model Router
 *        ↓
 *   Context Engine
 *        ↓
 *   LLM Call
 *        ↓
 *   Zod Validation
 *        ↓
 *   🔥 Policy Engine
 *        ↓
 *   Reducers (dispatch approved)
 *
 * ===============================
 */

export const aiMiddleware: Middleware =
  (store) => next => async (action: any) => {

    // ① Redux Event — пропускаем дальше
    const result = next(action)

    if (!AI_ACTION_TRIGGERS.includes(action.type)) {
      return result
    }

    console.log('🔥 [AI Pipeline] ① Redux Event:', action.type)

    try {
      // ② Intent Detection
      console.log('🔥 [AI Pipeline] ② Intent Detection...')
      const intent = await detectIntent(action)
      if (!intent) {
        console.log('❌ [AI Pipeline] No intent detected, aborting')
        return result
      }
      console.log('✅ [AI Pipeline] ② Intent:', intent)

      store.dispatch({
        type: 'ai/requestStarted',
        payload: { intent },
      })

      // ③ Model Router (до контекста — роутеру нужен только intent)
      console.log('🔥 [AI Pipeline] ③ Model Router...')
      const { model, complexity } = await routeModel({ intent })
      console.log('✅ [AI Pipeline] ③ Model:', model.name, '| Complexity:', complexity)

      // ④ Context Engine (после роутера — собираем контекст из стейта)
      console.log('🔥 [AI Pipeline] ④ Context Engine...')
      const state = store.getState() as RootState
      const contextSnapshot = buildContext(intent, state)
      const contextSize = JSON.stringify(contextSnapshot).length
      console.log('✅ [AI Pipeline] ④ Context size:', contextSize, 'bytes')

      // ⑤ LLM Call
      console.log('🔥 [AI Pipeline] ⑤ LLM Call...')
      const rawResponse = await callAI({
        model: model.name,
        intent,
        message: action?.payload?.text ?? action?.payload?.rawText,
        context: contextSnapshot,
      })
      console.log('✅ [AI Pipeline] ⑤ LLM Response received')

      // ⑥ Zod Validation
      console.log('🔥 [AI Pipeline] ⑥ Zod Validation...')
      const parsed = parseAIResponse(rawResponse)
      console.log('✅ [AI Pipeline] ⑥ Parsed:', parsed.domainActions.length, 'domain actions')

      // ⑦ 🔥 Policy Engine
      console.log('🔥 [AI Pipeline] ⑦ Policy Engine...')
      const evaluated = evaluateActions(parsed.domainActions)
      console.log('✅ [AI Pipeline] ⑦ Policy Result:', {
        approved: evaluated.approved.length,
        requiresConfirmation: evaluated.requiresConfirmation.length,
        rejected: evaluated.rejected.length,
      })

      // ⑧ Reducers — диспатчим только approved
      console.log('🔥 [AI Pipeline] ⑧ Dispatching to Reducers...')
      applyDomainActions(store.dispatch, evaluated.approved)
      console.log('✅ [AI Pipeline] ⑧ Dispatched', evaluated.approved.length, 'approved actions')

      if (evaluated.requiresConfirmation.length > 0) {
        console.log('⚠️  [AI Pipeline] Confirmation required for', evaluated.requiresConfirmation.length, 'actions')
        store.dispatch({
          type: 'ai/actionsRequireConfirmation',
          payload: evaluated.requiresConfirmation,
        })
      }

      if (evaluated.rejected.length > 0) {
        console.log('🚫 [AI Pipeline] Rejected', evaluated.rejected.length, 'actions')
        store.dispatch({
          type: 'ai/actionsRejected',
          payload: evaluated.rejected,
        })
      }

      store.dispatch({
        type: 'ai/requestSucceeded',
        payload: parsed,
      })

      console.log('✅ [AI Pipeline] Pipeline completed successfully')

      // Audit
      logPolicyDecision({
        intent,
        model: model.name,
        proposedActions: parsed.domainActions,
        approvedActions: evaluated.approved,
        rejectedActions: evaluated.rejected,
        requiresConfirmation: evaluated.requiresConfirmation,
      })

    } catch (error) {
      console.error('❌ [AI Pipeline] Error:', error)
      store.dispatch({
        type: 'ai/requestFailed',
        payload: { error: String(error) },
      })
    }

    return result
  }

/**
 * ===============================
 * LLM Call (заглушка)
 * ===============================
 */

async function callAI(params: {
  model: string
  intent: AIIntent
  message?: string
  context: Record<string, unknown>
}): Promise<unknown> {

  // ⚠️ MOCK — заменить реальной реализацией
  return {
    intent: params.intent,
    summary: 'AI response placeholder',
    domainActions: [],
  }
}

/**
 * ===============================
 * Zod Validation
 * ===============================
 */

function parseAIResponse(response: unknown): AIResponsePayload {
  return AIResponseSchema.parse(response)
}

/**
 * ===============================
 * Apply Domain Actions → Reducers
 * ===============================
 */

function applyDomainActions(
  dispatch: (action: any) => void,
  actions: ReturnType<typeof evaluateActions>['approved'],
) {
  for (const action of actions) {
    dispatch(action)
  }
}
