// src/store/slices/simulationSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { defaultSimulationState } from '../../models/simulation';
import type { Buff } from '../../models/buffs';

const simulationSlice = createSlice({
  name: 'simulation',
  initialState: {
    ...defaultSimulationState,
    characterState: 'LIGHT' as 'LIGHT' | 'DARK' | 'EQUILIBRIUM', // 추가
  },
  reducers: {
    startSimulation: (state) => {
      state.isRunning = true;
    },
    pauseSimulation: (state) => {
      state.isRunning = false;
    },
    resetSimulation: (state) => {
      return {
        ...defaultSimulationState,
        characterState: 'LIGHT',
      };
    },
    advanceTime: (state, action: PayloadAction<number>) => {
      state.currentTime += action.payload;
    },
    addDamage: (state, action: PayloadAction<number>) => {
      state.totalDamage += action.payload;
    },
    updateCharacterState: (state, action: PayloadAction<'LIGHT' | 'DARK' | 'EQUILIBRIUM'>) => {
      state.characterState = action.payload;
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
  updateCharacterState,
  addBuff,
  removeBuff,
  setCooldown,
  updateCooldowns,
} = simulationSlice.actions;

export default simulationSlice.reducer;