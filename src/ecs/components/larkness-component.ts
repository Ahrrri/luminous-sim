// src/ecs/components/larkness-component.ts
import { Component } from '../core/component';

export type LarknessState = 'LIGHT' | 'DARK' | 'EQUILIBRIUM';

export interface LarknessData {
  currentState: LarknessState;
  nextState?: LarknessState;
  lightGauge: number;
  darkGauge: number;
  equilibriumMode: 'AUTO' | 'MANUAL';
  isInEquilibriumDelay?: boolean;
  equilibriumEndTime?: number;
}

export class LarknessComponent extends Component {
  static readonly TYPE = 'larkness';
  readonly type = LarknessComponent.TYPE;
  
  currentState: LarknessState;
  nextState: LarknessState;
  lightGauge: number;
  darkGauge: number;
  equilibriumMode: 'AUTO' | 'MANUAL';
  isInEquilibriumDelay: boolean;
  equilibriumEndTime?: number;
  
  constructor(data: LarknessData) {
    super();
    this.currentState = data.currentState;
    this.nextState = data.nextState || (data.currentState === 'LIGHT' ? 'DARK' : 'LIGHT');
    this.lightGauge = data.lightGauge;
    this.darkGauge = data.darkGauge;
    this.equilibriumMode = data.equilibriumMode;
    this.isInEquilibriumDelay = data.isInEquilibriumDelay || false;
    this.equilibriumEndTime = data.equilibriumEndTime;
  }
}