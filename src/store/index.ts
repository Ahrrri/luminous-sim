// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import characterReducer from './slices/characterSlice';
import simulationReducer from './slices/simulationSlice';
import resultsReducer from './slices/resultsSlice';

export const store = configureStore({
  reducer: {
    character: characterReducer,
    simulation: simulationReducer,
    results: resultsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;