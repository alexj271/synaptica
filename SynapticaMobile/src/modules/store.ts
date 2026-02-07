import { configureStore } from '@reduxjs/toolkit';
import { rozeniteDevToolsEnhancer } from '@rozenite/redux-devtools-plugin'
import rootReducer from './rootReducer';
import { aiMiddleware } from './middlwares/aiMiddleware';
import { chatPersistenceMiddleware } from './middlwares/chatPersistenceMiddleware';

export const store = configureStore({
  devTools: true,
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(chatPersistenceMiddleware)
      .concat(aiMiddleware),
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(rozeniteDevToolsEnhancer()),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
