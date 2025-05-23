// src/ecs/components/StatsComponent.ts
import { BaseComponent } from '../core/Component';
import type { CharacterStats } from '../../data/types/characterTypes';

export class StatsComponent extends BaseComponent {
  readonly type = 'stats';
  
  constructor(public stats: CharacterStats) {
    super();
  }

  clone(): StatsComponent {
    return new StatsComponent({ ...this.stats });
  }
}