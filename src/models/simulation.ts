// src/models/simulation.ts
import type { CharacterState } from './character';
import type { Buff } from './buffs';

export interface SimulationState {
  isRunning: boolean;
  currentTime: number; // ms
  timeStep: number; // ms, 기본값 30ms
  totalDamage: number;
  
  activeBuffs: Buff[]; // 활성화된 버프들
  cooldowns: Record<string, number>; // 스킬/버프 ID와 남은 쿨타임
  
  // 스킬 사용 기록
  lastSkillUsed?: string; 
  lastSkillTime?: number;
  
  // 루미너스 특화 상태
  equilibriumDuration: number; // 이퀼 지속시간 (ms)
  memorizeAvailable: boolean; // 메모라이즈 사용 가능 상태
  doorOfTruthUsed: boolean; // 진리의 문 사용 여부 (이퀼 당 1회)
  
  // 컨티 관련 상태
  continuousCycle: {
    isActive: boolean;
    activeTime: number; // 활성 시간 (ms)
    cooldownTime: number; // 대기 시간 (ms)
    lastActivationTime?: number; // 마지막 활성화 시간
  };
  
  // 서버렉 시뮬레이션 설정
  serverLagEnabled: boolean;
  serverLagProbability: number; // 0-1 사이 값
  serverLagDuration: number; // ms
  
  // 시뮬레이션 추가 옵션
  applyOneHitPerTarget: boolean; // 한 명의 적에게는 최대 한 번만 충돌 발생 적용
  simulateBossOnly: boolean; // 보스 전투만 시뮬레이션
}

export const defaultSimulationState: SimulationState = {
  isRunning: false,
  currentTime: 0,
  timeStep: 30, // 30ms (게임 내 틱 단위)
  totalDamage: 0,
  
  activeBuffs: [],
  cooldowns: {},
  
  equilibriumDuration: 17000, // 기본 17초 (버프 지속시간 증가 효과 적용 전)
  memorizeAvailable: true,
  doorOfTruthUsed: false,
  
  continuousCycle: {
    isActive: false,
    activeTime: 8000, // 8초
    cooldownTime: 4000, // 4초
  },
  
  serverLagEnabled: true,
  serverLagProbability: 0.3, // 30% 확률로 서버렉 발생
  serverLagDuration: 1000, // 1초
  
  applyOneHitPerTarget: true,
  simulateBossOnly: true
};