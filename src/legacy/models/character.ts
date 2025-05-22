// src/models/character.ts
export interface CharacterState {
  // 기본 스펙
  int: number;
  luk: number;
  magicAttack: number;
  bossDamage: number;
  critDamage: number;
  critRate: number;
  
  // 강화 수준
  fifthEnhancement: number;
  sixthEnhancement: number;
  
  // 스킬 레벨
  skillLevels: Record<string, number>;
  
  // 세팅
  merLevel: number; // 쿨타임 감소 %
  buffDuration: number; // 버프 지속시간 증가 %
  cooldownReduction: number; // 재사용 대기시간 감소 (초)
  continuousLevel: number; // 컨티 레벨
  cooldownResetChance: number; // 재사용 확률
  
  // 라크니스 시스템
  currentState: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
  nextState: 'LIGHT' | 'DARK'; // 이퀼 상태 종료 후 돌아갈 상태
  lightGauge: number; // 빛 게이지 (0-10000)
  darkGauge: number; // 어둠 게이지 (0-10000)
  equilibriumMode: 'AUTO' | 'MANUAL'; // 이퀼 유예 자동/수동 모드
  isInEquilibriumDelay: boolean; // 이퀼 유예 상태
  equilibriumEndTime?: number; // 이퀼 종료 시간 (ms)
  
  // 기타 상태
  attackSpeed: number;
  isContinuousActive: boolean; // 컨티 활성화 상태
  continuousStartTime?: number; // 컨티 시작 시간 (ms)
}

export const defaultCharacterState: CharacterState = {
  int: 10000,
  luk: 1000,
  magicAttack: 2000,
  bossDamage: 300,
  critDamage: 85,
  critRate: 100,
  
  fifthEnhancement: 60,
  sixthEnhancement: 30,
  
  skillLevels: {
    // 기본 스킬 레벨 설정
    // 나중에 추가
  },
  
  merLevel: 5, // 5% 쿨타임 감소
  buffDuration: 50, // 50% 버프 지속시간 증가
  cooldownReduction: 4, // 4초 쿨감
  continuousLevel: 30,
  cooldownResetChance: 20, // 20% 재사용 확률
  
  currentState: 'LIGHT',
  nextState: 'DARK',
  lightGauge: 0,
  darkGauge: 0,
  equilibriumMode: 'AUTO',
  isInEquilibriumDelay: false,
  
  attackSpeed: 0, // 기본 공속
  isContinuousActive: false,
};