// src/ecs/components/BuffComponent.ts
import { BaseComponent } from '../core/Component';
import { calculateBuffDuration } from '../../utils/buffDurationUtils';
import { applyServerLagToBuffEnd } from '../../utils/serverLagUtils';

export interface BuffData {
  id: string;
  name: string;
  duration: number;          // 기본 지속시간
  actualDuration?: number;   // 벞지 적용된 실제 지속시간
  maxDuration: number;
  startTime: number;
  endTime: number;
  laggedEndTime?: number;    // 서버렉 적용된 종료시간
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
  ignoreBuffDuration?: boolean;  // 버프 지속시간 증가 무시 여부
  canApplyServerLag?: boolean;   // 서버렉 적용 가능 여부
}

export interface BuffComponentData {
  buffDurationIncrease: number;  // 벞지 %
  serverLagSettings: {
    enabled: boolean;
    probability: number;
    maxDuration: number;
  };
}

export class BuffComponent extends BaseComponent {
  readonly type = 'buff';
  
  public activeBuffs = new Map<string, BuffData>();
  private buffDurationIncrease: number = 0;
  private serverLagSettings = {
    enabled: false,
    probability: 30,
    maxDuration: 1000
  };

  constructor(buffs?: BuffData[], settings?: BuffComponentData) {
    super();
    if (settings) {
      this.buffDurationIncrease = settings.buffDurationIncrease;
      this.serverLagSettings = settings.serverLagSettings;
    }
    if (buffs) {
      buffs.forEach(buff => {
        this.addBuff(buff);
      });
    }
  }

  addBuff(buff: BuffData): void {
    // 버프 지속시간 증가 적용
    if (!buff.ignoreBuffDuration) {
      buff.actualDuration = calculateBuffDuration(
        buff.duration,
        this.buffDurationIncrease
      );
    } else {
      buff.actualDuration = buff.duration;
    }
    
    // 종료 시간 계산
    if (buff.startTime && buff.actualDuration) {
      buff.endTime = buff.startTime + buff.actualDuration;
      
      // 서버렉 적용
      if (buff.canApplyServerLag !== false) {
        buff.laggedEndTime = applyServerLagToBuffEnd(
          buff.endTime,
          this.serverLagSettings.enabled,
          this.serverLagSettings.probability,
          this.serverLagSettings.maxDuration
        );
      } else {
        buff.laggedEndTime = buff.endTime;
      }
    }
    
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
      const effectiveEndTime = buff.laggedEndTime || buff.endTime;
      if (effectiveEndTime <= currentTime) {
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

  // 버프 지속시간 증가 업데이트
  updateBuffDurationIncrease(newValue: number): void {
    this.buffDurationIncrease = newValue;
    // 기존 버프들은 영향받지 않음 (새로 적용되는 버프만)
  }

  // 서버렉 설정 업데이트
  updateServerLagSettings(settings: Partial<typeof this.serverLagSettings>): void {
    this.serverLagSettings = { ...this.serverLagSettings, ...settings };
  }

  clone(): BuffComponent {
    const cloned = new BuffComponent();
    cloned.buffDurationIncrease = this.buffDurationIncrease;
    cloned.serverLagSettings = { ...this.serverLagSettings };
    this.activeBuffs.forEach((buff, id) => {
      cloned.activeBuffs.set(id, { ...buff, effects: { ...buff.effects } });
    });
    return cloned;
  }
}