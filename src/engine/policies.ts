// src/engine/policies.ts
import type { CharacterState } from '../models/character';
import type { SimulationState } from '../models/simulation';
import { skills } from '../models/skills';
import type { SkillSelectionPolicy } from './simulator';

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
      if (this.canUseSkill(skillId, character, simulation)) {
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

// 이퀼 시간에 앱킬 우선 사용 전략
export class EquilibriumPriorityPolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 상태별 우선순위 스킬
    let prioritySkills: string[] = [];
    
    // 이퀼 상태에서의 우선순위
    if (character.currentState === 'EQUILIBRIUM') {
      prioritySkills = [
        // 버프 스킬
        'HEROIC_OATH',
        'MAPLE_GODDESS_BLESSING',
        'LIBERATION_ORB_ACTIVE',
        
        // 이퀼 기간 스킬
        'DOOR_OF_TRUTH',
        'BAPTISM_OF_LIGHT_AND_DARKNESS',
        'ABSOLUTE_KILL',
        'PUNISHING_RESONATOR',
        'TWILIGHT_NOVA',
        'HARMONIC_PARADOX',
      ];
    } 
    // 빛 상태에서의 우선순위
    else if (character.currentState === 'LIGHT') {
      prioritySkills = [
        'BAPTISM_OF_LIGHT_AND_DARKNESS',
        'TWILIGHT_NOVA',
        'PUNISHING_RESONATOR',
        'REFLECTION' // 게이지 채우기
      ];
    } 
    // 어둠 상태에서의 우선순위
    else {
      prioritySkills = [
        'BAPTISM_OF_LIGHT_AND_DARKNESS',
        'TWILIGHT_NOVA',
        'PUNISHING_RESONATOR',
        'APOCALYPSE' // 게이지 채우기
      ];
    }
    
    // 메모라이즈 사용 가능하면 사용
    if (character.isInEquilibriumDelay && this.canUseSkill('MEMORIZE', character, simulation)) {
      return 'MEMORIZE';
    }
    
    // 우선순위 스킬 사용 가능 여부 확인
    for (const skillId of prioritySkills) {
      if (this.canUseSkill(skillId, character, simulation)) {
        return skillId;
      }
    }
    
    return null;
  }
  
  private canUseSkill(skillId: string, character: CharacterState, simulation: SimulationState): boolean {
    const skill = skills[skillId];
    if (!skill) return false;
    
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
    
    // 메모라이즈는 쿨타임이 되어야 사용
    if (skillId === 'MEMORIZE' && !simulation.memorizeAvailable) {
      return false;
    }
    
    return true;
  }
}

// 2분 주기에 맞춰 극딜 몰아쓰기 전략
export class BurstCyclePolicy implements SkillSelectionPolicy {
  private burstWindow: boolean = false;
  private burstStartTime: number = 0;
  private burstDuration: number = 40000; // 40초간 극딜
  
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 극딜 윈도우 체크/업데이트
    this.updateBurstWindow(simulation);
    
    // 2분 버프 사용 가능 상태에서 극딜 시작
    if (!this.burstWindow && 
        this.canUseSkill('HEROIC_OATH', character, simulation) && 
        this.canUseSkill('MAPLE_GODDESS_BLESSING', character, simulation)) {
      this.burstWindow = true;
      this.burstStartTime = simulation.currentTime;
      return 'HEROIC_OATH'; // 오쓰로 극딜 시작
    }
    
    // 극딜 중이라면 순서대로 사용
    if (this.burstWindow) {
      // 메용2 사용
      if (this.canUseSkill('MAPLE_GODDESS_BLESSING', character, simulation)) {
        return 'MAPLE_GODDESS_BLESSING';
      }
      
      // 오브 사용
      if (this.canUseSkill('LIBERATION_ORB_ACTIVE', character, simulation)) {
        return 'LIBERATION_ORB_ACTIVE';
      }
      
      // 6차 사용
      if (character.currentState === 'EQUILIBRIUM' && 
          this.canUseSkill('HARMONIC_PARADOX', character, simulation)) {
        return 'HARMONIC_PARADOX';
      }
    }
    
