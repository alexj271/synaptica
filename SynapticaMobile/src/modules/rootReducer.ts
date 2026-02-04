import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import healthReducer from './features/health/healthSlice';
import journalReducer from './features/journal/journalSlice';
import planReducer from './features/plan/planSlice';


export default combineReducers({
  auth: authReducer,
  health: healthReducer,
  journal: journalReducer,
  plan: planReducer,
});
