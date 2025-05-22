// src/store/slices/characterSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CharacterState } from '../../legacy/models/character';
import { defaultCharacterState } from '../../legacy/models/character';

const characterSlice = createSlice({
  name: 'character',
  initialState: defaultCharacterState,
  reducers: {
    updateCharacter: (state, action: PayloadAction<Partial<CharacterState>>) => {
      return { ...state, ...action.payload };
    },
    changeState: (state, action: PayloadAction<'LIGHT' | 'DARK' | 'EQUILIBRIUM'>) => {
      state.currentState = action.payload;
    },
    updateGauge: (state, action: PayloadAction<number>) => {
      state.gauge = Math.min(10000, Math.max(0, state.gauge + action.payload));
    },
    resetToDefault: () => defaultCharacterState,
  },
});

export const { updateCharacter, changeState, updateGauge, resetToDefault } = characterSlice.actions;
export default characterSlice.reducer;