// src/ecs/components/stats-component.ts
import { Component } from '../core/component';

export interface StatsData {
  int: number;
  luk: number;
  magicAttack: number;
  bossDamage: number;
  critRate: number;
  critDamage: number;
}

export class StatsComponent extends Component {
  static readonly TYPE = 'stats';
  readonly type = StatsComponent.TYPE;
  
  int: number;
  luk: number;
  magicAttack: number;
  bossDamage: number;
  critRate: number;
  critDamage: number;
  
  constructor(data: StatsData) {
    super();
    this.int = data.int;
    this.luk = data.luk;
    this.magicAttack = data.magicAttack;
    this.bossDamage = data.bossDamage;
    this.critRate = data.critRate;
    this.critDamage = data.critDamage;
  }
}