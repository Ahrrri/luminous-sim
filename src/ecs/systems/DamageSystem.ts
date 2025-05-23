// src/ecs/systems/DamageSystem.ts
import { System } from '../core/System';
import { DamageComponent } from '../components/DamageComponent';
import type { DamageRecord } from '../components/DamageComponent';
import { BuffComponent } from '../components/BuffComponent';
import { StatsComponent } from '../components/StatsComponent';
import { TimeComponent } from '../components/TimeComponent';
import { StateComponent } from '../components/StateComponent';
import { LUMINOUS_SKILLS } from '../../data/skills';

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
    maxTargets: number = 1,
    isVI: boolean = false
  ): number {
    const damageComp = this.world.getComponent<DamageComponent>(entity, 'damage');
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
    const statsComp = this.world.getComponent<StatsComponent>(entity, 'stats');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    
    if (!damageComp || !statsComp || !timeComp) return 0;

    // 스킬 데이터 가져오기
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) return 0;

    // 기본 데미지 계산
    let totalDamage = baseDamage * hitCount * maxTargets;

    // 이퀼리브리엄 상태 보너스
    if (stateComp && stateComp.currentState === 'EQUILIBRIUM') {
      // 이퀼리브리엄 스킬은 타수 2배
      if (skillDef.isEquilibriumSkill) {
        totalDamage *= 2;
      }
    }

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
    let critRate = stats.critRate;
    if (skillDef.additionalCritRate) {
      critRate = Math.min(100, critRate + skillDef.additionalCritRate);
    }
    
    const isCritical = Math.random() * 100 < critRate;
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

    // 빛과 어둠의 세례 특수 효과 처리
    this.handleBaptismEffect(entity, skillId, stateComp);

    return totalDamage;
  }

  // 빛과 어둠의 세례 쿨타임 감소 효과
  private handleBaptismEffect(entity: any, skillId: string, stateComp?: StateComponent): void {
    if (!stateComp || stateComp.currentState !== 'EQUILIBRIUM') return;

    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef || !skillDef.isEquilibriumSkill) return;

    // 트와일라잇 노바는 제외
    if (skillId === 'twilight_nova') return;

    // 빛과 어둠의 세례 쿨타임 2초 감소
    const skillSystem = this.world.getSystem<any>('SkillSystem');
    if (skillSystem) {
      skillSystem.reduceSkillCooldown(entity, 'baptism_of_light_and_darkness', 2000);
    }
  }
}