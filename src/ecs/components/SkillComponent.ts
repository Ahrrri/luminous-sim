// src/ecs/components/SkillComponent.ts
import { BaseComponent } from '../core/Component';
import { calculateActualCooldown, calculateCooldownResetChance } from '../../utils/cooldownUtils';
import type { CharacterStats } from '../../data/types/characterTypes';

export interface SkillData {
  id: string;
  name: string;
  cooldown: number;        // 현재 남은 쿨타임
  maxCooldown: number;     // 기본 최대 쿨타임
  actualMaxCooldown?: number; // 쿨감 적용된 실제 쿨타임
  isAvailable: boolean;
  lastUsedTime?: number;
  usageCount?: number;     // 사용 횟수 (진리의 문 등)
}

export interface SkillComponentData {
  skills: Map<string, SkillData>;
  characterStats?: CharacterStats;
}

export class SkillComponent extends BaseComponent {
  readonly type = 'skill';
  
  public skills = new Map<string, SkillData>();
  private characterStats?: CharacterStats;

  constructor(skillsData?: SkillData[], stats?: CharacterStats) {
    super();
    this.characterStats = stats;
    
    if (skillsData) {
      skillsData.forEach(skill => {
        // 쿨감 적용된 실제 쿨타임 계산
        if (stats) {
          skill.actualMaxCooldown = calculateActualCooldown(
            skill.maxCooldown,
            stats.merLevel,
            stats.cooldownReduction
          );
        } else {
          skill.actualMaxCooldown = skill.maxCooldown;
        }
        this.skills.set(skill.id, skill);
      });
    }
  }

  addSkill(skill: SkillData): void {
    if (this.characterStats) {
      skill.actualMaxCooldown = calculateActualCooldown(
        skill.maxCooldown,
        this.characterStats.merLevel,
        this.characterStats.cooldownReduction
      );
    }
    this.skills.set(skill.id, skill);
  }

  getSkill(skillId: string): SkillData | undefined {
    return this.skills.get(skillId);
  }

  isSkillAvailable(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    return skill ? skill.isAvailable && skill.cooldown <= 0 : false;
  }

  useSkill(skillId: string, currentTime: number): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || !this.isSkillAvailable(skillId)) {
      return false;
    }

    // 재사용 대기시간 미적용 확률 체크
    if (this.characterStats && calculateCooldownResetChance(this.characterStats.cooldownResetChance)) {
      // 쿨타임 미적용
      skill.cooldown = 0;
    } else {
      // 정상적으로 쿨타임 적용
      skill.cooldown = skill.actualMaxCooldown || skill.maxCooldown;
    }
    
    skill.lastUsedTime = currentTime;
    skill.usageCount = (skill.usageCount || 0) + 1;
    return true;
  }

  updateCooldowns(deltaTime: number, hasFreedBlessing: boolean = false): void {
    const cooldownReduction = hasFreedBlessing ? deltaTime * 1.1 : deltaTime; // 프리드 1중첩 효과
    
    this.skills.forEach(skill => {
      if (skill.cooldown > 0) {
        skill.cooldown = Math.max(0, skill.cooldown - cooldownReduction);
      }
    });
  }

  // 캐릭터 스탯 업데이트 시 쿨타임 재계산
  updateCharacterStats(stats: CharacterStats): void {
    this.characterStats = stats;
    this.skills.forEach(skill => {
      skill.actualMaxCooldown = calculateActualCooldown(
        skill.maxCooldown,
        stats.merLevel,
        stats.cooldownReduction
      );
    });
  }

  clone(): SkillComponent {
    const cloned = new SkillComponent();
    cloned.characterStats = this.characterStats;
    this.skills.forEach((skill, id) => {
      cloned.skills.set(id, { ...skill });
    });
    return cloned;
  }
}