// src/hooks/useSkillActions.ts
import { useCallback } from 'react';
import { useECS } from './useECS';
import type { Entity } from '../ecs/core/Entity';
import { SkillSystem } from '../ecs/systems/SkillSystem';
import { DamageSystem } from '../ecs/systems/DamageSystem';
import { GaugeSystem } from '../ecs/systems/GaugeSystem';

export interface SkillDefinition {
  id: string;
  name: string;
  icon: string;
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';
  damage: number;
  hitCount: number;
  maxTargets: number;
  gaugeCharge: number;
  cooldown: number;
}

export function useSkillActions(entity: Entity | null) {
  const world = useECS();

  const useSkill = useCallback((skillDef: SkillDefinition) => {
    if (!entity) return false;

    // 시스템들 가져오기
    const skillSystem = world.getSystem<SkillSystem>('SkillSystem');
    const damageSystem = world.getSystem<DamageSystem>('DamageSystem');
    const gaugeSystem = world.getSystem<GaugeSystem>('GaugeSystem');

    if (!skillSystem || !damageSystem || !gaugeSystem) {
      console.error('필요한 시스템들을 찾을 수 없습니다');
      return false;
    }

    // 스킬 사용 시도
    if (skillSystem.tryUseSkill(entity, skillDef.id)) {
      // 데미지 계산 및 적용
      const actualDamage = damageSystem.calculateAndApplyDamage(
        entity,
        skillDef.id,
        skillDef.damage,
        skillDef.hitCount,
        skillDef.maxTargets
      );

      console.log(`${skillDef.name} 사용: ${actualDamage.toLocaleString()} 데미지`);

      // 게이지 충전 (LIGHT나 DARK 스킬만)
      if (skillDef.element === 'LIGHT' || skillDef.element === 'DARK') {
        gaugeSystem.chargeGauge(entity, skillDef.element, skillDef.gaugeCharge);
      }

      return true;
    }

    console.log(`${skillDef.name} 사용 불가 (쿨다운 또는 조건 미충족)`);
    return false;
  }, [world, entity]);

  return { useSkill };
}