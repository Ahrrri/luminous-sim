// src/hooks/useSkillActions.ts
import { useCallback } from 'react';
import { useECS } from './useECS';
import type { Entity } from '../ecs/core/Entity';
import { SkillSystem } from '../ecs/systems/SkillSystem';
import { DamageSystem } from '../ecs/systems/DamageSystem';
import { GaugeSystem } from '../ecs/systems/GaugeSystem';
import { StateComponent } from '../ecs/components/StateComponent';
import type { SkillData } from '../data/types/skillTypes';

export function useSkillActions(entity: Entity | null, enemyEntity: Entity | null) {
  const { world } = useECS();

  const useSkill = useCallback((skillDef: SkillData) => {
    if (!entity || !enemyEntity) return false;

    // 시스템들 가져오기
    const skillSystem = world.getSystem<SkillSystem>('SkillSystem');
    const damageSystem = world.getSystem<DamageSystem>('DamageSystem');
    const gaugeSystem = world.getSystem<GaugeSystem>('GaugeSystem');
    const stateComp = world.getComponent<StateComponent>(entity, 'state');

    if (!skillSystem || !damageSystem || !gaugeSystem || !stateComp) {
      console.error('필요한 시스템들을 찾을 수 없습니다');
      return false;
    }

    // 동적 스킬인 경우 현재 상태에 맞는 속성들 가져오기
    let actualSkillData = skillDef;
    if (skillDef.isDynamic && skillDef.getDynamicProperties) {
      const dynamicProps = skillDef.getDynamicProperties(stateComp.currentState);
      actualSkillData = { ...skillDef, ...dynamicProps };
    }

    // 스킬 사용 시도
    if (skillSystem.tryUseSkill(entity, skillDef.id)) {
      // 데미지 계산 및 적용 (올바른 파라미터로 호출)
      if ((actualSkillData.damage || 0) > 0) {
        const totalDamage = damageSystem.calculateAndApplyDamage(
          entity,           // attackerEntity
          enemyEntity,      // targetEntity
          skillDef.id,      // skillId
          {                 // options
            actualTargetCount: actualSkillData.maxTargets || skillDef.maxTargets || 1
          }
        );

        console.log(`${skillDef.name} 사용: ${totalDamage.toLocaleString()} 데미지`);
      }

      // 게이지 충전 (동적 스킬의 경우 actualSkillData 사용)
      const gaugeChargeAmount = actualSkillData.gaugeCharge || skillDef.gaugeCharge;
      if (gaugeChargeAmount > 0) {
        gaugeSystem.chargeGauge(entity, skillDef.id, false);
      }

      return true;
    }

    console.log(`${skillDef.name} 사용 불가 (쿨다운 또는 조건 미충족)`);
    return false;
  }, [world, entity, enemyEntity]);

  return { useSkill };
}