import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import chatReducer from './features/chat/chatSlice';
import healthReducer from './features/health/healthSlice';
import journalReducer from './features/journal/journalSlice';
import planReducer from './features/plan/planSlice';


export default combineReducers({
  auth: authReducer,
  chat: chatReducer,
  health: healthReducer,
  journal: journalReducer,
  plan: planReducer,
});
