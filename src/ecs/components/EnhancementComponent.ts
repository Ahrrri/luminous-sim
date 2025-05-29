// src/ecs/components/EnhancementComponent.ts
import { BaseComponent } from '../core/Component';
import { ENHANCEMENT_DATA } from '../../data/enhancements/enhancementData';
import type { EnhancementSettings, AppliedEnhancement } from '../../data/enhancements/types';
import type { SkillData } from '../../data/types/skillTypes';

export class EnhancementComponent extends BaseComponent {
  readonly type = 'enhancement';
  
  private settings: EnhancementSettings = {};
  private appliedEnhancements = new Map<string, AppliedEnhancement>();

  constructor(initialSettings?: EnhancementSettings) {
    super();
    if (initialSettings) {
      this.updateSettings(initialSettings);
    }
  }

  // 강화 설정 업데이트
  updateSettings(newSettings: EnhancementSettings): void {
    this.settings = { ...newSettings };
    this.recalculateAllEnhancements();
  }

  // 특정 스킬의 강화 레벨 설정
  setSkillEnhancement(skillId: string, fifthLevel: number, sixthLevel: number): void {
    this.settings[skillId] = { fifthLevel, sixthLevel };
    this.recalculateEnhancement(skillId);
    
    // 종속 스킬들도 업데이트
    this.updateDependentSkills(skillId);
  }

  // 모든 강화 효과 재계산
  private recalculateAllEnhancements(): void {
    Object.keys(this.settings).forEach(skillId => {
      this.recalculateEnhancement(skillId);
    });
    
    // 종속 관계 처리
    Object.keys(this.settings).forEach(skillId => {
      this.updateDependentSkills(skillId);
    });
  }

  // 특정 스킬의 강화 효과 계산
  private recalculateEnhancement(skillId: string): void {
    const setting = this.settings[skillId];
    const enhancementData = ENHANCEMENT_DATA[skillId];
    
    if (!setting || !enhancementData) return;

    const applied: AppliedEnhancement = {
      skillId,
      fifthLevel: setting.fifthLevel,
      sixthLevel: setting.sixthLevel,
      fifthMultiplier: 1,
      overriddenSkillData: {}
    };

    // 5차 강화 계산 - 배열에서 직접 가져오기
    if (enhancementData.fifth && setting.fifthLevel > 0) {
      const fifthValue = enhancementData.fifth[setting.fifthLevel];
      if (fifthValue !== undefined && fifthValue !== null) {
        applied.fifthMultiplier = fifthValue / 100; // 120 → 1.2
      }
    }

    // 6차 강화 계산
    if (enhancementData.sixth && setting.sixthLevel > 0) {
      this.calculate6thEnhancement(applied, enhancementData.sixth, setting.sixthLevel);
    }

    this.appliedEnhancements.set(skillId, applied);
  }

  // 6차 강화 효과 계산
  private calculate6thEnhancement(applied: AppliedEnhancement, sixthData: any, level: number): void {
    // 배열 형태의 최종 데미지 증가 (세례, 퍼니싱 등)
    if (Array.isArray(sixthData)) {
      const finalDamage = sixthData[level];
      if (finalDamage !== undefined && finalDamage !== null) {
        applied.sixthFinalDamage = finalDamage;
      }
      return;
    }

    // 스킬 데이터 오버라이드 형태 (라리플, 아포, 앱킬 등)
    if (typeof sixthData === 'object' && sixthData !== null) {
      applied.overriddenSkillData = {};
      
      // 데미지 오버라이드
      if ('damage' in sixthData && Array.isArray(sixthData.damage)) {
        const overrideDamage = sixthData.damage[level];
        if (overrideDamage !== undefined && overrideDamage !== null) {
          applied.overriddenSkillData!.damage = overrideDamage;
        }
      }
      
      // 게이지 충전 오버라이드
      if ('gaugeCharge' in sixthData && Array.isArray(sixthData.gaugeCharge)) {
        const overrideGauge = sixthData.gaugeCharge[level];
        if (overrideGauge !== undefined && overrideGauge !== null) {
          applied.overriddenSkillData!.gaugeCharge = overrideGauge;
        }
      }
      
      // 쿨타임 오버라이드
      if ('cooldown' in sixthData && Array.isArray(sixthData.cooldown)) {
        const overrideCooldown = sixthData.cooldown[level];
        if (overrideCooldown !== undefined && overrideCooldown !== null) {
          applied.overriddenSkillData!.cooldown = overrideCooldown;
        }
      }
      
      // 추가 방어율 무시 오버라이드
      if ('additionalIgnoreDefense' in sixthData && Array.isArray(sixthData.additionalIgnoreDefense)) {
        const overrideIgnoreDef = sixthData.additionalIgnoreDefense[level];
        if (overrideIgnoreDef !== undefined && overrideIgnoreDef !== null) {
          applied.overriddenSkillData!.additionalIgnoreDefense = overrideIgnoreDef;
        }
      }
    }

    // 상태별 오버라이드 처리 (트와일라잇 노바)
    if (typeof sixthData === 'object' && sixthData !== null &&
        ('light' in sixthData || 'dark' in sixthData || 'equilibrium' in sixthData)) {
      // 상태별 데이터는 런타임에 현재 상태에 따라 결정되므로
      // 여기서는 메타데이터만 저장하고 실제 적용은 시뮬레이션에서
      applied.overriddenSkillData!.isDynamic = true;
      applied.overriddenSkillData!.dynamicData = sixthData;
    }
  }

