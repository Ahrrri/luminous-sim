// src/utils/skillUtils.ts
import type { CharacterState } from '../models/character';
import type { SimulationState } from '../models/simulation';
import { skills } from '../models/skills';

/**
 * 스킬 사용 가능 여부를 확인하는 공통 유틸리티 함수
 */
export function canUseSkill(
  skillId: string, 
  character: CharacterState, 
  simulation: SimulationState
): boolean {
  const skill = skills[skillId];
  if (!skill) return false;
  
  // 딜레이 상태 체크
  if (simulation.inSkillDelay) {
    // 딜레이 중에도 사용 가능한 스킬 목록
    const delayIgnoreSkills = ['ANGELIC_BLESSING', 'FREUDS_BLESSING'];
    if (!delayIgnoreSkills.includes(skillId)) {
      return false;
    }
  }
  
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
  
  // 메모라이즈는 사용 가능 상태일 때만
  if (skillId === 'MEMORIZE' && !simulation.memorizeAvailable) {
    return false;
  }
  
  return true;
}