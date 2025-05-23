// src/ecs/systems/DamageSystem.ts
import { System } from '../core/System';
import { DamageComponent } from '../components/DamageComponent';
import type { DamageRecord } from '../components/DamageComponent';
import { BuffComponent } from '../components/BuffComponent';
import { StatsComponent } from '../components/StatsComponent';
import { TimeComponent } from '../components/TimeComponent';
import { StateComponent } from '../components/StateComponent';
import { SkillComponent } from '../components/SkillComponent';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { SkillData } from '../../data/types/skillTypes';

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

    // 간접 스킬 자동 발동 처리
    this.triggerIndirectSkills(entity, skillDef, stateComp);

    // 빛과 어둠의 세례 특수 효과 처리
    this.handleBaptismEffect(entity, skillId, skillDef, stateComp);

    return totalDamage;
  }

  // 간접 스킬 자동 발동 처리
  private triggerIndirectSkills(entity: any, triggerSkill: SkillData, stateComp?: StateComponent): void {
    if (!stateComp) return;

    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (!skillComp || !timeComp) return;

    // 간접 스킬들 중에서 트리거 조건이 맞는 것들 찾기
    const indirectSkills = LUMINOUS_SKILLS.filter(skill => 
      skill.category === 'indirect_attack' && 
      skill.triggerConditions?.onSkillHit
    );

    indirectSkills.forEach(indirectSkill => {
      const trigger = indirectSkill.triggerConditions!.onSkillHit!;
      
      // 트리거 조건 확인
      let shouldTrigger = true;
      
      // 1. 속성 조건 확인
      if (trigger.elements && !trigger.elements.includes(triggerSkill.element)) {
        shouldTrigger = false;
      }
      
      // 2. 카테고리 조건 확인
      if (trigger.categories && !trigger.categories.includes(triggerSkill.category)) {
        shouldTrigger = false;
      }
      
      // 3. 상태 조건 확인
      if (trigger.requiredState && !trigger.requiredState.includes(stateComp.currentState)) {
        shouldTrigger = false;
      }
      
      // 4. 스킬 쿨타임 확인
      if (!skillComp.isSkillAvailable(indirectSkill.id)) {
        shouldTrigger = false;
      }
      
      if (shouldTrigger) {
        // 간접 스킬 발동 (캐스팅 체크 무시)
        if (skillComp.useSkill(indirectSkill.id, timeComp.currentTime)) {
          // 간접 스킬 데미지 계산 및 적용
          const indirectDamage = this.calculateAndApplyDamage(
            entity,
            indirectSkill.id,
            indirectSkill.damage || 0,
            indirectSkill.hitCount || 1,
            indirectSkill.maxTargets,
            false  // VI 아님
          );
          
          console.log(`${indirectSkill.name} 자동 발동: ${indirectDamage.toLocaleString()} 데미지`);
          
          // 게이지 충전 (간접 스킬도 게이지 충전 가능)
          const gaugeSystem = this.world.getSystem<any>('GaugeSystem');
          if (gaugeSystem) {
            gaugeSystem.chargeGauge(entity, indirectSkill.id, false);
          }
        }
      }
    });
  }

  // 빛과 어둠의 세례 쿨타임 감소 효과
  private handleBaptismEffect(entity: any, skillId: string, skillDef: SkillData, stateComp?: StateComponent): void {
    if (!stateComp || stateComp.currentState !== 'EQUILIBRIUM') return;

    if (!skillDef.isEquilibriumSkill) return;

    // 빛과 어둠의 세례 스킬 데이터 가져오기
    const baptismSkill = LUMINOUS_SKILLS.find(s => s.id === 'baptism_of_light_and_darkness');
    if (!baptismSkill || !baptismSkill.cooldownReductionOnEquilibriumSkill) return;

    const reductionConfig = baptismSkill.cooldownReductionOnEquilibriumSkill;
    
    // 제외 조건 확인
    let shouldReduce = true;
    
    // 1. 제외 스킬 목록 확인
    if (reductionConfig.excludeSkills && reductionConfig.excludeSkills.includes(skillId)) {
      shouldReduce = false;
    }
    
    // 2. 복잡한 제외 조건 확인
    if (reductionConfig.excludeConditions) {
      reductionConfig.excludeConditions.forEach(condition => {
        if (condition.skillId === skillId) {
          // 특정 상태에서만 제외하는 조건
          if (!condition.whenState || condition.whenState.includes(stateComp.currentState)) {
            shouldReduce = false;
          }
        }
      });
    }
    
    if (shouldReduce) {
      // 세례 쿨타임 감소
      const skillSystem = this.world.getSystem<any>('SkillSystem');
      if (skillSystem) {
        skillSystem.reduceSkillCooldown(entity, 'baptism_of_light_and_darkness', reductionConfig.amount);
      }
    }
  }
}