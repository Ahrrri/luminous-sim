// src/ecs/systems/SkillSystem.ts
import { System } from '../core/System';
import { SkillComponent } from '../components/SkillComponent';
import { TimeComponent } from '../components/TimeComponent';
import { BuffComponent } from '../components/BuffComponent';
import { StateComponent } from '../components/StateComponent';
import { ActionDelayComponent } from '../components/ActionDelayComponent';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { SkillData } from '../../data/types/skillTypes';
import type { SummonSystem } from './SummonSystem';

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
  tryUseSkill(entity: any, skillId: string, ignoreCastingCheck: boolean = false): boolean {
    const skillComp = this.world.getComponent<SkillComponent>(entity, 'skill');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    const actionDelayComp = this.world.getComponent<ActionDelayComponent>(entity, 'actionDelay');

    if (!skillComp || !timeComp) return false;

    // 스킬 데이터 확인
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) return false;

    // 직접 사용 불가능한 스킬 확인
    if (skillDef.canDirectUse === false) {
      console.log(`${skillDef.name}은(는) 직접 사용할 수 없습니다.`);
      return false;
    }

    // 액션 딜레이 확인 (ignoreCastingCheck가 true면 무시)
    if (!ignoreCastingCheck && actionDelayComp && !this.canUseWhileActionDelay(entity, skillDef)) {
      const remainingDelay = actionDelayComp.getRemainingDelay(timeComp.currentTime);
      console.log(`액션 딜레이 중입니다. (${(remainingDelay / 1000).toFixed(2)}초 남음)`);
      return false;
    }

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
      // 액션 딜레이 시작 (간접 스킬이 아니고, 딜레이가 있는 경우)
      if (!ignoreCastingCheck && actionDelayComp && skillDef.category !== 'indirect_attack') {
        const actionDelay = skillDef.actionDelay || 600; // 기본 600ms
        actionDelayComp.startActionDelay(skillId, actionDelay, timeComp.currentTime);
      }

      // 소환 스킬인 경우 소환수 생성
      if (skillDef.category === 'summon') {
        this.handleSummonSkill(entity, skillDef, timeComp.currentTime);
      }

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

  // 소환 스킬 처리
  private handleSummonSkill(entity: any, skillDef: SkillData, currentTime: number): void {
    const summonSystem = this.world.getSystem<SummonSystem>('SummonSystem');
    if (!summonSystem) {
      console.error('SummonSystem을 찾을 수 없습니다.');
      return;
    }

    // 중복 소환수 제거 (예: 퍼니싱은 새로 시전하면 기존 것이 사라짐)
    if (skillDef.id === 'punishing_resonator' || skillDef.id === 'door_of_truth') {
      summonSystem.destroySummonsBySkill(entity.id, skillDef.id);
    }

    // 소환수 생성
    const summonEntity = summonSystem.createSummon(entity, skillDef, currentTime);
    
    if (summonEntity) {
      console.log(`${skillDef.name} 소환 시전 완료`);
    } else {
      console.error(`${skillDef.name} 소환 실패`);
    }
  }

  // 액션 딜레이 중에도 사용 가능한지 확인
  private canUseWhileActionDelay(entity: any, skillDef: SkillData): boolean {
    const actionDelayComp = this.world.getComponent<ActionDelayComponent>(entity, 'actionDelay');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');

    if (!actionDelayComp || !timeComp) return true;

    // 액션 딜레이가 활성화되지 않았으면 사용 가능
    if (!actionDelayComp.isActionDelayActive(timeComp.currentTime)) {
      return true;
    }

    // canUseWhileCasting이 true면 액션 딜레이 중에도 사용 가능
    if (skillDef.canUseWhileCasting) {
      // cannotUseWhileCasting 목록 확인
      if (skillDef.cannotUseWhileCasting &&
        skillDef.cannotUseWhileCasting.includes(actionDelayComp.currentActionSkillId)) {
        return false;
      }
      return true;
    }

    // 기본적으로는 액션 딜레이 중에는 사용 불가
    return false;
  }

  // 다른 스킬 사용 중에도 사용 가능한지 확인
  private canUseWhileCasting(entity: any, skillDef: SkillData): boolean {
    // TODO: 현재 캐스팅 중인 스킬 추적 시스템 구현 필요
    // 지금은 기본적으로 모든 스킬이 사용 가능하다고 가정

    // canUseWhileCasting이 true면 대부분 사용 가능
    if (skillDef.canUseWhileCasting) {
      // cannotUseWhileCasting 목록 확인
      if (skillDef.cannotUseWhileCasting) {
        // TODO: 현재 캐스팅 중인 스킬이 제외 목록에 있는지 확인
        // 현재는 구현하지 않음
      }
      return true;
    }

    // 기본적으로는 다른 스킬 사용 중에는 사용 불가
    // TODO: 현재 캐스팅 상태 확인 로직 구현
    return true; // 임시로 항상 true 반환
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