// src/ecs/systems/SkillSystem.ts
import { System } from '../core/System';
import { SkillComponent } from '../components/SkillComponent';
import { TimeComponent } from '../components/TimeComponent';

export class SkillSystem extends System {
  readonly name = 'SkillSystem';

  update(deltaTime: number): void {
    const entities = this.world.query(['skill', 'time']);
    
    entities.forEach(entity => {
      const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
      const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
      
      if (skillComp && timeComp) {
        skillComp.updateCooldowns(deltaTime);
      }
    });
  }

  // 스킬 사용 시도
  tryUseSkill(entity: any, skillId: string): boolean {
    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (!skillComp || !timeComp) return false;

    if (skillComp.useSkill(skillId, timeComp.currentTime)) {
      // 스킬 사용 성공 이벤트
      this.world.emitEvent('skill:used', entity, { skillId, time: timeComp.currentTime });
      return true;
    }
    
    return false;
  }
}