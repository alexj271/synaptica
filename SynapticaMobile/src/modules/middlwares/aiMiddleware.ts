import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit'
import { RootState, AppDispatch } from '../store'
import { AIResponseSchema, AIResponse } from '@/ai/schemas/aiResponse.schema'
import { detectIntent } from '@/ai/intent/detectIntent'
import { AIIntent } from '@/ai/intent/intent.types'
import { routeModel } from '@/ai/router/modelRouter'
import { buildContext } from '@/ai/context/buildContext'
import { evaluateActions } from '@/ai/policy/policyEngine'
import { logPolicyDecision } from '@/ai/policy/auditLogger'

/**
 * ===============================
 * Типы и контракты
 * ===============================
 */

interface AIRequestContext {
  intent: AIIntent
  message?: string
  stateSnapshot: Partial<RootState>
}

type AIResponsePayload = AIResponse

/**
 * ===============================
 * Конфигурация
 * ===============================
 */

const AI_ACTION_TRIGGERS = [
  'chat/messageSent',
  'journal/entryAdded',
]

/**
 * ===============================
 * Middleware
 * ===============================
 */

export const aiMiddleware: Middleware<{}, RootState, AppDispatch> =
  (store: MiddlewareAPI<AppDispatch, RootState>) => next => async (action: any) => {

    // Пропускаем экшен дальше по цепочке
    const result = next(action)

    // Нас интересуют только доменные события
    if (!AI_ACTION_TRIGGERS.includes(action.type)) {
      return result
    }

    try {
      const state = store.getState()

      const intent = await detectIntent(action)
      if (!intent) return result

      const context: AIRequestContext = {
        intent,
        message: action?.payload?.text ?? action?.payload?.rawText,
        stateSnapshot: buildContext(intent, state),
      }

      store.dispatch({
        type: 'ai/requestStarted',
        payload: { intent },
      })

      const { model } = await routeModel({
        intent,
        context,
      })

      const aiResponse = await callAI({
        model: model.name,
        context,
      })

      const parsedResponse = parseAIResponse(aiResponse)

      store.dispatch({
        type: 'ai/requestSucceeded',
        payload: parsedResponse,
      })

      const evaluated = evaluateActions(parsedResponse.domainActions)

      applyDomainActions(store.dispatch, evaluated.approved)

      if (evaluated.requiresConfirmation.length > 0) {
        store.dispatch({
          type: 'ai/actionsRequireConfirmation',
          payload: evaluated.requiresConfirmation,
        })
      }

      if (evaluated.rejected.length > 0) {
        store.dispatch({
          type: 'ai/actionsRejected',
          payload: evaluated.rejected,
        })
      }

      logPolicyDecision({
        intent,
        model: model.name,
        proposedActions: parsedResponse.domainActions,
        approvedActions: evaluated.approved,
        rejectedActions: evaluated.rejected,
        requiresConfirmation: evaluated.requiresConfirmation,
      })

    } catch (error) {
      store.dispatch({
        type: 'ai/requestFailed',
        payload: { error: String(error) },
      })
    }

    return result
  }

/**
 * ===============================
 * Intent Detection
 * ===============================
 */

/**
 * ===============================
 * Context Builder
 * ===============================
 */

/**
 * ===============================
 * AI Call (заглушка)
 * ===============================
 * В реальном проекте здесь:
 * - OpenAI / Claude / Local LLM
 * - retry / timeout
 * - model routing
 */

async function callAI(
  params: {
    model: string
    context: AIRequestContext
  },
): Promise<unknown> {

  // ⚠️ MOCK — заменить реальной реализацией
  return {
    intent: params.context.intent,
    summary: 'AI response placeholder',
    domainActions: [],
  }
}

/**
 * ===============================
 * Validation
 * ===============================
 */

function parseAIResponse(response: unknown): AIResponsePayload {
  return AIResponseSchema.parse(response)
}

/**
 * ===============================
 * Apply Domain Actions
 * ===============================
 */

function applyDomainActions(
  dispatch: AppDispatch,
  actions: AIResponse['domainActions'],
) {
  for (const action of actions) {
    dispatch(action)
  }
}
