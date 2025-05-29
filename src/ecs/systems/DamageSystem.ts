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
import type { SkillData, LuminousState, SkillElement } from '../../data/types/skillTypes';

interface AdditionalHitInfo {
  hasAdditionalHit: boolean;
  multiplier: number;
}

interface SingleTargetDamageResult {
  damage: number;
  isCritical: boolean;
  effectiveHitCount: number;
  hasAdditionalHit: boolean;
}

export class DamageSystem extends System {
  readonly name = 'DamageSystem';

  update(deltaTime: number): void {
    // 매 프레임 업데이트에서는 특별한 작업 없음
  }

  // 추가타 정보 계산
  private getAdditionalHitInfo(currentState: LuminousState, skillElement: SkillElement): AdditionalHitInfo {
    if (skillElement === 'EQUILIBRIUM') {
      if (currentState === 'EQUILIBRIUM') {
        return { hasAdditionalHit: true, multiplier: 1.0 };
      } else {
        return { hasAdditionalHit: true, multiplier: 0.5 };
      }
    } else if (
      (currentState === 'LIGHT' && skillElement === 'LIGHT') ||
      (currentState === 'DARK' && skillElement === 'DARK')
    ) {
      return { hasAdditionalHit: true, multiplier: 0.5 };
    } else {
      return { hasAdditionalHit: false, multiplier: 0 };
    }
  }

  // 메인 데미지 계산 메서드
  calculateAndApplyDamage(
    entity: any,
    skillId: string,
    baseDamage: number,
    hitCount: number = 1,
    maxTargets: number = 1,
    isVI: boolean = false,
    actualTargetCount: number = 1 // 실제 타겟 수 (기본값 1 = 단일 타겟)
  ): number {
    const damageComp = this.world.getComponent<DamageComponent>(entity, 'damage');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (!damageComp || !timeComp) return 0;

    const effectiveTargets = Math.min(maxTargets, actualTargetCount);
    let totalDamageSum = 0;
    let totalEffectiveHitCount = 0;
    let anyCritical = false;

    // 각 타겟별로 독립적인 데미지 계산
    for (let targetIndex = 0; targetIndex < effectiveTargets; targetIndex++) {
      const singleResult = this.calculateSingleTargetDamage(
        entity, skillId, baseDamage, hitCount, targetIndex
      );
      
      totalDamageSum += singleResult.damage;
      totalEffectiveHitCount += singleResult.effectiveHitCount;
      if (singleResult.isCritical) anyCritical = true;
    }

    // 데미지 기록 (합계)
    const damageRecord: DamageRecord = {
      skillId,
      damage: totalDamageSum,
      timestamp: timeComp.currentTime,
      isCritical: anyCritical
    };

    damageComp.addDamage(damageRecord);

    // 데미지 이벤트 발생
    this.world.emitEvent('damage:dealt', entity, {
      ...damageRecord,
      effectiveHitCount: totalEffectiveHitCount,
      targetCount: effectiveTargets
    });

    // 간접 스킬 자동 발동 처리 (첫 번째 타겟 기준으로만)
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (skillDef) {
      const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
      this.triggerIndirectSkills(entity, skillDef, stateComp);
      this.handleBaptismEffect(entity, skillId, skillDef, stateComp);
    }

    return totalDamageSum;
  }

  // 단일 타겟에 대한 데미지 계산
  private calculateSingleTargetDamage(
    entity: any,
    skillId: string,
    baseDamage: number,
    hitCount: number,
    targetIndex: number = 0
  ): SingleTargetDamageResult {
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
    const statsComp = this.world.getComponent<StatsComponent>(entity, 'stats');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    
    if (!statsComp) {
      return {
        damage: 0,
        isCritical: false,
        effectiveHitCount: hitCount,
        hasAdditionalHit: false
      };
    }

    // 스킬 데이터 가져오기
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) {
      return {
        damage: 0,
        isCritical: false,
        effectiveHitCount: hitCount,
        hasAdditionalHit: false
      };
    }

