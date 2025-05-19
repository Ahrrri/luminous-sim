// src/engine/policies.ts
import type { CharacterState } from '../models/character';
import type { SimulationState } from '../models/simulation';
import { skills } from '../models/skills';
import type { SkillSelectionPolicy } from './simulator';
import { canUseSkill } from '../utils/skillUtils';

// 기본 전략: 쿨이 돌면 바로 사용
export class BasicPolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 우선순위 스킬 목록
    const prioritySkills = [
      // 5/6차 핵심 스킬
      'HARMONIC_PARADOX',
      'LIBERATION_ORB_ACTIVE',
      
      // 버프 스킬
      'HEROIC_OATH',
      'MAPLE_GODDESS_BLESSING',
      
      // 핵심 공격 스킬
      'BAPTISM_OF_LIGHT_AND_DARKNESS',
      'TWILIGHT_NOVA',
      'PUNISHING_RESONATOR'
    ];
    
    // 우선순위 스킬 사용 가능 여부 확인
    for (const skillId of prioritySkills) {
      if (canUseSkill(skillId, character, simulation)) {
        return skillId;
      }
    }

    // 상태별 스킬 선택
    if (character.currentState === 'EQUILIBRIUM') {
      // 이퀼 상태에서는 문 -> 앱킬 우선
      if (this.canUseSkill('DOOR_OF_TRUTH', character, simulation)) {
        return 'DOOR_OF_TRUTH';
      }

      if (this.canUseSkill('ABSOLUTE_KILL', character, simulation)) {
        return 'ABSOLUTE_KILL';
      }
    } else if (character.currentState === 'LIGHT') {
      // 빛 상태에서는 라리플 우선
      return 'REFLECTION';
    } else {
      // 어둠 상태에서는 아포 우선
      return 'APOCALYPSE';
    }

    return null;
  }

  private canUseSkill(skillId: string, character: CharacterState, simulation: SimulationState): boolean {
    const skill = skills[skillId];

    // 이퀼 전용 스킬 체크
    if (skill.isEquilibriumOnly && character.currentState !== 'EQUILIBRIUM') {
      return false;
    }

    // 쿨타임 체크
    if (simulation.cooldowns[skillId] && simulation.cooldowns[skillId] > 0) {
      return false;
    }

    // 진리의 문은 이퀼 당 1회만 사용 가능
    if (skillId === 'DOOR_OF_TRUTH' && simulation.doorOfTruthUsed) {
      return false;
    }

    return true;
  }
}