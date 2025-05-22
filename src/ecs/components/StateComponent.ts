// src/ecs/components/StateComponent.ts
import { BaseComponent } from '../core/Component';

export type LuminousState = 'LIGHT' | 'DARK' | 'EQUILIBRIUM';

export interface StateComponentData {
  currentState: LuminousState;
  nextState: 'LIGHT' | 'DARK';
  isInEquilibriumDelay: boolean;
  equilibriumEndTime?: number;
  equilibriumMode: 'AUTO' | 'MANUAL';
}

export class StateComponent extends BaseComponent {
  readonly type = 'state';
  
  constructor(
    public currentState: LuminousState = 'LIGHT',
    public nextState: 'LIGHT' | 'DARK' = 'DARK',
    public isInEquilibriumDelay: boolean = false,
    public equilibriumEndTime?: number,
    public equilibriumMode: 'AUTO' | 'MANUAL' = 'AUTO'
  ) {
    super();
  }

  clone(): StateComponent {
    return new StateComponent(
      this.currentState,
      this.nextState,
      this.isInEquilibriumDelay,
      this.equilibriumEndTime,
      this.equilibriumMode
    );
  }
}