// src/ecs/components/SkillComponent.ts
import { BaseComponent } from '../core/Component';

export interface SkillData {
  id: string;
  name: string;
  cooldown: number;
  maxCooldown: number;
  isAvailable: boolean;
  lastUsedTime?: number;
}

export interface SkillComponentData {
  skills: Map<string, SkillData>;
}

export class SkillComponent extends BaseComponent {
  readonly type = 'skill';
  
  public skills = new Map<string, SkillData>();

  constructor(skillsData?: SkillData[]) {
    super();
    if (skillsData) {
      skillsData.forEach(skill => {
        this.skills.set(skill.id, skill);
      });
    }
  }

  addSkill(skill: SkillData): void {
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

    skill.cooldown = skill.maxCooldown;
    skill.lastUsedTime = currentTime;
    return true;
  }

  updateCooldowns(deltaTime: number): void {
    this.skills.forEach(skill => {
      if (skill.cooldown > 0) {
        skill.cooldown = Math.max(0, skill.cooldown - deltaTime);
      }
    });
  }

  clone(): SkillComponent {
    const cloned = new SkillComponent();
    this.skills.forEach((skill, id) => {
      cloned.skills.set(id, { ...skill });
    });
    return cloned;
  }
}