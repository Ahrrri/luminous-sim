// src/ecs/systems/DamageSystem.ts
import { System } from '../core/System';
import { DamageComponent } from '../components/DamageComponent';
import type { DamageRecord } from '../components/DamageComponent';
import { BuffComponent } from '../components/BuffComponent';
import { StatsComponent } from '../components/StatsComponent';
import { TimeComponent } from '../components/TimeComponent';
import { StateComponent } from '../components/StateComponent';
import { SkillComponent } from '../components/SkillComponent';
import { LearnedSkillsComponent } from '../components/LearnedSkillsComponent';
import { SummonComponent } from '../components/SummonComponent';
import { EnemyStatsComponent } from '../components/EnemyStatsComponent';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { SkillData, LuminousState, SkillElement } from '../../data/types/skillTypes';

interface AdditionalHitInfo {
  hasAdditionalHit: boolean;
  multiplier: number;
}

interface DamageModifiers {
  // 기본 데미지 관련
  baseDamagePercent: number;        // 기본 퍼뎀%
  enhancedDamagePercent: number;    // 5차/6차 Override 적용된 퍼뎀%
  
  // 버프/스탯 배율들
  damageIncreaseMultiplier: number; // 데미지 증가% 배율
  bossDamageMultiplier: number;     // 보스 데미지% 배율
  finalDamageMultiplier: number;    // 최종 데미지% 배율
  
  // 크리티컬 관련
  totalCritRate: number;            // 최종 크리티컬 확률
  critDamageMultiplier: number;     // 크리티컬 데미지 배율
  
  // 방어 관련
  totalIgnoreDefense: number;       // 총 방어율 무시%
  totalIgnoreElementalResist: number; // 총 속성 저항 무시%
  
  // 기타
  masteryRange: { min: number; max: number }; // 숙련도 범위
}

interface ComprehensiveDamageResult {
  // 최종 결과
  totalDamage: number;
  effectiveHitCount: number;
  criticalHits: number;
  
  // 상세 계산 정보
  baseHitCount: number;
  additionalHitCount: number;
  hasAdditionalHit: boolean;
  
  // 각 단계별 계산값
  perHitDamageBeforeCrit: number;   // 크리 적용 전 1타 데미지
  perHitDamageAfterCrit: number;    // 크리 적용 후 1타 데미지
  additionalHitDamage: number;      // 추가타 1타 데미지
  
  // 적용된 배율들
  appliedModifiers: DamageModifiers;
  enemyReductions: {
    levelPenalty: number;
    defenseReduction: number;
    elementalReduction: number;
    totalReduction: number;
  };
  
  // 디버그 정보
  calculationLog: string[];
}

export class DamageSystem extends System {
  readonly name = 'DamageSystem';

  update(deltaTime: number): void {
    // 매 프레임 업데이트에서는 특별한 작업 없음
  }

  // 메인 데미지 계산 메서드 - 완전히 재설계
  calculateAndApplyDamage(
    attackerEntity: any,
    targetEntity: any,
    skillId: string,
    options: {
      isVI?: boolean;
      actualTargetCount?: number;
      forceAdditionalHit?: boolean; // 강제 추가타 (특수한 경우)
    } = {}
  ): number {
    const damageComp = this.world.getComponent<DamageComponent>(attackerEntity, 'damage');
    const timeComp = this.world.getComponent<TimeComponent>(attackerEntity, 'time');
    
    if (!damageComp || !timeComp) return 0;

    // 1. 기본 스킬 데이터 가져오기
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) {
      console.warn(`스킬을 찾을 수 없습니다: ${skillId}`);
      return 0;
    }

    // 2. 실제 시전자 찾기 (소환수인 경우 주인)
    const casterEntity = this.getActualOwner(attackerEntity);

    // 3. 종합적인 데미지 계산
    const result = this.calculateComprehensiveDamage(
      casterEntity,
      targetEntity,
      skillDef,
      options
    );

    // 4. 데미지 기록
    const damageRecord: DamageRecord = {
      skillId,
      damage: result.totalDamage,
      timestamp: timeComp.currentTime,
      isCritical: result.criticalHits > 0
    };

    damageComp.addDamage(damageRecord);