    // 이퀼리브리엄 진입 전 메모라이즈 판단
    if (character.isInEquilibriumDelay) {
      // 극딜 중이거나 메모라이즈 쿨이 돌았으면 바로 진입
      if (this.burstWindow && this.canUseSkill('MEMORIZE', character, simulation)) {
        return 'MEMORIZE';
      }
    }
    
    // 그 외에는 기본 정책과 같이 상태별 스킬 사용
    if (character.currentState === 'EQUILIBRIUM') {
      // 이퀼 상태에서는 문 -> 앱킬 우선
      if (this.canUseSkill('DOOR_OF_TRUTH', character, simulation)) {
        return 'DOOR_OF_TRUTH';
      }
      
      if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
        return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
      }
      
      if (this.canUseSkill('PUNISHING_RESONATOR', character, simulation)) {
        return 'PUNISHING_RESONATOR';
      }
      
      if (this.canUseSkill('TWILIGHT_NOVA', character, simulation)) {
        return 'TWILIGHT_NOVA';
      }
      
      if (this.canUseSkill('ABSOLUTE_KILL', character, simulation)) {
        return 'ABSOLUTE_KILL';
      }
    } else if (character.currentState === 'LIGHT') {
      // 빛 상태에서는 세례 > 노바 > 리소네이터 > 라리플 순서
      if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
        return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
      }
      
      if (this.canUseSkill('TWILIGHT_NOVA', character, simulation)) {
        return 'TWILIGHT_NOVA';
      }
      
      if (this.canUseSkill('PUNISHING_RESONATOR', character, simulation)) {
        return 'PUNISHING_RESONATOR';
      }
      
      return 'REFLECTION';
    } else {
      // 어둠 상태에서 세례 > 노바 > 리소네이터 > 아포 순서
      if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
        return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
      }
      
      if (this.canUseSkill('TWILIGHT_NOVA', character, simulation)) {
        return 'TWILIGHT_NOVA';
      }
      
      if (this.canUseSkill('PUNISHING_RESONATOR', character, simulation)) {
        return 'PUNISHING_RESONATOR';
      }
      
      return 'APOCALYPSE';
    }
    
    return null;
  }
  
  private updateBurstWindow(simulation: SimulationState) {
    if (this.burstWindow && simulation.currentTime - this.burstStartTime > this.burstDuration) {
      this.burstWindow = false;
    }
  }
  
  private canUseSkill(skillId: string, character: CharacterState, simulation: SimulationState): boolean {
    const skill = skills[skillId];
    if (!skill) return false;
    
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
    
    // 메모라이즈는 쿨타임이 되어야 사용
    if (skillId === 'MEMORIZE' && !simulation.memorizeAvailable) {
      return false;
    }
    
    return true;
  }
}

// 컨티링 효율 중시 전략
export class ContinuousRingPolicy implements SkillSelectionPolicy {
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 컨티링 활성화 여부 확인
    const isContinuousActive = character.isContinuousActive;
    
