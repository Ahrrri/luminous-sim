// src/models/simulation.ts
// import type { CharacterState } from './character';
import type { Buff } from './buffs';

export interface SimulationState {
  isRunning: boolean;
  currentTime: number; // ms
  timeStep: number; // ms, 기본값 30ms
  totalDamage: number;
  
  activeBuffs: Buff[];
  cooldowns: Record<string, number>; // 스킬/버프 ID와 남은 쿨타임
  
  lastSkillUsed?: string;
  lastSkillTime?: number;
  
  // 서버렉 시뮬레이션 설정
  serverLagEnabled: boolean;
  serverLagProbability: number; // 0-1 사이 값
  serverLagDuration: number; // ms
}

export const defaultSimulationState: SimulationState = {
  isRunning: false,
  currentTime: 0,
  timeStep: 30, // 30ms
  totalDamage: 0,
  
  activeBuffs: [],
  cooldowns: {},
  
  serverLagEnabled: true,
  serverLagProbability: 0.3, // 30% 확률로 서버렉 발생
  serverLagDuration: 1000, // 1초
};