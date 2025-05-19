// src/store/slices/resultsSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface DamageSnapshot {
  time: number;
  damage: number;
  skill: string;
  state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
}

interface SkillUsage {
  skillId: string;
  count: number;
  totalDamage: number;
  damagePercentage: number;
}

interface ResultsState {
  totalDamage: number;
  dps: number;
  duration: number;
  skillUsage: SkillUsage[];
  damageTimeline: DamageSnapshot[];
  buffsTimeline: { time: number; buffId: string; action: 'APPLIED' | 'EXPIRED' }[];
  stateTimeline: { time: number; state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' }[];
}

const initialState: ResultsState = {
  totalDamage: 0,
  dps: 0,
  duration: 0,
  skillUsage: [],
  damageTimeline: [],
  buffsTimeline: [],
  stateTimeline: [],
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    addDamageSnapshot: (state, action: PayloadAction<DamageSnapshot>) => {
      state.damageTimeline.push(action.payload);
      state.totalDamage += action.payload.damage;
      
      // SkillUsage 업데이트
      const skillIndex = state.skillUsage.findIndex(su => su.skillId === action.payload.skill);
      if (skillIndex >= 0) {
        state.skillUsage[skillIndex].count++;
        state.skillUsage[skillIndex].totalDamage += action.payload.damage;
      } else {
        state.skillUsage.push({
          skillId: action.payload.skill,
          count: 1,
          totalDamage: action.payload.damage,
          damagePercentage: 0, // 나중에 계산
        });
      }
      
      // DPS 업데이트
      if (action.payload.time > state.duration) {
        state.duration = action.payload.time;
        state.dps = state.totalDamage / (state.duration / 1000);
      }
      
      // damagePercentage 업데이트
      state.skillUsage.forEach(su => {
        su.damagePercentage = (su.totalDamage / state.totalDamage) * 100;
      });
    },
    addBuffEvent: (state, action: PayloadAction<{ time: number; buffId: string; action: 'APPLIED' | 'EXPIRED' }>) => {
      state.buffsTimeline.push(action.payload);
    },
    addStateChange: (state, action: PayloadAction<{ time: number; state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' }>) => {
      state.stateTimeline.push(action.payload);
    },
    resetResults: () => initialState,
  },
});

export const { addDamageSnapshot, addBuffEvent, addStateChange, resetResults } = resultsSlice.actions;

export default resultsSlice.reducer;