    // 추가타 정보 계산
    let additionalHitInfo: AdditionalHitInfo = { hasAdditionalHit: false, multiplier: 0 };
    if (stateComp) {
      additionalHitInfo = this.getAdditionalHitInfo(stateComp.currentState, skillDef.element);
    }

    // 기본 데미지에 버프 및 스탯 적용
    let enhancedDamage = this.applyDamageModifiers(baseDamage, entity, skillDef, buffComp, statsComp);

    // 숙련도 적용 (85% ~ 100% 랜덤)
    const stats = statsComp.stats;
    const masteryMin = stats.mastery / 100;
    const masteryRange = 1.0 - masteryMin;
    const masteryMultiplier = masteryMin + (Math.random() * masteryRange);
    enhancedDamage = Math.floor(enhancedDamage * masteryMultiplier);

    // 크리티컬 판정 (타겟별로 독립)
    let critRate = stats.critRate;
    if (skillDef.additionalCritRate) {
      critRate = Math.min(100, critRate + skillDef.additionalCritRate);
    }
    const isCritical = Math.random() * 100 < critRate;

    // 총 데미지 및 타격수 계산
    let totalDamage = 0;
    let effectiveHitCount = 0;
    
    if (additionalHitInfo.hasAdditionalHit) {
      // 기본 타격
      const baseTotalDamage = enhancedDamage * hitCount;
      
      // 추가 타격
      const additionalDamage = Math.floor(enhancedDamage * additionalHitInfo.multiplier);
      const additionalTotalDamage = additionalDamage * hitCount;
      
      // 합계
      totalDamage = baseTotalDamage + additionalTotalDamage;
      effectiveHitCount = hitCount * 2;
    } else {
      totalDamage = enhancedDamage * hitCount;
      effectiveHitCount = hitCount;
    }

    // 크리티컬 데미지 적용
    if (isCritical) {
      totalDamage = Math.floor(totalDamage * (1 + stats.critDamage / 100));
    }

