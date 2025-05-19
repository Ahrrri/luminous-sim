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
    luminousSkillLevels: Record<string, number>;
    
    // 세팅
    merLevel: number; // 쿨타임 감소 %
    buffDuration: number; // 버프 지속시간 증가 %
    cooldownReduction: number; // 재사용 대기시간 감소 (초)
    continuousLevel: number; // 컨티 레벨
    cooldownResetChance: number; // 재사용 확률
    
    // 상태
    currentState: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
    nextState: 'LIGHT' | 'DARK';
    gauge: number;
    equilibriumMode: 'AUTO' | 'MANUAL';
    attackSpeed: number;
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
    
    luminousSkillLevels: {
      // 기본 스킬 레벨 설정
    },
    
    merLevel: 5, // 5% 쿨타임 감소
    buffDuration: 50, // 50% 버프 지속시간 증가
    cooldownReduction: 4, // 4초 쿨감
    continuousLevel: 30,
    cooldownResetChance: 20, // 20% 재사용 확률
    
    currentState: 'LIGHT',
    nextState: 'DARK',
    gauge: 0,
    equilibriumMode: 'AUTO',
    attackSpeed: 0 // 기본 공속
  };