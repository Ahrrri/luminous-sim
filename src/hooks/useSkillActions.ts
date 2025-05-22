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

    // 시스템들 가져오기 - 수정된 방법
    const skillSystem = world.getSystem<SkillSystem>('SkillSystem');
    const damageSystem = world.getSystem<DamageSystem>('DamageSystem');
    const gaugeSystem = world.getSystem<GaugeSystem>('GaugeSystem');

    if (!skillSystem || !damageSystem || !gaugeSystem) return false;

    // 스킬 사용 시도
    if (skillSystem.tryUseSkill(entity, skillDef.id)) {
      // 데미지 계산
      damageSystem.calculateAndApplyDamage(
        entity,
        skillDef.id,
        skillDef.damage,
        skillDef.hitCount,
        skillDef.maxTargets
      );

      // 게이지 충전
      if (skillDef.element !== 'NONE' && skillDef.element !== 'EQUILIBRIUM') {
        gaugeSystem.chargeGauge(entity, skillDef.element, skillDef.gaugeCharge);
      }

      return true;
    }

    return false;
  }, [world, entity]);

  return { useSkill };
}