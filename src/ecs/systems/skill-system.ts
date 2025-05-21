// src/ecs/systems/skill-system.ts
import { System } from '../core/system';
import { World } from '../core/world';
import { Entity } from '../core/entity';
import { StatsComponent } from '../components/stats-component';
import { SkillsComponent } from '../components/skills-component';
import { CooldownComponent } from '../components/cooldown-component';

export class SkillSystem extends System {
  constructor(world: World) {
    super(world);
    
    // 스킬 사용 이벤트 구독
    this.world.events.subscribe('SKILL_USE', this.handleSkillUse.bind(this));
  }
  
  update(deltaTime: number): void {
    // 쿨타임 관리
    const entities = this.world.getEntitiesWith(CooldownComponent.TYPE);
    
    for (const entity of entities) {
      const cooldownComp = entity.getComponent<CooldownComponent>(CooldownComponent.TYPE)!;
      
      // 모든 활성 쿨타임 업데이트
      for (const [skillId, remaining] of Object.entries(cooldownComp.cooldowns)) {
        if (remaining > 0) {
          cooldownComp.cooldowns[skillId] = Math.max(0, remaining - deltaTime);
        }
      }
    }
  }
  
  private handleSkillUse(event: any): void {
    const { entityId, skillId } = event;
    const entity = this.world.getEntity(entityId);
    
    if (!entity || !this.canUseSkill(entity, skillId)) {
      return;
    }
    
    // 스킬 사용 처리
    this.executeSkill(entity, skillId);
  }
  
  private canUseSkill(entity: Entity, skillId: string): boolean {
    const skillsComp = entity.getComponent<SkillsComponent>(SkillsComponent.TYPE);
    const cooldownComp = entity.getComponent<CooldownComponent>(CooldownComponent.TYPE);
    
    if (!skillsComp || !cooldownComp) {
      return false;
    }
    
    // 스킬 존재 확인
    const skill = skillsComp.skills[skillId];
    if (!skill) {
      return false;
    }
    
    // 쿨타임 확인
    if (cooldownComp.cooldowns[skillId] > 0) {
      return false;
    }
    
    // 여기에 추가 조건 체크 (라크니스 상태 등)
    
    return true;
  }
  
  private executeSkill(entity: Entity, skillId: string): void {
    // 스킬 실행 로직
    // ...
    
    // 데미지 이벤트 발생
    this.world.events.publish({
      type: 'DAMAGE_CALCULATE',
      source: entity.id,
      skillId,
      timestamp: Date.now()
    });
  }
}