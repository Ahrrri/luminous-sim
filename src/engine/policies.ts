// src/engine/policies.ts
// 다양한 딜링 전략 구현
import { CharacterState } from '../models/character';
import { SimulationState } from '../models/simulation';
import { SkillSelectionPolicy } from './simulator';
import { skills } from '../models/skills';

// 기본 전략: 쿨이 돌면 바로 사용
export class BasicPolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 기본 정책 구현
    return null;
  }
}

// 이퀼 시간에 앱킬 우선 사용 전략
export class EquilibriumPriorityPolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 이퀼 우선 정책 구현
    return null;
  }
}

// 2분 주기에 맞춰 극딜 몰아쓰기 전략
export class BurstCyclePolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 2분 주기 정책 구현
    return null;
  }
}

// 컨티링 효율 중시 전략
export class ContinuousRingPolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 컨티링 효율 정책 구현
    return null;
  }
}