    // 5. 상세 데미지 이벤트 발생
    this.world.emitEvent('damage:dealt', attackerEntity, {
      ...damageRecord,
      effectiveHitCount: result.effectiveHitCount,
      targetCount: options.actualTargetCount || 1,
      detailedResult: result,
      calculationLog: result.calculationLog
    });

    // 6. 간접 스킬 및 특수 효과 처리
    this.handlePostDamageEffects(casterEntity, targetEntity, skillDef);

    return result.totalDamage;
  }

  // 종합적인 데미지 계산 - 모든 요소 통합
  private calculateComprehensiveDamage(
    casterEntity: any,
    targetEntity: any,
    skillDef: SkillData,
    options: { isVI?: boolean; actualTargetCount?: number; forceAdditionalHit?: boolean } = {}
  ): ComprehensiveDamageResult {
    const calculationLog: string[] = [];
    calculationLog.push(`=== ${skillDef.name} 데미지 계산 시작 ===`);

    // 1. 모든 컴포넌트 가져오기
    const casterStats = this.world.getComponent<StatsComponent>(casterEntity, 'stats');
    const casterState = this.world.getComponent<StateComponent>(casterEntity, 'state');
    const casterBuff = this.world.getComponent<BuffComponent>(casterEntity, 'buff');
    const learnedSkills = this.world.getComponent<LearnedSkillsComponent>(casterEntity, 'learnedSkills');
    const targetStats = this.world.getComponent<EnemyStatsComponent>(targetEntity, 'enemyStats');

    if (!casterStats || !targetStats) {
      calculationLog.push('ERROR: 필수 컴포넌트가 없습니다.');
      return this.createEmptyResult(calculationLog);
    }

    // 2. 강화 적용된 스킬 데이터 가져오기
    const enhancedSkillData = this.getEnhancedSkillData(skillDef, learnedSkills, casterState?.currentState);
    calculationLog.push(`기본 퍼뎀: ${skillDef.damage}% → 강화 후: ${enhancedSkillData.damage}%`);

    // 3. 추가타 정보 계산
    const additionalHitInfo = this.getAdditionalHitInfo(
      casterState?.currentState || 'LIGHT',
      skillDef.element,
      options.forceAdditionalHit
    );
    calculationLog.push(`추가타: ${additionalHitInfo.hasAdditionalHit ? `O (×${additionalHitInfo.multiplier})` : 'X'}`);

    // 4. 모든 데미지 수정자 계산
    const modifiers = this.calculateAllDamageModifiers(
      casterEntity,
      enhancedSkillData,
      casterStats,
      casterBuff,
      learnedSkills
    );
    calculationLog.push(`최종 퍼뎀: ${modifiers.enhancedDamagePercent}%`);
    calculationLog.push(`데미지 증가: ×${modifiers.damageIncreaseMultiplier.toFixed(3)}`);
    calculationLog.push(`보스 데미지: ×${modifiers.bossDamageMultiplier.toFixed(3)}`);
    calculationLog.push(`최종 데미지: ×${modifiers.finalDamageMultiplier.toFixed(3)}`);

    // 5. 적 방어력 계산
    const enemyReductions = targetStats.calculateDamageReduction(
      casterStats.stats.int >= 10000 ? 275 : 200, // 임시 레벨 계산
      modifiers.totalIgnoreDefense,
      modifiers.totalIgnoreElementalResist
    );
    calculationLog.push(`적 방어 감소: ×${enemyReductions.totalMultiplier.toFixed(3)}`);

    // 6. 실제 데미지 계산
    const baseHitCount = enhancedSkillData.hitCount || 1;
    const additionalHitCount = additionalHitInfo.hasAdditionalHit ? baseHitCount : 0;
    const effectiveHitCount = baseHitCount + additionalHitCount;

    // 기본 1타 데미지 (모든 배율 적용)
    let perHitDamageBeforeCrit = Math.floor(
      modifiers.enhancedDamagePercent *
      modifiers.damageIncreaseMultiplier *
      modifiers.bossDamageMultiplier *
      modifiers.finalDamageMultiplier *
      enemyReductions.totalMultiplier
    );

    // 숙련도 적용 (랜덤)
    const masteryMultiplier = this.rollMastery(modifiers.masteryRange);
    perHitDamageBeforeCrit = Math.floor(perHitDamageBeforeCrit * masteryMultiplier);
    calculationLog.push(`숙련도 적용: ×${masteryMultiplier.toFixed(3)} = ${perHitDamageBeforeCrit.toLocaleString()}`);

    // 크리티컬 판정 및 적용
    const isCritical = Math.random() * 100 < modifiers.totalCritRate;
    const perHitDamageAfterCrit = isCritical ? 
      Math.floor(perHitDamageBeforeCrit * modifiers.critDamageMultiplier) : 
      perHitDamageBeforeCrit;
    
    calculationLog.push(`크리티컬: ${isCritical ? `O (×${modifiers.critDamageMultiplier.toFixed(2)})` : 'X'} = ${perHitDamageAfterCrit.toLocaleString()}`);

    // 기본 타격들 총 데미지
    const baseHitsTotalDamage = perHitDamageAfterCrit * baseHitCount;

    // 추가타 데미지 계산
    let additionalHitDamage = 0;
    let additionalHitsTotalDamage = 0;
    
    if (additionalHitInfo.hasAdditionalHit) {
      additionalHitDamage = Math.floor(perHitDamageBeforeCrit * additionalHitInfo.multiplier);
      if (isCritical) {
        additionalHitDamage = Math.floor(additionalHitDamage * modifiers.critDamageMultiplier);
      }
      additionalHitsTotalDamage = additionalHitDamage * additionalHitCount;
      calculationLog.push(`추가타 데미지: ${additionalHitDamage.toLocaleString()} × ${additionalHitCount} = ${additionalHitsTotalDamage.toLocaleString()}`);
    }

    // 최종 결과
    const totalDamage = baseHitsTotalDamage + additionalHitsTotalDamage;
    calculationLog.push(`=== 최종 결과: ${totalDamage.toLocaleString()} ===`);

    return {
      totalDamage,
      effectiveHitCount,
      criticalHits: isCritical ? effectiveHitCount : 0,
      baseHitCount,
      additionalHitCount,
      hasAdditionalHit: additionalHitInfo.hasAdditionalHit,
      perHitDamageBeforeCrit,
      perHitDamageAfterCrit,
      additionalHitDamage,
      appliedModifiers: modifiers,
      enemyReductions: {
        levelPenalty: enemyReductions.levelPenalty,
        defenseReduction: enemyReductions.defenseReduction,
        elementalReduction: enemyReductions.elementalReduction,
        totalReduction: enemyReductions.totalMultiplier
      },
      calculationLog
    };
  }

  // LearnedSkillsComponent를 사용하여 강화된 스킬 데이터 가져오기
  private getEnhancedSkillData(
    baseSkillDef: SkillData, 
    learnedSkills?: LearnedSkillsComponent,
    currentState?: LuminousState
  ): SkillData {
    let enhancedData = { ...baseSkillDef };

    if (!learnedSkills) return enhancedData;

    // 1. 동적 스킬 처리 (트노바 등)
    if (baseSkillDef.isDynamic && baseSkillDef.getDynamicProperties && currentState) {
      const dynamicProps = baseSkillDef.getDynamicProperties(currentState);
      enhancedData = { ...enhancedData, ...dynamicProps };
    }

    // 2. 6차 마스터리 스킬 오버라이드 확인
    const masterySkillId = `${baseSkillDef.id}_mastery`;
    const masteryLevel = learnedSkills.getSkillLevel(masterySkillId);
    
    if (masteryLevel > 0) {
      const masterySkill = LUMINOUS_SKILLS.find(s => s.id === masterySkillId);
      
      if (masterySkill?.passiveEffects) {
        masterySkill.passiveEffects.forEach(effect => {
          if (effect.targetSkillId === baseSkillDef.id && effect.effectType === 'skill_override' && effect.overrideData) {
            // 각 속성별로 오버라이드 적용
            Object.entries(effect.overrideData).forEach(([property, values]) => {
              if (Array.isArray(values) && values[masteryLevel] !== null && values[masteryLevel] !== undefined) {
                // 동적 스킬의 상태별 속성 처리
                if (property.includes('Light') || property.includes('Dark') || property.includes('Equilibrium')) {
                  const statePrefix = property.replace('damage', '').toLowerCase();
                  if (currentState?.toLowerCase().includes(statePrefix)) {
                    enhancedData.damage = values[masteryLevel];
                  }
                } else {
                  // 일반 속성 오버라이드
                  (enhancedData as any)[property] = values[masteryLevel];
                }
              }
            });
          }
        });
      }
    }

    // 3. 5차 강화 배율 적용
    const fifthMultiplier = learnedSkills.getFifthEnhancementMultiplier(baseSkillDef.id);
    if (fifthMultiplier > 1 && enhancedData.damage) {
      enhancedData.damage = Math.floor(enhancedData.damage * fifthMultiplier);
    }

    return enhancedData;
  }

  // 모든 데미지 수정자 계산
  private calculateAllDamageModifiers(
    casterEntity: any,
    skillData: SkillData,
    statsComp: StatsComponent,
    buffComp?: BuffComponent,
    learnedSkills?: LearnedSkillsComponent
  ): DamageModifiers {
    const stats = statsComp.stats;
    
    // 1. 기본값들
    const baseDamagePercent = skillData.damage || 0;
    let enhancedDamagePercent = baseDamagePercent;

    // 2. 버프 효과들
    let damageIncreaseMultiplier = 1.0;
    let finalDamageMultiplier = 1.0;
    
    if (buffComp) {
      const buffs = buffComp.getAllBuffs();
      buffs.forEach(buff => {
        if (buff.effects.damageIncrease) {
          damageIncreaseMultiplier *= (1 + buff.effects.damageIncrease / 100);
        }
        if (buff.effects.finalDamageIncrease) {
          finalDamageMultiplier *= (1 + buff.effects.finalDamageIncrease / 100);
        }
      });
    }

    // 3. 패시브 강화 효과들
    if (learnedSkills) {
      // 6차 최종 데미지 보너스
      const sixthFinalDamage = learnedSkills.getSixthFinalDamageBonus(skillData.id);
      if (sixthFinalDamage > 0) {
        finalDamageMultiplier *= (1 + sixthFinalDamage / 100);
      }

      // 다른 스킬의 영향 (예: 라리VI → 앱킬 데미지 증가)
      const otherSkillBonus = learnedSkills.getAffectedSkillBonus(skillData.id);
      if (otherSkillBonus > 0) {
        enhancedDamagePercent += otherSkillBonus;
      }
    }

    // 4. 캐릭터 스탯들
    const bossDamageMultiplier = 1 + stats.bossDamage / 100;
    
    // 최종 데미지 (캐릭터 기본 스탯)
    if (stats.finalDamage) {
      finalDamageMultiplier *= (1 + stats.finalDamage / 100);
    }

    // 5. 크리티컬 관련
    let totalCritRate = stats.critRate;
    if (skillData.additionalCritRate) {
      totalCritRate = Math.min(100, totalCritRate + skillData.additionalCritRate);
    }
    const critDamageMultiplier = 1 + stats.critDamage / 100;

    // 6. 방어 관련
    let totalIgnoreDefense = stats.ignoreDefense;
    let totalIgnoreElementalResist = stats.ignoreElementalResist;
    
    if (skillData.additionalIgnoreDefense) {
      totalIgnoreDefense = Math.min(100, totalIgnoreDefense + skillData.additionalIgnoreDefense);
    }

    // 7. 숙련도 범위
    const masteryRange = {
      min: stats.mastery / 100,
      max: 1.0
    };

    return {
      baseDamagePercent,
      enhancedDamagePercent,
      damageIncreaseMultiplier,
      bossDamageMultiplier,
      finalDamageMultiplier,
      totalCritRate,
      critDamageMultiplier,
      totalIgnoreDefense,
      totalIgnoreElementalResist,
      masteryRange
    };
  }

  // 추가타 정보 계산
  private getAdditionalHitInfo(
    currentState: LuminousState,
    skillElement: SkillElement,
    forceAdditionalHit?: boolean
  ): AdditionalHitInfo {
    if (forceAdditionalHit) {
      return { hasAdditionalHit: true, multiplier: 1.0 };
    }

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

  // 숙련도 랜덤 롤
  private rollMastery(masteryRange: { min: number; max: number }): number {
    const range = masteryRange.max - masteryRange.min;
    return masteryRange.min + (Math.random() * range);
  }

  // 실제 소유자 찾기 (소환수 → 주인)
  private getActualOwner(entity: any): any {
    const summonComp = this.world.getComponent<SummonComponent>(entity, 'summon');
    if (summonComp) {
      // 소환수면 주인 반환
      return this.world.getAllEntities().find(e => e.id === summonComp.summonData.ownerId);
    }
    // 소환수가 아니면 자기 자신
    return entity;
  }

  // 빈 결과 생성
  private createEmptyResult(calculationLog: string[]): ComprehensiveDamageResult {
    return {
      totalDamage: 0,
      effectiveHitCount: 0,
      criticalHits: 0,
      baseHitCount: 0,
      additionalHitCount: 0,
      hasAdditionalHit: false,
      perHitDamageBeforeCrit: 0,
      perHitDamageAfterCrit: 0,
      additionalHitDamage: 0,
      appliedModifiers: {} as DamageModifiers,
      enemyReductions: {
        levelPenalty: 1,
        defenseReduction: 1,
        elementalReduction: 1,
        totalReduction: 1
      },
      calculationLog
    };
  }

  // 데미지 후 효과 처리 (간접 스킬, 특수 효과 등)
  private handlePostDamageEffects(casterEntity: any, targetEntity: any, skillDef: SkillData): void {
    const stateComp = this.world.getComponent<StateComponent>(casterEntity, 'state');
    
    // 간접 스킬 자동 발동
    this.triggerIndirectSkills(casterEntity, skillDef, stateComp);
    
    // 빛과 어둠의 세례 쿨타임 감소
    this.handleBaptismEffect(casterEntity, skillDef.id, skillDef, stateComp);
  }

  // 간접 스킬 자동 발동 처리
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
          // 간접 스킬은 단일 타겟으로 계산
          // TODO: 적절한 타겟 Entity 전달 필요
          console.log(`${indirectSkill.name} 자동 발동`);
          
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

  // UI/분석용 간단한 데미지 정보 계산
  public getSkillDamageInfo(
    casterEntity: any,
    targetEntity: any,
    skillId: string
  ): {
    skillName: string;
    baseDamage: number;
    enhancedDamage: number;
    modifiers: DamageModifiers;
    estimatedDamageRange: { min: number; max: number; average: number };
  } {
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) {
      return {
        skillName: 'Unknown',
        baseDamage: 0,
        enhancedDamage: 0,
        modifiers: {} as DamageModifiers,
        estimatedDamageRange: { min: 0, max: 0, average: 0 }
      };
    }

    const casterStats = this.world.getComponent<StatsComponent>(casterEntity, 'stats');
    const casterBuff = this.world.getComponent<BuffComponent>(casterEntity, 'buff');
    const learnedSkills = this.world.getComponent<LearnedSkillsComponent>(casterEntity, 'learnedSkills');
    const casterState = this.world.getComponent<StateComponent>(casterEntity, 'state');
    
    if (!casterStats) {
      return {
        skillName: skillDef.name,
        baseDamage: skillDef.damage || 0,
        enhancedDamage: skillDef.damage || 0,
        modifiers: {} as DamageModifiers,
        estimatedDamageRange: { min: 0, max: 0, average: 0 }
      };
    }

    const enhancedSkillData = this.getEnhancedSkillData(skillDef, learnedSkills, casterState?.currentState);
    const modifiers = this.calculateAllDamageModifiers(
      casterEntity,
      enhancedSkillData,
      casterStats,
      casterBuff,
      learnedSkills
    );

    // 대략적인 데미지 범위 계산 (크리/숙련도 고려)
    const baseCalculation = modifiers.enhancedDamagePercent * 
                          modifiers.damageIncreaseMultiplier * 
                          modifiers.bossDamageMultiplier * 
                          modifiers.finalDamageMultiplier;

    const minDamage = Math.floor(baseCalculation * modifiers.masteryRange.min);
    const maxDamage = Math.floor(baseCalculation * modifiers.masteryRange.max * modifiers.critDamageMultiplier);
    const averageDamage = Math.floor(baseCalculation * ((modifiers.masteryRange.min + modifiers.masteryRange.max) / 2) * 
                                   (1 + (modifiers.totalCritRate / 100) * (modifiers.critDamageMultiplier - 1)));

    return {
      skillName: skillDef.name,
      baseDamage: skillDef.damage || 0,
      enhancedDamage: enhancedSkillData.damage || 0,
      modifiers,
      estimatedDamageRange: { min: minDamage, max: maxDamage, average: averageDamage }
    };
  }
}