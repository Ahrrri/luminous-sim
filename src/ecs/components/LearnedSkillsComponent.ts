// src/ecs/components/LearnedSkillsComponent.ts
import { BaseComponent } from '../core/Component';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData } from '../../data/types/skillTypes';

export interface LearnedSkillData {
  skillId: string;
  level: number;
  maxLevel: number;
  learnedAt?: number;      // 습득 시간 (타임스탬프)
  category: 'active' | 'passive_reinforce' | 'passive_mastery' | 'passive_other';
}

export class LearnedSkillsComponent extends BaseComponent {
  readonly type = 'learnedSkills';
  
  private learnedSkills = new Map<string, LearnedSkillData>();

  constructor(initialSkills?: Map<string, LearnedSkillData>) {
    super();
    if (initialSkills) {
      this.learnedSkills = new Map(initialSkills);
    }
  }

  // 스킬 습득
  learnSkill(
    skillId: string, 
    level: number = 1, 
    category: LearnedSkillData['category'] = 'active',
    currentTime?: number
  ): boolean {
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) {
      console.warn(`존재하지 않는 스킬: ${skillId}`);
      return false;
    }

    const maxLevel = this.getMaxLevel(skillId, skillDef);
    const clampedLevel = Math.max(0, Math.min(level, maxLevel));

    if (clampedLevel === 0) {
      // 레벨 0이면 스킬 제거
      this.learnedSkills.delete(skillId);
      return true;
    }

    this.learnedSkills.set(skillId, {
      skillId,
      level: clampedLevel,
      maxLevel,
      learnedAt: currentTime || Date.now(),
      category
    });

