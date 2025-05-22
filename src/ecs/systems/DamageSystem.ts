// src/ecs/systems/DamageSystem.ts
import { System } from '../core/System';
import { DamageComponent } from '../components/DamageComponent';
import type { DamageRecord } from '../components/DamageComponent';
import { BuffComponent } from '../components/BuffComponent';
import { StatsComponent } from '../components/StatsComponent';
import { TimeComponent } from '../components/TimeComponent';

export class DamageSystem extends System {
  readonly name = 'DamageSystem';

  update(deltaTime: number): void {
    // 이 시스템은 주로 이벤트 기반으로 동작
    // 매 프레임 업데이트에서는 특별한 작업 없음
  }

  // 데미지 계산 및 적용
  calculateAndApplyDamage(
    entity: any,
    skillId: string,
    baseDamage: number,
    hitCount: number = 1,
    maxTargets: number = 1
  ): number {
    const damageComp = this.world.getComponent<DamageComponent>(entity, 'damage');
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
    const statsComp = this.world.getComponent<StatsComponent>(entity, 'stats');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (!damageComp || !statsComp || !timeComp) return 0;

    // 기본 데미지 계산
    let totalDamage = baseDamage * hitCount * maxTargets;

    // 버프 효과 적용
    if (buffComp) {
      const buffs = buffComp.getAllBuffs();
      buffs.forEach(buff => {
        if (buff.effects.damageIncrease) {
          totalDamage *= (1 + buff.effects.damageIncrease / 100);
        }
        if (buff.effects.finalDamageIncrease) {
          totalDamage *= (1 + buff.effects.finalDamageIncrease / 100);
        }
      });
    }

    // 캐릭터 스탯 효과 적용
    const stats = statsComp.stats;
    totalDamage *= (1 + stats.bossDamage / 100);

    // 크리티컬 계산
    const isCritical = Math.random() * 100 < stats.critRate;
    if (isCritical) {
      totalDamage *= (1 + stats.critDamage / 100);
    }

    // 데미지 기록
    const damageRecord: DamageRecord = {
      skillId,
      damage: totalDamage,
      timestamp: timeComp.currentTime,
      isCritical
    };

    damageComp.addDamage(damageRecord);

    // 데미지 이벤트 발생
    this.world.emitEvent('damage:dealt', entity, damageRecord);

    return totalDamage;
  }
}