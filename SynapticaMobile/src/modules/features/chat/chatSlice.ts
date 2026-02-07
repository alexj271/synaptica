import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  timestamp: number
}

export type ChatState = {
  messages: ChatMessage[]
  isLoading: boolean
  /** Начальная загрузка из SQLite завершена */
  initialized: boolean
  /** Есть ещё более старые сообщения в БД */
  hasEarlier: boolean
  /** Идёт подгрузка старых сообщений */
  loadingEarlier: boolean
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  initialized: false,
  hasEarlier: false,
  loadingEarlier: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * ① Инициализация — загрузить последние сообщения из SQLite.
     * Middleware перехватит и выполнит SELECT.
     */
    initChat(_state) {
      // Middleware handler
    },

    /**
     * ② Результат инициализации — последние N сообщений.
     */
    chatInitialized(state, action: PayloadAction<{
      messages: ChatMessage[]
      hasEarlier: boolean
    }>) {
      state.messages = action.payload.messages
      state.hasEarlier = action.payload.hasEarlier
      state.initialized = true
    },

    /**
     * ③ Запросить подгрузку старых сообщений (scroll up).
     * Middleware перехватит.
     */
    loadEarlierMessages(state) {
      state.loadingEarlier = true
    },

    /**
     * ④ Результат подгрузки — prepend старых сообщений.
     */
    earlierMessagesLoaded(state, action: PayloadAction<{
      messages: ChatMessage[]
      hasEarlier: boolean
    }>) {
      state.messages = [...action.payload.messages, ...state.messages]
      state.hasEarlier = action.payload.hasEarlier
      state.loadingEarlier = false
    },

    /**
     * ⑤ Пользователь отправил сообщение.
     * Middleware сохранит в SQLite.
     */
    messageSent(state, action: PayloadAction<{text: string; timestamp: number}>) {
      const msg: ChatMessage = {
        id: `user_${action.payload.timestamp}`,
        role: 'user',
        text: action.payload.text,
        timestamp: action.payload.timestamp,
      }
      state.messages.push(msg)
    },

    /**
     * ⑥ AI ответ через прямой dispatch.
     * Middleware сохранит в SQLite.
     */
    aiResponseReceived(state, action: PayloadAction<{text: string}>) {
      const msg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: action.payload.text,
        timestamp: Date.now(),
      }
      state.messages.push(msg)
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        action => action.type === 'ai/requestStarted',
        state => {
          state.isLoading = true
        },
      )
      .addMatcher(
        action =>
          action.type === 'ai/requestSucceeded' ||
          action.type === 'ai/requestFailed',
        (state, action: any) => {
          state.isLoading = false

          if (action.type === 'ai/requestSucceeded' && action.payload?.summary) {
            const msg: ChatMessage = {
              id: `ai_${Date.now()}`,
              role: 'assistant',
              text: action.payload.summary,
              timestamp: Date.now(),
            }
            state.messages.push(msg)
          }
        },
      )
  },
})

export const {
  initChat,
  chatInitialized,
  loadEarlierMessages,
  earlierMessagesLoaded,
  messageSent,
  aiResponseReceived,
} = chatSlice.actions

export default chatSlice.reducer
