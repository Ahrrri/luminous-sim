// src/store/slices/simulationSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
// import type { SimulationState } from '../../models/simulation';
import { defaultSimulationState } from '../../models/simulation';
import type { Buff } from '../../models/buffs';

const simulationSlice = createSlice({
  name: 'simulation',
  initialState: defaultSimulationState,
  reducers: {
    startSimulation: (state) => {
      state.isRunning = true;
    },
    pauseSimulation: (state) => {
      state.isRunning = false;
    },
    resetSimulation: () => defaultSimulationState,
    advanceTime: (state, action: PayloadAction<number>) => {
      state.currentTime += action.payload;
    },
    addDamage: (state, action: PayloadAction<number>) => {
      state.totalDamage += action.payload;
    },
    addBuff: (state, action: PayloadAction<Buff>) => {
      state.activeBuffs.push(action.payload);
    },
    removeBuff: (state, action: PayloadAction<string>) => {
      state.activeBuffs = state.activeBuffs.filter(buff => buff.id !== action.payload);
    },
    setCooldown: (state, action: PayloadAction<{ skillId: string, cooldown: number }>) => {
      state.cooldowns[action.payload.skillId] = action.payload.cooldown;
    },
    updateCooldowns: (state, action: PayloadAction<number>) => {
      Object.keys(state.cooldowns).forEach(key => {
        state.cooldowns[key] = Math.max(0, state.cooldowns[key] - action.payload);
      });
    },
  },
});

export const {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  advanceTime,
  addDamage,
  addBuff,
  removeBuff,
  setCooldown,
  updateCooldowns,
} = simulationSlice.actions;

export default simulationSlice.reducer;