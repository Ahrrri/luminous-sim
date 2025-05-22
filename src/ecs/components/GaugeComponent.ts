// src/ecs/components/GaugeComponent.ts
import { BaseComponent } from '../core/Component';

export interface GaugeComponentData {
  lightGauge: number;
  darkGauge: number;
  maxGauge: number;
}

export class GaugeComponent extends BaseComponent {
  readonly type = 'gauge';
  
  constructor(
    public lightGauge: number = 0,
    public darkGauge: number = 0,
    public maxGauge: number = 10000
  ) {
    super();
  }

  getLightPercentage(): number {
    return (this.lightGauge / this.maxGauge) * 100;
  }

  getDarkPercentage(): number {
    return (this.darkGauge / this.maxGauge) * 100;
  }

  isLightFull(): boolean {
    return this.lightGauge >= this.maxGauge;
  }

  isDarkFull(): boolean {
    return this.darkGauge >= this.maxGauge;
  }

  chargeLightGauge(amount: number): void {
    this.lightGauge = Math.min(this.maxGauge, this.lightGauge + amount);
  }

  chargeDarkGauge(amount: number): void {
    this.darkGauge = Math.min(this.maxGauge, this.darkGauge + amount);
  }

  resetLightGauge(): void {
    this.lightGauge = 0;
  }

  resetDarkGauge(): void {
    this.darkGauge = 0;
  }

  clone(): GaugeComponent {
    return new GaugeComponent(this.lightGauge, this.darkGauge, this.maxGauge);
  }
}