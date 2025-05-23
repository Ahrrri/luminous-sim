// src/ecs/components/EnhancementComponent.ts
import { BaseComponent } from '../core/Component';
import { ENHANCEMENT_DATA } from '../../data/enhancements/enhancementData';
import { LINEAR_PATTERNS, PREDEFINED_PATTERNS } from '../../data/enhancements/enhancementPatterns';
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

    // 5차 강화 계산
    if (enhancementData.fifth && setting.fifthLevel > 0) {
      applied.fifthMultiplier = 1 + (setting.fifthLevel * enhancementData.fifth.rate);
    }

    // 6차 강화 계산
    if (enhancementData.sixth && setting.sixthLevel > 0) {
      this.calculate6thEnhancement(applied, enhancementData.sixth, setting.sixthLevel);
    }

    this.appliedEnhancements.set(skillId, applied);
  }

  // 6차 강화 효과 계산
  private calculate6thEnhancement(applied: AppliedEnhancement, sixthData: any, level: number): void {
    switch (sixthData.type) {
      case 'final_damage':
        if (sixthData.pattern) {
          const levels = PREDEFINED_PATTERNS[sixthData.pattern as keyof typeof PREDEFINED_PATTERNS];
          applied.sixthFinalDamage = levels[level];
        } else if (sixthData.levels) {
          applied.sixthFinalDamage = sixthData.levels[level];
        }
        break;

      case 'damage_multiplier':
        if (sixthData.pattern) {
          const levels = PREDEFINED_PATTERNS[sixthData.pattern as keyof typeof PREDEFINED_PATTERNS];
          applied.fifthMultiplier *= (1 + levels[level] / 100);
        } else if (sixthData.levels) {
          applied.fifthMultiplier *= (1 + sixthData.levels[level] / 100);
        }
        break;

      case 'skill_data_override':
        if (sixthData.overrides) {
          applied.overriddenSkillData = {};
          Object.entries(sixthData.overrides).forEach(([key, config]: [string, any]) => {
            if (config.levels) {
              applied.overriddenSkillData![key] = config.levels[level];
            } else if (config.base !== undefined && config.increment !== undefined) {
              applied.overriddenSkillData![key] = Math.floor(config.base + (level * config.increment));
            }
          });
        }
        break;
    }
  }

  // 종속 스킬들 업데이트 (이터널/엔드리스)
  private updateDependentSkills(parentSkillId: string): void {
    Object.entries(ENHANCEMENT_DATA).forEach(([skillId, data]) => {
      if (data.sixth?.dependsOn === parentSkillId) {
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

    // 기본 퍼뎀에 5차/6차 배율 적용
    if (enhanced.damage && applied.fifthMultiplier !== 1) {
      enhanced.damage = Math.floor(enhanced.damage * applied.fifthMultiplier);
    }

    // 스킬 데이터 덮어쓰기 (VI 효과)
    if (applied.overriddenSkillData) {
      Object.assign(enhanced, applied.overriddenSkillData);
    }

    return enhanced;
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