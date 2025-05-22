// src/data/types/skillTypes.ts

export interface SkillData {
    id: string;
    name: string;
    icon: string;
    element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';
    damage: number;
    hitCount: number;
    maxTargets: number;
    gaugeCharge: number;
    cooldown: number;
    description?: string;
    defaultKeyBinding?: string;
  }
  
  export type SkillElement = 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';
  
  export type SkillCategory = 'light' | 'dark' | 'equilibrium' | 'buff';