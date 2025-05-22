// src/ecs/components/StatsComponent.ts
import { BaseComponent } from '../core/Component';

export interface CharacterStats {
  int: number;
  luk: number;
  magicAttack: number;
  bossDamage: number;
  critDamage: number;
  critRate: number;
  fifthEnhancement: number;
  sixthEnhancement: number;
  merLevel: number;
  buffDuration: number;
  cooldownReduction: number;
  continuousLevel: number;
  cooldownResetChance: number;
}

export class StatsComponent extends BaseComponent {
  readonly type = 'stats';
  
  constructor(public stats: CharacterStats) {
    super();
  }

  clone(): StatsComponent {
    return new StatsComponent({ ...this.stats });
  }
}