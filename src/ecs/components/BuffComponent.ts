// src/ecs/components/BuffComponent.ts
import { BaseComponent } from '../core/Component';

export interface BuffData {
  id: string;
  name: string;
  duration: number;
  maxDuration: number;
  startTime: number;
  endTime: number;
  effects: {
    damageIncrease?: number;
    finalDamageIncrease?: number;
    bossDamageIncrease?: number;
    critRateIncrease?: number;
    critDamageIncrease?: number;
    ignoreDefenseIncrease?: number;
    cooldownReduction?: number;
  };
  stacks?: number;
  maxStacks?: number;
}

export class BuffComponent extends BaseComponent {
  readonly type = 'buff';
  
  public activeBuffs = new Map<string, BuffData>();

  constructor(buffs?: BuffData[]) {
    super();
    if (buffs) {
      buffs.forEach(buff => {
        this.activeBuffs.set(buff.id, buff);
      });
    }
  }

  addBuff(buff: BuffData): void {
    this.activeBuffs.set(buff.id, buff);
  }

  removeBuff(buffId: string): boolean {
    return this.activeBuffs.delete(buffId);
  }

  getBuff(buffId: string): BuffData | undefined {
    return this.activeBuffs.get(buffId);
  }

  hasBuff(buffId: string): boolean {
    return this.activeBuffs.has(buffId);
  }

  getExpiredBuffs(currentTime: number): BuffData[] {
    const expired: BuffData[] = [];
    this.activeBuffs.forEach(buff => {
      if (buff.endTime <= currentTime) {
        expired.push(buff);
      }
    });
    return expired;
  }

  removeExpiredBuffs(currentTime: number): BuffData[] {
    const expired = this.getExpiredBuffs(currentTime);
    expired.forEach(buff => {
      this.activeBuffs.delete(buff.id);
    });
    return expired;
  }

  getAllBuffs(): BuffData[] {
    return Array.from(this.activeBuffs.values());
  }

  clone(): BuffComponent {
    const cloned = new BuffComponent();
    this.activeBuffs.forEach((buff, id) => {
      cloned.activeBuffs.set(id, { ...buff, effects: { ...buff.effects } });
    });
    return cloned;
  }
}