    // 컨티링 활성화 시 고데미지 스킬 우선 사용
    if (isContinuousActive) {
      // 우선 순위 스킬
      const prioritySkills = [
        // 버프 스킬
        'HEROIC_OATH',
        'MAPLE_GODDESS_BLESSING',
        
        // 고데미지 스킬
        'HARMONIC_PARADOX',
        'DOOR_OF_TRUTH',
        'BAPTISM_OF_LIGHT_AND_DARKNESS',
        'ABSOLUTE_KILL',
        'TWILIGHT_NOVA',
        'PUNISHING_RESONATOR'
      ];
      
      // 이퀼 아닐 때 메모라이즈 사용 가능하면 즉시 사용
      if (!character.currentState.includes('EQUILIBRIUM') && 
          this.canUseSkill('MEMORIZE', character, simulation)) {
        return 'MEMORIZE';
      }
      
      // 우선순위 스킬 사용 가능 여부 확인
      for (const skillId of prioritySkills) {
        if (this.canUseSkill(skillId, character, simulation)) {
          return skillId;
        }
      }
      
      // 상태별 기본 스킬 사용
      if (character.currentState === 'EQUILIBRIUM') {
        return 'ABSOLUTE_KILL';
      } else if (character.currentState === 'LIGHT') {
        return 'REFLECTION';
      } else {
        return 'APOCALYPSE';
      }
    } 
    // 컨티링 비활성화 시 게이지 충전 위주
    else {
      // 이퀼 상태에서는 게이지 충전 위주로
      if (character.currentState === 'EQUILIBRIUM') {
        if (character.nextState === 'LIGHT') {
          // 어둠 게이지 충전을 위해 아포 사용
          return 'APOCALYPSE';
        } else {
          // 빛 게이지 충전을 위해 라리플 사용
          return 'REFLECTION';
        }
      } 
      // 빛/어둠 상태에서도 게이지 충전 최우선
      else if (character.currentState === 'LIGHT') {
        return 'REFLECTION';
      } else {
        return 'APOCALYPSE';
      }
    }
    
    return null;
  }
  
  private canUseSkill(skillId: string, character: CharacterState, simulation: SimulationState): boolean {
    const skill = skills[skillId];
    if (!skill) return false;
    
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
    
    // 메모라이즈는 쿨타임이 되어야 사용
    if (skillId === 'MEMORIZE' && !simulation.memorizeAvailable) {
      return false;
    }
    
    return true;
  }
}

// 현실적인 플레이어 시뮬레이션 정책
export class RealisticPlayerPolicy implements SkillSelectionPolicy {
  private burstWindow: boolean = false;
  private burstStartTime: number = 0;
  private burstDuration: number = 40000; // 40초간 극딜
  private lastDecisionTime: number = 0;
  private humanReactionTime: number = 210; // 인간 반응 시간 (ms)
  private skillQueue: string[] = []; // 빠르게 연속으로 누르려는 스킬 큐
  