    return true;
  }

  // 스킬 레벨 확인
  getSkillLevel(skillId: string): number {
    return this.learnedSkills.get(skillId)?.level || 0;
  }

  // 스킬 습득 여부 확인
  hasLearned(skillId: string): boolean {
    return this.learnedSkills.has(skillId) && this.getSkillLevel(skillId) > 0;
  }

  // 스킬 정보 가져오기
  getSkillData(skillId: string): LearnedSkillData | undefined {
    return this.learnedSkills.get(skillId);
  }

  // 모든 습득한 스킬 목록
  getAllLearnedSkills(): LearnedSkillData[] {
    return Array.from(this.learnedSkills.values());
  }

  // 카테고리별 스킬 목록
  getSkillsByCategory(category: LearnedSkillData['category']): LearnedSkillData[] {
    return this.getAllLearnedSkills().filter(skill => skill.category === category);
  }

  // 강화 설정으로부터 일괄 업데이트
  updateFromEnhancements(enhancements: SkillEnhancement[], currentTime?: number): void {
    // 기존 패시브 스킬들 제거 (액티브는 유지)
    const activeSkills = this.getSkillsByCategory('active');
    this.learnedSkills.clear();
    
    // 액티브 스킬들 복원
    activeSkills.forEach(skill => {
      this.learnedSkills.set(skill.skillId, skill);
    });

    // 모든 기본 액티브 스킬들 습득 (없으면 추가)
    LUMINOUS_SKILLS.filter(skill => skill.canDirectUse !== false && skill.category !== 'passive_enhancement')
      .forEach(skill => {
        if (!this.hasLearned(skill.id)) {
          this.learnSkill(skill.id, 1, 'active', currentTime);
        }
      });

    // 강화 기반 패시브 스킬들 습득
    enhancements.forEach(enhancement => {
      // 5차 강화 → 리인포스 패시브
      if (enhancement.fifthLevel > 0) {
        const reinforceSkillId = this.getReinforceSkillId(enhancement.skillId);
        if (reinforceSkillId) {
          this.learnSkill(reinforceSkillId, enhancement.fifthLevel, 'passive_reinforce', currentTime);
        }
      }

      // 6차 강화 → 마스터리 패시브
      if (enhancement.sixthLevel > 0) {
        const masterySkillId = this.getMasterySkillId(enhancement.skillId);
        if (masterySkillId) {
          this.learnSkill(masterySkillId, enhancement.sixthLevel, 'passive_mastery', currentTime);
        }
      }
    });

    // 종속 관계 처리 (이터널/엔드리스)
    this.handleDependentSkills(enhancements, currentTime);
  }

  // 5차 강화 스킬 ID 생성
  private getReinforceSkillId(baseSkillId: string): string | null {
    // 5차 강화가 가능한 스킬들만
    const baseSkill = LUMINOUS_SKILLS.find(s => s.id === baseSkillId);
    if (baseSkill && baseSkill.canEnhanceFifth !== false) {
      return `${baseSkillId}_reinforce`;
    }
    return null;
  }

  // 6차 마스터리 스킬 ID 생성
  private getMasterySkillId(baseSkillId: string): string | null {
    // 6차 강화가 가능한 스킬들만
    const baseSkill = LUMINOUS_SKILLS.find(s => s.id === baseSkillId);
    if (baseSkill && baseSkill.canEnhanceSixth !== false) {
      return `${baseSkillId}_mastery`;
    }
    return null;
  }

  // 종속 관계 처리 (이터널은 아포VI, 엔드리스는 라리VI 따라감)
  private handleDependentSkills(enhancements: SkillEnhancement[], currentTime?: number): void {
    const dependencies = [
      { dependent: 'eternal_lightness', parent: 'apocalypse' },
      { dependent: 'endless_darkness', parent: 'reflection' }
    ];

    dependencies.forEach(({ dependent, parent }) => {
      const parentEnhancement = enhancements.find(e => e.skillId === parent);
      if (parentEnhancement && parentEnhancement.sixthLevel > 0) {
        const dependentMasteryId = this.getMasterySkillId(dependent);
        if (dependentMasteryId) {
          this.learnSkill(dependentMasteryId, parentEnhancement.sixthLevel, 'passive_mastery', currentTime);
        }
      }
    });
  }

  // 스킬의 최대 레벨 결정
  private getMaxLevel(skillId: string, skillDef?: SkillData): number {
    if (!skillDef) {
      skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    }
    
    if (!skillDef) return 1;

    // 패시브 강화 스킬들의 최대 레벨
    if (skillId.endsWith('_reinforce')) {
      return skillDef.maxFifthLevel || 60;
    } else if (skillId.endsWith('_mastery')) {
      return skillDef.maxSixthLevel || 30;
    } else {
      // 일반 액티브 스킬은 기본 1레벨
      return skillDef.maxLevel || 1;
    }
  }

  // 특정 스킬의 효과 계산
  getSkillEffect(skillId: string, effectType: string): number {
    const skillData = this.getSkillData(skillId);
    if (!skillData) return 0;

    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef || !skillDef.effects || !skillDef.effects[effectType]) return 0;

    const effectArray = skillDef.effects[effectType];
    if (Array.isArray(effectArray) && effectArray.length > skillData.level) {
      return effectArray[skillData.level] || 0;
    }

    return 0;
  }

  // 5차 강화 배율 계산
  getFifthEnhancementMultiplier(baseSkillId: string): number {
    const reinforceSkillId = this.getReinforceSkillId(baseSkillId);
    if (!reinforceSkillId) return 1.0;

    const reinforceLevel = this.getSkillLevel(reinforceSkillId);
    if (reinforceLevel === 0) return 1.0;

    // 기본 2%씩 증가 (레벨 1 = 102%, 레벨 60 = 220%)
    return 1.0 + (reinforceLevel * 0.02);
  }

  // 6차 최종 데미지 보너스 계산
  getSixthFinalDamageBonus(baseSkillId: string): number {
    const masterySkillId = this.getMasterySkillId(baseSkillId);
    if (!masterySkillId) return 0;

    return this.getSkillEffect(masterySkillId, 'finalDamageIncrease');
  }

  // 다른 스킬에 미치는 영향 계산 (affectsOtherSkills)
  getAffectedSkillBonus(targetSkillId: string): number {
    let totalBonus = 0;

    // 모든 습득한 스킬 중에서 다른 스킬에 영향을 주는 것들 찾기
    this.getAllLearnedSkills().forEach(learnedSkill => {
      const skillDef = LUMINOUS_SKILLS.find(s => s.id === learnedSkill.skillId);
      if (skillDef && skillDef.affectsOtherSkills && skillDef.affectsOtherSkills[targetSkillId]) {
        const effect = skillDef.affectsOtherSkills[targetSkillId];
        if (effect.damageIncrease && Array.isArray(effect.damageIncrease)) {
          const bonus = effect.damageIncrease[learnedSkill.level] || 0;
          totalBonus += bonus;
        }
      }
    });

    return totalBonus;
  }

  // 스킬 레벨 설정 (외부에서 직접 호출용)
  setSkillLevel(skillId: string, level: number): boolean {
    const currentSkill = this.getSkillData(skillId);
    if (!currentSkill) {
      // 새로 습득
      return this.learnSkill(skillId, level);
    } else {
      // 레벨 업데이트
      const maxLevel = currentSkill.maxLevel;
      const clampedLevel = Math.max(0, Math.min(level, maxLevel));
      
      if (clampedLevel === 0) {
        this.learnedSkills.delete(skillId);
      } else {
        currentSkill.level = clampedLevel;
      }
      return true;
    }
  }

  // 디버그 정보
  getDebugInfo(): {
    totalSkills: number;
    activeSkills: number;
    passiveSkills: number;
    skillsList: LearnedSkillData[];
  } {
    const allSkills = this.getAllLearnedSkills();
    return {
      totalSkills: allSkills.length,
      activeSkills: this.getSkillsByCategory('active').length,
      passiveSkills: allSkills.filter(s => s.category.startsWith('passive')).length,
      skillsList: allSkills
    };
  }

  // 스킬 상태 요약
  getSkillSummary(): string {
    const active = this.getSkillsByCategory('active').length;
    const reinforce = this.getSkillsByCategory('passive_reinforce').length;
    const mastery = this.getSkillsByCategory('passive_mastery').length;
    
    return `Active: ${active}, Reinforce: ${reinforce}, Mastery: ${mastery}`;
  }

  // 복사
  clone(): LearnedSkillsComponent {
    const cloned = new LearnedSkillsComponent();
    this.learnedSkills.forEach((skill, id) => {
      cloned.learnedSkills.set(id, { ...skill });
    });
    return cloned;
  }

  // 초기화
  reset(): void {
    this.learnedSkills.clear();
  }

  // 직렬화
  serialize(): { [skillId: string]: LearnedSkillData } {
    const result: { [skillId: string]: LearnedSkillData } = {};
    this.learnedSkills.forEach((skill, id) => {
      result[id] = { ...skill };
    });
    return result;
  }

  // 역직렬화
  deserialize(data: { [skillId: string]: LearnedSkillData }): void {
    this.learnedSkills.clear();
    Object.entries(data).forEach(([skillId, skillData]) => {
      this.learnedSkills.set(skillId, { ...skillData });
    });
  }
}