  // 종속 스킬들 업데이트 (이터널/엔드리스)
  private updateDependentSkills(parentSkillId: string): void {
    Object.entries(ENHANCEMENT_DATA).forEach(([skillId, data]) => {
      // 종속 관계 확인 - 타입 안전하게
      if (data.dependsOn === parentSkillId) {
        // 부모 스킬의 6차 레벨을 가져와서 적용
        const parentSetting = this.settings[parentSkillId];
        if (parentSetting) {
          const currentSetting = this.settings[skillId] || { fifthLevel: 0, sixthLevel: 0 };
          this.settings[skillId] = {
            ...currentSetting,
            sixthLevel: parentSetting.sixthLevel // 부모의 6차 레벨을 따라감
          };
          this.recalculateEnhancement(skillId);
        }
      }
    });
  }

  // 강화된 스킬 데이터 가져오기
  getEnhancedSkillData(baseSkillData: SkillData): SkillData {
    const applied = this.appliedEnhancements.get(baseSkillData.id);
    if (!applied) return baseSkillData;

    const enhanced = { ...baseSkillData };

    // 기본 퍼뎀에 5차 배율 적용
    if (enhanced.damage && applied.fifthMultiplier !== 1) {
      enhanced.damage = Math.floor(enhanced.damage * applied.fifthMultiplier);
    }

    // 스킬 데이터 덮어쓰기 (VI 효과)
    if (applied.overriddenSkillData) {
      Object.assign(enhanced, applied.overriddenSkillData);
    }

    return enhanced;
  }

  // 다른 스킬에 미치는 영향 계산 (affectsOtherSkills)
  getAffectedSkillBonus(targetSkillId: string): number {
    let totalBonus = 0;
    
    Object.entries(ENHANCEMENT_DATA).forEach(([sourceSkillId, sourceData]) => {
      const sourceSetting = this.settings[sourceSkillId];
      if (sourceSetting && sourceSetting.sixthLevel > 0 && sourceData.sixth) {
        const sixthData = sourceData.sixth;
        
        // affectsOtherSkills 확인 - 타입 안전하게
        if (typeof sixthData === 'object' && !Array.isArray(sixthData) && 
            'affectsOtherSkills' in sixthData) {
          const affects = sixthData.affectsOtherSkills;
          if (affects && affects[targetSkillId]) {
            const skillEffect = affects[targetSkillId];
            if (skillEffect.damageIncrease && Array.isArray(skillEffect.damageIncrease)) {
              const increase = skillEffect.damageIncrease[sourceSetting.sixthLevel];
              if (increase !== undefined && increase !== null) {
                totalBonus += increase;
              }
            }
          }
        }
      }
    });
    
    return totalBonus;
  }

  // 특정 스킬의 적용된 강화 정보 가져오기
  getAppliedEnhancement(skillId: string): AppliedEnhancement | undefined {
    return this.appliedEnhancements.get(skillId);
  }

  // 모든 적용된 강화 정보 가져오기
  getAllAppliedEnhancements(): Map<string, AppliedEnhancement> {
    return new Map(this.appliedEnhancements);
  }

  // 최종 데미지 증가량 가져오기 (버프 시스템용)
  getFinalDamageIncrease(skillId: string): number {
    const applied = this.appliedEnhancements.get(skillId);
    return applied?.sixthFinalDamage || 0;
  }

  clone(): EnhancementComponent {
    const cloned = new EnhancementComponent();
    cloned.settings = { ...this.settings };
    cloned.appliedEnhancements = new Map(this.appliedEnhancements);
    return cloned;
  }
}