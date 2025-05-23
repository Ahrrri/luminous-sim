// src/ecs/components/StateComponent.ts
import { BaseComponent } from '../core/Component';
import { calculateEquilibriumDuration } from '../../utils/buffDurationUtils';

export type LuminousState = 'LIGHT' | 'DARK' | 'EQUILIBRIUM';

export interface StateComponentData {
  currentState: LuminousState;
  nextState: 'LIGHT' | 'DARK';
  isInEquilibriumDelay: boolean;
  equilibriumEndTime?: number;
  equilibriumMode: 'AUTO' | 'MANUAL';
  buffDurationIncrease?: number;  // 버프 지속시간 증가%
  isMemorizeEquilibrium?: boolean; // 메모라이즈로 발동된 이퀼인지
}

export class StateComponent extends BaseComponent {
  readonly type = 'state';
  
  constructor(
    public currentState: LuminousState = 'LIGHT',
    public nextState: 'LIGHT' | 'DARK' = 'DARK',
    public isInEquilibriumDelay: boolean = false,
    public equilibriumEndTime?: number,
    public equilibriumMode: 'AUTO' | 'MANUAL' = 'AUTO',
    public buffDurationIncrease: number = 0,
    public isMemorizeEquilibrium: boolean = false
  ) {
    super();
  }

  // 이퀼리브리엄 지속시간 계산
  getEquilibriumDuration(): number {
    return calculateEquilibriumDuration(this.buffDurationIncrease, this.isMemorizeEquilibrium);
  }

  // 이퀼리브리엄 진입
  enterEquilibrium(currentTime: number, isMemorize: boolean = false): void {
    this.currentState = 'EQUILIBRIUM';
    this.isInEquilibriumDelay = false;
    this.isMemorizeEquilibrium = isMemorize;
    
    const duration = calculateEquilibriumDuration(this.buffDurationIncrease, isMemorize);
    this.equilibriumEndTime = currentTime + duration;
  }

  // 이퀼리브리엄 종료
  exitEquilibrium(): void {
    this.currentState = this.nextState;
    this.isInEquilibriumDelay = false;
    this.equilibriumEndTime = undefined;
    this.isMemorizeEquilibrium = false;
    
    // 다음 상태 전환
    this.nextState = this.nextState === 'LIGHT' ? 'DARK' : 'LIGHT';
  }

  clone(): StateComponent {
    return new StateComponent(
      this.currentState,
      this.nextState,
      this.isInEquilibriumDelay,
      this.equilibriumEndTime,
      this.equilibriumMode,
      this.buffDurationIncrease,
      this.isMemorizeEquilibrium
    );
  }
}