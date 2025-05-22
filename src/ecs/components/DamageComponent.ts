// src/ecs/components/DamageComponent.ts
import { BaseComponent } from '../core/Component';

export interface DamageRecord {
  skillId: string;
  damage: number;
  timestamp: number;
  isCritical: boolean;
}

export class DamageComponent extends BaseComponent {
  readonly type = 'damage';
  
  public totalDamage: number = 0;
  public damageHistory: DamageRecord[] = [];

  constructor(initialDamage: number = 0) {
    super();
    this.totalDamage = initialDamage;
  }

  addDamage(record: DamageRecord): void {
    this.damageHistory.push(record);
    this.totalDamage += record.damage;
  }

  getDPS(timeWindow: number, currentTime: number): number {
    const windowStart = currentTime - timeWindow;
    const windowDamage = this.damageHistory
      .filter(record => record.timestamp >= windowStart)
      .reduce((sum, record) => sum + record.damage, 0);
    
    return windowDamage / (timeWindow / 1000);
  }

  getSkillDamageBreakdown(): Map<string, number> {
    const breakdown = new Map<string, number>();
    this.damageHistory.forEach(record => {
      const current = breakdown.get(record.skillId) || 0;
      breakdown.set(record.skillId, current + record.damage);
    });
    return breakdown;
  }

  reset(): void {
    this.totalDamage = 0;
    this.damageHistory.length = 0;
  }

  clone(): DamageComponent {
    const cloned = new DamageComponent(this.totalDamage);
    cloned.damageHistory = [...this.damageHistory];
    return cloned;
  }
}