// src/ecs/systems/SummonSystem.ts
import { System } from '../core/System';
import { SummonComponent } from '../components/SummonComponent';
import type { SummonData } from '../components/SummonComponent';
import { TimeComponent } from '../components/TimeComponent';
import { StateComponent } from '../components/StateComponent';
import { DamageSystem } from './DamageSystem';
import { GaugeSystem } from './GaugeSystem';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { SkillData, LuminousState } from '../../data/types/skillTypes';
import type { Entity, EntityId } from '../core/Entity';

export class SummonSystem extends System {
  readonly name = 'SummonSystem';

  update(deltaTime: number): void {
    const summonEntities = this.world.query(['summon', 'time']);
    
    summonEntities.forEach(entity => {
      const summonComp = this.world.getComponent<SummonComponent>(entity, 'summon');
      const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
      
      if (!summonComp || !timeComp) return;

      const currentTime = timeComp.currentTime;
      
      // 소환수 만료 확인
      if (summonComp.isExpired(currentTime)) {
        this.destroySummon(entity);
        return;
      }

      // 공격 가능한지 확인
      if (summonComp.canAttack(currentTime)) {
        this.performSummonAttack(entity, summonComp, currentTime);
      }

      // 동적 소환수 상태 업데이트 (퍼니싱용)
      if (summonComp.summonData.isDynamic) {
        this.updateDynamicSummonState(entity, summonComp);
      }
    });
  }

  // 소환수 생성
  createSummon(
    ownerEntity: Entity, 
    skillDef: SkillData, 
    currentTime: number
  ): Entity | null {
    if (!skillDef.summonDuration || !skillDef.summonAttackInterval) {
      return null;
    }

    const summonEntity = this.world.createEntity();
    
    // 소환수 데이터 생성
    const summonData: SummonData = {
      summonId: `${skillDef.id}_${Date.now()}`,
      skillId: skillDef.id,
      ownerId: ownerEntity.id,
      summonType: skillDef.summonType || 'instant',
      
      startTime: currentTime + (skillDef.summonDelay || skillDef.actionDelay || 600),
      endTime: currentTime + (skillDef.summonDelay || skillDef.actionDelay || 600) + skillDef.summonDuration,
      isActive: true,
      
      damage: skillDef.damage || 0,
      hitCount: skillDef.hitCount || 1,
      maxTargets: skillDef.maxTargets,
      attackInterval: skillDef.summonAttackInterval,
      lastAttackTime: currentTime + (skillDef.summonDelay || skillDef.actionDelay || 600),
      
      range: skillDef.summonRange || 600,
      
      additionalCritRate: skillDef.additionalCritRate,
      additionalIgnoreDefense: skillDef.additionalIgnoreDefense,
      
      isDynamic: skillDef.isDynamic,
      currentState: undefined
    };

    // 동적 스킬인 경우 초기 상태 설정
    if (skillDef.isDynamic) {
      const ownerStateComp = this.world.getComponent<StateComponent>(ownerEntity, 'state');
      if (ownerStateComp) {
        summonData.currentState = ownerStateComp.currentState;
      }
    }

    // 컴포넌트들 추가
    const summonComp = new SummonComponent(summonData);
    const timeComp = new TimeComponent();
    timeComp.currentTime = currentTime;

    this.world.addComponent(summonEntity, summonComp);
    this.world.addComponent(summonEntity, timeComp);

    // 소환 이벤트 발생
    this.world.emitEvent('summon:created', summonEntity, { 
      skillId: skillDef.id, 
      ownerId: ownerEntity.id,
      summonData 
    });

    console.log(`${skillDef.name} 소환수 생성: ${skillDef.summonDuration / 1000}초 지속`);

    return summonEntity;
  }

  // 소환수 공격 수행
  private performSummonAttack(
    summonEntity: Entity, 
    summonComp: SummonComponent, 
    currentTime: number
  ): void {
    const summonData = summonComp.summonData;
    
    // 소환수가 아직 활성화되지 않았으면 공격 안함
    if (currentTime < summonData.startTime) return;

    // 동적 스킬인 경우 현재 상태에 맞는 데미지/타수 가져오기
    let actualDamage = summonData.damage;
    let actualHitCount = summonData.hitCount;

    if (summonData.isDynamic && summonData.currentState) {
      const skillDef = LUMINOUS_SKILLS.find(s => s.id === summonData.skillId);
      if (skillDef && skillDef.getDynamicProperties) {
        const dynamicProps = skillDef.getDynamicProperties(summonData.currentState);
        actualDamage = dynamicProps.damage || summonData.damage;
        actualHitCount = dynamicProps.hitCount || summonData.hitCount;
      }
    }

    // 소환수 주인 찾기
    const ownerEntity = this.world.getAllEntities().find(e => e.id === summonData.ownerId);
    if (!ownerEntity) return;

    // 데미지 시스템을 통해 데미지 적용
    const damageSystem = this.world.getSystem<DamageSystem>('DamageSystem');
    if (damageSystem) {
      const totalDamage = damageSystem.calculateAndApplyDamage(
        ownerEntity,  // 데미지는 주인에게 기록
        summonData.skillId,
        actualDamage,
        actualHitCount,
        summonData.maxTargets,
        false
      );

      console.log(`${summonData.skillId} 소환수 공격: ${totalDamage.toLocaleString()} 데미지`);
    }

    // 공격 시간 업데이트
    summonComp.attack(currentTime);

    // 공격 이벤트 발생
    this.world.emitEvent('summon:attack', summonEntity, {
      damage: actualDamage,
      hitCount: actualHitCount,
      ownerId: summonData.ownerId
    });
  }

  // 동적 소환수 상태 업데이트
  private updateDynamicSummonState(summonEntity: Entity, summonComp: SummonComponent): void {
    const summonData = summonComp.summonData;
    
    // 소환수 주인의 현재 상태 가져오기
    const ownerEntity = this.world.getAllEntities().find(e => e.id === summonData.ownerId);
    if (!ownerEntity) return;

    const ownerStateComp = this.world.getComponent<StateComponent>(ownerEntity, 'state');
    if (!ownerStateComp) return;

    // 상태가 변경되었으면 업데이트
    if (summonData.currentState !== ownerStateComp.currentState) {
      summonComp.updateState(ownerStateComp.currentState);
      
      this.world.emitEvent('summon:state_changed', summonEntity, {
        oldState: summonData.currentState,
        newState: ownerStateComp.currentState
      });
    }
  }

  // 소환수 제거
  private destroySummon(summonEntity: Entity): void {
    const summonComp = this.world.getComponent<SummonComponent>(summonEntity, 'summon');
    
    if (summonComp) {
      console.log(`${summonComp.summonData.skillId} 소환수 만료`);
      
      this.world.emitEvent('summon:destroyed', summonEntity, {
        skillId: summonComp.summonData.skillId,
        ownerId: summonComp.summonData.ownerId
      });
    }

    this.world.destroyEntity(summonEntity);
  }

  // 특정 스킬의 소환수들 제거
  public destroySummonsBySkill(ownerId: EntityId, skillId: string): void {
    const summonEntities = this.world.query(['summon']);
    
    summonEntities.forEach(entity => {
      const summonComp = this.world.getComponent<SummonComponent>(entity, 'summon');
      if (summonComp && 
          summonComp.summonData.ownerId === ownerId && 
          summonComp.summonData.skillId === skillId) {
        this.destroySummon(entity);
      }
    });
  }
}