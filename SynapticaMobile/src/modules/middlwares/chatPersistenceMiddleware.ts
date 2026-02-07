import {Middleware} from '@reduxjs/toolkit'
import {
  openChatDb,
  insertMessage,
  loadRecentMessages,
  loadOlderMessages,
  countMessages,
  PAGE_SIZE,
} from '@/db/chatDb'
import {
  chatInitialized,
  earlierMessagesLoaded,
} from '../features/chat/chatSlice'
import type {ChatMessage} from '../features/chat/chatSlice'

/**
 * =======================================
 * Chat Persistence Middleware
 * =======================================
 *
 * Перехватывает chat-экшены и работает с SQLite:
 *
 *   chat/initChat           → SELECT последние N → dispatch chatInitialized
 *   chat/loadEarlierMessages → SELECT before oldest → dispatch earlierMessagesLoaded
 *   chat/messageSent         → INSERT user message
 *   chat/aiResponseReceived  → INSERT assistant message
 *   ai/requestSucceeded      → INSERT summary as assistant message
 */

const PERSIST_ACTIONS = [
  'chat/messageSent',
  'chat/aiResponseReceived',
]

export const chatPersistenceMiddleware: Middleware =
  (store) => next => (action: any) => {

    // ─────────────────────────────────────
    // ① Init: загрузить последние сообщения
    // ─────────────────────────────────────
    if (action.type === 'chat/initChat') {
      next(action)

      try {
        openChatDb()
        const rows = loadRecentMessages(PAGE_SIZE)
        const total = countMessages()
        const messages = rows as ChatMessage[]

        console.log(`✅ [ChatDB] Loaded ${messages.length} recent messages (total: ${total})`)

        store.dispatch(chatInitialized({
          messages,
          hasEarlier: total > messages.length,
        }))
      } catch (err) {
        console.error('❌ [ChatDB] Init failed:', err)
      }

      return
    }

    // ─────────────────────────────────────
    // ② Load Earlier: подгрузить старые
    // ─────────────────────────────────────
    if (action.type === 'chat/loadEarlierMessages') {
      next(action)

      try {
        const state = store.getState()
        const messages: ChatMessage[] = state.chat?.messages ?? []
        const oldestTs = messages.length > 0
          ? messages[0].timestamp
          : Date.now()

        const older = loadOlderMessages(oldestTs, PAGE_SIZE) as ChatMessage[]
        const total = countMessages()
        const loadedSoFar = messages.length + older.length

        console.log(`✅ [ChatDB] Loaded ${older.length} earlier messages (loaded: ${loadedSoFar}/${total})`)

        store.dispatch(earlierMessagesLoaded({
          messages: older,
          hasEarlier: loadedSoFar < total,
        }))
      } catch (err) {
        console.error('❌ [ChatDB] loadEarlier failed:', err)
      }

      return
    }

    // ─── Пропускаем экшен дальше (reducer обновит стейт) ───
    const result = next(action)

    // ─────────────────────────────────────
    // ③ Persist: сохранить сообщение в SQLite
    // ─────────────────────────────────────
    if (PERSIST_ACTIONS.includes(action.type)) {
      try {
        const state = store.getState()
        const messages: ChatMessage[] = state.chat?.messages ?? []
        const last = messages[messages.length - 1]

        if (last) {
          insertMessage(last)
          console.log(`💾 [ChatDB] Persisted ${last.role} message: ${last.id}`)
        }
      } catch (err) {
        console.error('❌ [ChatDB] Persist failed:', err)
      }
    }

    // ─────────────────────────────────────
    // ④ AI summary → persist assistant message
    // ─────────────────────────────────────
    if (action.type === 'ai/requestSucceeded' && action.payload?.summary) {
      try {
        const state = store.getState()
        const messages: ChatMessage[] = state.chat?.messages ?? []
        const last = messages[messages.length - 1]

        if (last && last.role === 'assistant') {
          insertMessage(last)
          console.log(`💾 [ChatDB] Persisted AI summary: ${last.id}`)
        }
      } catch (err) {
        console.error('❌ [ChatDB] AI summary persist failed:', err)
      }
    }

    return result
  }