    return {
      damage: totalDamage,
      isCritical,
      effectiveHitCount,
      hasAdditionalHit: additionalHitInfo.hasAdditionalHit
    };
  }

  // 데미지 수정자 적용 (버프, 스탯 등)
  private applyDamageModifiers(
    baseDamage: number,
    entity: any,
    skillDef: SkillData,
    buffComp?: BuffComponent,
    statsComp?: StatsComponent
  ): number {
    let damage = baseDamage;

    // 버프 효과 적용
    if (buffComp) {
      const buffs = buffComp.getAllBuffs();
      buffs.forEach(buff => {
        if (buff.effects.damageIncrease) {
          damage *= (1 + buff.effects.damageIncrease / 100);
        }
        if (buff.effects.finalDamageIncrease) {
          damage *= (1 + buff.effects.finalDamageIncrease / 100);
        }
      });
    }

    // 캐릭터 스탯 효과 적용
    if (statsComp) {
      const stats = statsComp.stats;
      damage *= (1 + stats.bossDamage / 100);
      
      // 최종 데미지도 여기서 적용 가능
      if (stats.finalDamage) {
        damage *= (1 + stats.finalDamage / 100);
      }
    }

    return Math.floor(damage);
  }

  // 간접 스킬 자동 발동 처리 (기존과 동일, 단일 타겟으로 계산)
  private triggerIndirectSkills(entity: any, triggerSkill: SkillData, stateComp?: StateComponent): void {
    if (!stateComp) return;

    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (!skillComp || !timeComp) return;

    const indirectSkills = LUMINOUS_SKILLS.filter(skill => 
      skill.category === 'indirect_attack' && 
      skill.triggerConditions?.onSkillHit
    );

    indirectSkills.forEach(indirectSkill => {
      const trigger = indirectSkill.triggerConditions!.onSkillHit!;
      
      let shouldTrigger = true;
      
      if (trigger.elements && !trigger.elements.includes(triggerSkill.element)) {
        shouldTrigger = false;
      }
      
      if (trigger.categories && !trigger.categories.includes(triggerSkill.category)) {
        shouldTrigger = false;
      }
      
      if (trigger.requiredState && !trigger.requiredState.includes(stateComp.currentState)) {
        shouldTrigger = false;
      }
      
      if (!skillComp.isSkillAvailable(indirectSkill.id)) {
        shouldTrigger = false;
      }
      
      if (shouldTrigger) {
        if (skillComp.useSkill(indirectSkill.id, timeComp.currentTime)) {
          // 간접 스킬은 단일 타겟으로 계산 (actualTargetCount=1)
          const indirectDamage = this.calculateAndApplyDamage(
            entity,
            indirectSkill.id,
            indirectSkill.damage || 0,
            indirectSkill.hitCount || 1,
            indirectSkill.maxTargets,
            false,
            1 // 간접 스킬은 항상 단일 타겟
          );
          
          console.log(`${indirectSkill.name} 자동 발동: ${indirectDamage.toLocaleString()} 데미지`);
          
          const gaugeSystem = this.world.getSystem<any>('GaugeSystem');
          if (gaugeSystem) {
            gaugeSystem.chargeGauge(entity, indirectSkill.id, false);
          }
        }
      }
    });
  }

  // 빛과 어둠의 세례 쿨타임 감소 효과 (기존과 동일)
  private handleBaptismEffect(entity: any, skillId: string, skillDef: SkillData, stateComp?: StateComponent): void {
    if (!stateComp || stateComp.currentState !== 'EQUILIBRIUM') return;

    if (!skillDef.isEquilibriumSkill) return;

    const baptismSkill = LUMINOUS_SKILLS.find(s => s.id === 'baptism_of_light_and_darkness');
    if (!baptismSkill || !baptismSkill.cooldownReductionOnEquilibriumSkill) return;

    const reductionConfig = baptismSkill.cooldownReductionOnEquilibriumSkill;
    
    let shouldReduce = true;
    
    if (reductionConfig.excludeSkills && reductionConfig.excludeSkills.includes(skillId)) {
      shouldReduce = false;
    }
    
    if (reductionConfig.excludeConditions) {
      reductionConfig.excludeConditions.forEach(condition => {
        if (condition.skillId === skillId) {
          if (!condition.whenState || condition.whenState.includes(stateComp.currentState)) {
            shouldReduce = false;
          }
        }
      });
    }
    
    if (shouldReduce) {
      const skillSystem = this.world.getSystem<any>('SkillSystem');
      if (skillSystem) {
        skillSystem.reduceSkillCooldown(entity, 'baptism_of_light_and_darkness', reductionConfig.amount);
      }
    }
  }

  // UI용 단일 타겟 데미지 계산 (확정적 계산)
  public calculateDisplayDamage(
    entity: any,
    skillId: string,
    baseDamage: number,
    hitCount: number = 1
  ): {
    minDamage: number;
    maxDamage: number;
    averageDamage: number;
    effectiveHitCount: number;
  } {
    const result = this.calculateSingleTargetDamage(entity, skillId, baseDamage, hitCount, 0);
    
    // 숙련도와 크리티컬 범위 고려한 최소/최대값 계산
    const statsComp = this.world.getComponent<StatsComponent>(entity, 'stats');
    if (!statsComp) {
      return {
        minDamage: 0,
        maxDamage: 0,
        averageDamage: 0,
        effectiveHitCount: hitCount
      };
    }

    const stats = statsComp.stats;
    const masteryMin = stats.mastery / 100;
    const critMultiplier = 1 + stats.critDamage / 100;
    
    // 최소: 숙련도 최소, 크리 없음
    const minDamage = Math.floor(result.damage * masteryMin);
    
    // 최대: 숙련도 100%, 크리 발생
    const maxDamage = Math.floor(result.damage * critMultiplier);
    
    // 평균: 크리 확률 고려
    const critRate = Math.min(100, stats.critRate + (LUMINOUS_SKILLS.find(s => s.id === skillId)?.additionalCritRate || 0));
    const averageDamage = Math.floor(
      result.damage * (1 + (critRate / 100) * (stats.critDamage / 100))
    );

    return {
      minDamage,
      maxDamage,
      averageDamage,
      effectiveHitCount: result.effectiveHitCount
    };
  }
}