// src/engine/simulator.ts
import simulationWorker from '../workers/simulation.worker.ts?worker';
import type { CharacterState } from '../models/character';
import type { SimulationState } from '../models/simulation';

// 인터페이스 정의
export interface SkillSelectionPolicy {
  selectNextSkill(
    character: CharacterState,
    simulation: SimulationState
  ): string | null; // 다음에 사용할 스킬 ID 또는 대기(null)
}

export class SimulationEngine {
  private worker: Worker | null = null;
  private isRunning: boolean = false;
  private listeners: {
    onDamage?: (damage: number, skill: string, time: number) => void;
    onStateChange?: (state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM', time: number) => void;
    onBuffChange?: (buffId: string, action: 'APPLIED' | 'EXPIRED', time: number) => void;
    onProgress?: (progress: number, currentTime: number, totalDamage: number) => void;
    onComplete?: (totalDamage: number, duration: number) => void;
  } = {};

  constructor(
    private character: CharacterState,
    private simulation: SimulationState,
    private policy: SkillSelectionPolicy
  ) {
    // Worker 생성
    this.worker = new simulationWorker();
    
    // Worker 메시지 처리
    this.worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'SKILL_USED':
          if (this.listeners.onDamage) {
            this.listeners.onDamage(data.damage, data.skillId, data.time);
          }
          break;
          
        case 'STATE_CHANGED':
          if (this.listeners.onStateChange) {
            this.listeners.onStateChange(data.state, data.time);
          }
          break;
          
        case 'BUFF_CHANGED':
          if (this.listeners.onBuffChange) {
            this.listeners.onBuffChange(data.buffId, data.action, data.time);
          }
          break;
          
        case 'PROGRESS':
          if (this.listeners.onProgress) {
            this.listeners.onProgress(data.progress, data.currentTime, data.totalDamage);
          }
          break;
          
        case 'COMPLETE':
          if (this.listeners.onComplete) {
            this.listeners.onComplete(data.totalDamage, data.currentTime);
          }
          this.isRunning = false;
          break;
      }
    };
    
    // Worker 오류 처리
    this.worker.onerror = (error) => {
      console.error('Worker 오류:', error);
      this.isRunning = false;
    };
  }

  // 리스너 등록 메서드들
  public setDamageListener(callback: (damage: number, skill: string, time: number) => void) {
    this.listeners.onDamage = callback;
  }

  public setStateChangeListener(callback: (state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM', time: number) => void) {
    this.listeners.onStateChange = callback;
  }

  public setBuffChangeListener(callback: (buffId: string, action: 'APPLIED' | 'EXPIRED', time: number) => void) {
    this.listeners.onBuffChange = callback;
  }
  
  public setProgressListener(callback: (progress: number, currentTime: number, totalDamage: number) => void) {
    this.listeners.onProgress = callback;
  }
  
  public setCompleteListener(callback: (totalDamage: number, duration: number) => void) {
    this.listeners.onComplete = callback;
  }

  // 시뮬레이션 시작
  startSimulation(duration: number = 300) {
    if (!this.worker) return;
    
    this.isRunning = true;
    
    // 정책 상태 추출 (간략화하여 전송)
    const policyData = {
      type: this.getPolicyType(),
      state: {} // 필요한 경우 정책 상태 추가
    };
    
    // Worker에 시작 메시지 전송
    this.worker.postMessage({
      type: 'START',
      data: {
        character: this.character,
        simulation: this.simulation,
        duration,
        policy: policyData
      }
    });
    
    console.log('시뮬레이션 시작 메시지 전송됨', duration);
  }

  // 시뮬레이션 일시 중지
  pauseSimulation() {
    if (!this.worker || !this.isRunning) return;
    
    this.isRunning = false;
    this.worker.postMessage({ type: 'PAUSE' });
    
    console.log('시뮬레이션 일시 중지됨');
  }

  // 시뮬레이션 재개
  resumeSimulation(duration: number = 300) {
    if (!this.worker || this.isRunning) return;
    
    this.isRunning = true;
    
    // 정책 상태 추출
    const policyData = {
      type: this.getPolicyType(),
      state: {} // 필요한 경우 정책 상태 추가
    };
    
    this.worker.postMessage({
      type: 'RESUME',
      data: {
        duration,
        policy: policyData
      }
    });
    
    console.log('시뮬레이션 재개됨');
  }

  // 시뮬레이션 정지
  stopSimulation() {
    if (!this.worker) return;
    
    this.isRunning = false;
    this.worker.postMessage({ type: 'STOP' });
    
    console.log('시뮬레이션 정지됨');
  }
  
  // Worker 종료
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      console.log('Worker 종료됨');
    }
  }
  
  // 정책 타입 결정 헬퍼 메서드
  private getPolicyType(): string {
    const policy = this.policy.constructor.name;
    
    if (policy.includes('Basic')) return 'basic';
    if (policy.includes('Equilibrium')) return 'equilibrium';
    if (policy.includes('Burst')) return 'burst';
    if (policy.includes('Continuous')) return 'continuous';
    if (policy.includes('Realistic')) return 'realistic';
    
    return 'basic';
  }
}