// src/ecs/systems/SkillSystem.ts
import { System } from '../core/System';
import { SkillComponent } from '../components/SkillComponent';
import { TimeComponent } from '../components/TimeComponent';
import { BuffComponent } from '../components/BuffComponent';
import { StateComponent } from '../components/StateComponent';
import { LUMINOUS_SKILLS } from '../../data/skills';

export class SkillSystem extends System {
  readonly name = 'SkillSystem';

  update(deltaTime: number): void {
    const entities = this.world.query(['skill', 'time']);
    
    entities.forEach(entity => {
      const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
      const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
      const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
      
      if (skillComp && timeComp) {
        // 프리드의 가호 1중첩 효과 확인
        const hasFreedBlessing = buffComp ? buffComp.hasBuff('freed_blessing_1') : false;
        skillComp.updateCooldowns(deltaTime, hasFreedBlessing);
      }
    });
  }

  // 스킬 사용 시도
  tryUseSkill(entity: any, skillId: string): boolean {
    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    
    if (!skillComp || !timeComp) return false;

    // 스킬 데이터 확인
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) return false;

    // 이퀼리브리엄 스킬 사용 가능 여부 체크
    if (skillDef.isEquilibriumSkill && stateComp) {
      if (stateComp.currentState !== 'EQUILIBRIUM') {
        console.log(`${skillDef.name}은(는) 이퀼리브리엄 상태에서만 사용 가능합니다.`);
        return false;
      }
    }

    // 스킬별 특수 조건 체크
    if (skillId === 'door_of_truth' && skillDef.usageLimit === 'once_per_equilibrium') {
      const skill = skillComp.getSkill(skillId);
      if (skill && skill.usageCount && skill.usageCount > 0) {
        console.log('진리의 문은 이퀼리브리엄당 1회만 사용 가능합니다.');
        return false;
      }
    }

    if (skillComp.useSkill(skillId, timeComp.currentTime)) {
      // 빛과 어둠의 세례 특수 효과: 이퀼 스킬 적중시 쿨타임 감소
      if (skillId === 'baptism_of_light_and_darkness') {
        this.setupBaptismCooldownReduction(entity);
      }
      
      // 스킬 사용 성공 이벤트
      this.world.emitEvent('skill:used', entity, { 
        skillId, 
        time: timeComp.currentTime,
        skillData: skillDef 
      });
      return true;
    }
    
    return false;
  }

  // 빛과 어둠의 세례 쿨타임 감소 효과 설정
  private setupBaptismCooldownReduction(entity: any): void {
    // 이퀼리브리엄 스킬 적중시 빛둠세 쿨타임 2초 감소 효과는
    // DamageSystem에서 처리 (스킬이 실제로 적중했을 때)
  }

  // 특정 스킬의 쿨타임 감소
  public reduceSkillCooldown(entity: any, skillId: string, reduction: number): void {
    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    if (!skillComp) return;
    
    const skill = skillComp.getSkill(skillId);
    if (skill && skill.cooldown > 0) {
      skill.cooldown = Math.max(0, skill.cooldown - reduction);
      this.world.emitEvent('skill:cooldown_reduced', entity, { skillId, reduction });
    }
  }

  // 특정 스킬의 쿨타임 초기화
  public resetSkillCooldown(entity: any, skillId: string): void {
    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    if (!skillComp) return;
    
    const skill = skillComp.getSkill(skillId);
    if (skill) {
      skill.cooldown = 0;
      this.world.emitEvent('skill:cooldown_reset', entity, { skillId });
    }
  }

  // 이퀼리브리엄 진입시 스킬 사용 횟수 초기화
  public resetEquilibriumSkillUsage(entity: any): void {
    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    if (!skillComp) return;
    
    // 진리의 문 사용 횟수 초기화
    const doorOfTruth = skillComp.getSkill('door_of_truth');
    if (doorOfTruth) {
      doorOfTruth.usageCount = 0;
    }
    
    // 빛과 어둠의 세례 쿨타임 초기화
    this.resetSkillCooldown(entity, 'baptism_of_light_and_darkness');
  }
}