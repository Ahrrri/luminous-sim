// src/engine/simulator.ts
// 시뮬레이션 엔진의 핵심 코드
import { CharacterState } from '../models/character';
import { SimulationState } from '../models/simulation';
import { skills } from '../models/skills';
import { buffs } from '../models/buffs';

export class SimulationEngine {
  private character: CharacterState;
  private simulation: SimulationState;
  private worker: Worker | null = null;
  private policy: SkillSelectionPolicy;
  
  constructor(character: CharacterState, simulation: SimulationState, policy: SkillSelectionPolicy) {
    this.character = character;
    this.simulation = simulation;
    this.policy = policy;
  }
  
  // Web Worker를 생성하고 시뮬레이션 시작
  startSimulation() {
    // Web Worker 로직 구현
  }
  
  pauseSimulation() {
    // 시뮬레이션 일시정지
  }
  
  stopSimulation() {
    // 시뮬레이션 중지 및 리소스 정리
  }
  
  // 한 타임스텝 실행
  simulateStep() {
    // 한 타임스텝(30ms) 동안의 상태 업데이트
  }
  
  // 쿨타임, 버프 등의 상태 업데이트
  updateState(elapsedTime: number) {
    // 상태 업데이트 로직
  }
  
  // 딜 계산
  calculateDamage(skillId: string): number {
    // 스킬 데미지 계산 로직
    return 0;
  }
}

// 스킬 선택 정책 인터페이스
export interface SkillSelectionPolicy {
  selectNextSkill(
    character: CharacterState,
    simulation: SimulationState
  ): string | null; // 다음에 사용할 스킬 ID 또는 대기(null)
}