  selectNextSkill(character: CharacterState, simulation: SimulationState): string | null {
    // 인간 반응 시간을 시뮬레이션
    if (simulation.currentTime - this.lastDecisionTime < this.humanReactionTime) {
      return null;
    }
    
    // 큐에 스킬이 있으면 먼저 처리
    if (this.skillQueue.length > 0) {
      const nextSkill = this.skillQueue.shift() || null; // null로 변환
      if (nextSkill && this.canUseSkill(nextSkill, character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return nextSkill;
      }
    }
    
    // 극딜 윈도우 체크/업데이트
    this.updateBurstWindow(simulation);
    
    // 2분 버프 사용 가능 상태에서 극딜 시작
    if (!this.burstWindow && 
        this.canUseSkill('HEROIC_OATH', character, simulation) && 
        this.canUseSkill('MAPLE_GODDESS_BLESSING', character, simulation)) {
      this.burstWindow = true;
      this.burstStartTime = simulation.currentTime;
      
      // 극딜 시작시 스킬 순서를 큐에 넣음
      this.skillQueue.push('HEROIC_OATH', 'MAPLE_GODDESS_BLESSING', 'LIBERATION_ORB_ACTIVE');
      
      this.lastDecisionTime = simulation.currentTime;
      return this.skillQueue.shift();
    }
    
    // 이퀼 유예 상태에서 메모라이즈 판단
    if (character.isInEquilibriumDelay) {
      if (this.canUseSkill('MEMORIZE', character, simulation)) {
        // 극딜 중이거나 이퀼 진입이 유리한 상황이면 메모라이즈 사용
        if (this.burstWindow || 
            this.canUseSkill('HARMONIC_PARADOX', character, simulation) ||
            this.canUseSkill('DOOR_OF_TRUTH', character, simulation)) {
          this.lastDecisionTime = simulation.currentTime;
          return 'MEMORIZE';
        }
      }
    }
    
    // 이퀼 상태에서의 스킬 선택
    if (character.currentState === 'EQUILIBRIUM') {
      // 극딜 중이면 최대 데미지 우선
      if (this.burstWindow) {
        if (this.canUseSkill('HARMONIC_PARADOX', character, simulation)) {
          this.lastDecisionTime = simulation.currentTime;
          return 'HARMONIC_PARADOX';
        }
        
        if (this.canUseSkill('DOOR_OF_TRUTH', character, simulation)) {
          this.lastDecisionTime = simulation.currentTime;
          return 'DOOR_OF_TRUTH';
        }
        
        if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
          this.lastDecisionTime = simulation.currentTime;
          return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
        }
      }
      
      // 일반적인 이퀼 루틴
      if (this.canUseSkill('DOOR_OF_TRUTH', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'DOOR_OF_TRUTH';
      }
      
      if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
      }
      
      if (this.canUseSkill('PUNISHING_RESONATOR', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'PUNISHING_RESONATOR';
      }
      
      if (this.canUseSkill('TWILIGHT_NOVA', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'TWILIGHT_NOVA';
      }
      
      // 이퀼 중 게이지 충전도 가능한 상황이라면
      if (character.nextState === 'LIGHT' && character.darkGauge > 5000) {
        if (Math.random() > 0.7) { // 30% 확률로 게이지 채우기 시도
          this.lastDecisionTime = simulation.currentTime;
          return 'APOCALYPSE';
        }
      } else if (character.nextState === 'DARK' && character.lightGauge > 5000) {
        if (Math.random() > 0.7) { // 30% 확률로 게이지 채우기 시도
          this.lastDecisionTime = simulation.currentTime;
          return 'REFLECTION';
        }
      }
      
      // 앱킬 스팸
      this.lastDecisionTime = simulation.currentTime;
      return 'ABSOLUTE_KILL';
    } 
    // 빛 상태에서의 스킬 선택
    else if (character.currentState === 'LIGHT') {
      if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
      }
      
      if (this.canUseSkill('TWILIGHT_NOVA', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'TWILIGHT_NOVA';
      }
      
      if (this.canUseSkill('PUNISHING_RESONATOR', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'PUNISHING_RESONATOR';
      }
      
      this.lastDecisionTime = simulation.currentTime;
      return 'REFLECTION';
    } 
    // 어둠 상태에서의 스킬 선택
    else {
      if (this.canUseSkill('BAPTISM_OF_LIGHT_AND_DARKNESS', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'BAPTISM_OF_LIGHT_AND_DARKNESS';
      }
      
      if (this.canUseSkill('TWILIGHT_NOVA', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'TWILIGHT_NOVA';
      }
      
      if (this.canUseSkill('PUNISHING_RESONATOR', character, simulation)) {
        this.lastDecisionTime = simulation.currentTime;
        return 'PUNISHING_RESONATOR';
      }
      
      this.lastDecisionTime = simulation.currentTime;
      return 'APOCALYPSE';
    }
  }
  
  private updateBurstWindow(simulation: SimulationState) {
    if (this.burstWindow && simulation.currentTime - this.burstStartTime > this.burstDuration) {
      this.burstWindow = false;
    }
  }
  
  private canUseSkill(skillId: string, character: CharacterState, simulation: SimulationState): boolean {
    const skill = skills[skillId];
    if (!skill) return false;
    
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
    
    // 메모라이즈는 쿨타임이 되어야 사용
    if (skillId === 'MEMORIZE' && !simulation.memorizeAvailable) {
      return false;
    }
    
    return true;
  }
}