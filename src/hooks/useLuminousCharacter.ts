// src/hooks/useLuminousCharacter.ts
import { useEffect, useState } from 'react';
import { useECS } from './useECS';
import { Entity } from '../ecs/core/Entity';
import { StateComponent } from '../ecs/components/StateComponent';
import { GaugeComponent } from '../ecs/components/GaugeComponent';
import { SkillComponent } from '../ecs/components/SkillComponent';
import { BuffComponent } from '../ecs/components/BuffComponent';
import { DamageComponent } from '../ecs/components/DamageComponent';
import { TimeComponent } from '../ecs/components/TimeComponent';
import { StatsComponent } from '../ecs/components/StatsComponent';
import { LUMINOUS_SKILLS } from '../data/skills';
import type { CharacterStats } from '../ecs/components/StatsComponent';
import type { SkillData as ECSSkillData } from '../ecs/components/SkillComponent';

interface LuminousCharacterData {
  entity: Entity;
  state: StateComponent;
  gauge: GaugeComponent;
  skills: SkillComponent;
  buffs: BuffComponent;
  damage: DamageComponent;
  time: TimeComponent;
  stats: StatsComponent;
}

// 중앙화된 스킬 데이터를 ECS 스킬 데이터로 변환
const convertToECSSkillData = (): ECSSkillData[] => {
  return LUMINOUS_SKILLS.map(skill => ({
    id: skill.id,
    name: skill.name,
    cooldown: 0,
    maxCooldown: skill.cooldown,
    isAvailable: true
  }));
};

export function useLuminousCharacter(characterStats?: CharacterStats): LuminousCharacterData | null {
  const { world } = useECS();
  const [character, setCharacter] = useState<LuminousCharacterData | null>(null);

  useEffect(() => {
    // 루미너스 캐릭터 Entity 생성
    const entity = world.createEntity();

    // 기본 컴포넌트들 추가
    const stateComp = new StateComponent();
    const gaugeComp = new GaugeComponent();
    const skillComp = new SkillComponent(convertToECSSkillData()); // 중앙화된 스킬 데이터 사용
    const buffComp = new BuffComponent();
    const damageComp = new DamageComponent();
    const timeComp = new TimeComponent();
    const statsComp = new StatsComponent(characterStats || {
      int: 10000,
      luk: 1000,
      magicAttack: 2000,
      bossDamage: 300,
      critDamage: 85,
      critRate: 100,
      fifthEnhancement: 60,
      sixthEnhancement: 30,
      merLevel: 5,
      buffDuration: 50,
      cooldownReduction: 4,
      continuousLevel: 30,
      cooldownResetChance: 20
    });

    world.addComponent(entity, stateComp);
    world.addComponent(entity, gaugeComp);
    world.addComponent(entity, skillComp);
    world.addComponent(entity, buffComp);
    world.addComponent(entity, damageComp);
    world.addComponent(entity, timeComp);
    world.addComponent(entity, statsComp);

    setCharacter({
      entity,
      state: stateComp,
      gauge: gaugeComp,
      skills: skillComp,
      buffs: buffComp,
      damage: damageComp,
      time: timeComp,
      stats: statsComp
    });

    return () => {
      world.destroyEntity(entity);
    };
  }, [world]);

  return character;
}