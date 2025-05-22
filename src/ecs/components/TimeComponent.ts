// src/ecs/components/TimeComponent.ts
import { BaseComponent } from '../core/Component';

export class TimeComponent extends BaseComponent {
  readonly type = 'time';
  
  constructor(
    public currentTime: number = 0,
    public deltaTime: number = 0,
    public timeScale: number = 1
  ) {
    super();
  }

  update(newTime: number): void {
    this.deltaTime = (newTime - this.currentTime) * this.timeScale;
    this.currentTime = newTime;
  }

  clone(): TimeComponent {
    return new TimeComponent(this.currentTime, this.deltaTime, this.timeScale);
  }
}