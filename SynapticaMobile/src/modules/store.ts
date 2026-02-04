import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { aiMiddleware } from './middlwares/aiMiddleware';

export const store: ReturnType<typeof configureStore> = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(aiMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
