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
import type { CharacterStats } from '../data/types/characterTypes';
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
const convertToECSSkillData = (stats?: CharacterStats): ECSSkillData[] => {
  return LUMINOUS_SKILLS.map(skill => {
    // VI 스킬이 있으면 VI 쿨타임 사용, 없으면 기본 쿨타임
    const maxCooldown = skill.cooldownVI || skill.cooldown;
    
    return {
      id: skill.id,
      name: skill.name,
      cooldown: 0,
      maxCooldown: maxCooldown,
      isAvailable: true
    };
  });
};

export function useLuminousCharacter(characterStats?: CharacterStats): LuminousCharacterData | null {
  const { world } = useECS();
  const [character, setCharacter] = useState<LuminousCharacterData | null>(null);

  useEffect(() => {
    // 기본 스탯
    const defaultStats: CharacterStats = {
      int: 10000,
      luk: 1000,
      magicAttack: 2000,
      damagePercent: 0,
      bossDamage: 300,
      critRate: 100,
      critDamage: 85,
      ignoreDefense: 85,
      ignoreElementalResist: 0,
      weaponConstant: 1.2,
      mastery: 95,
      attackSpeed: 0,
      merLevel: 5,
      buffDuration: 50,
      cooldownReduction: 4,
      cooldownResetChance: 20,
      continuousLevel: 30,
      equilibriumMode: 'AUTO'
    };

    const stats = characterStats || defaultStats;

    // 루미너스 캐릭터 Entity 생성
    const entity = world.createEntity();

    // 기본 컴포넌트들 추가
    const stateComp = new StateComponent(
      'LIGHT',
      'DARK',
      false,
      undefined,
      stats.equilibriumMode,
      stats.buffDuration
    );
    
    const gaugeComp = new GaugeComponent();
    const skillComp = new SkillComponent(convertToECSSkillData(stats), stats);
    
    const buffComp = new BuffComponent([], {
      buffDurationIncrease: stats.buffDuration,
      serverLagSettings: {
        enabled: true,
        probability: 30,
        maxDuration: 1000
      }
    });
    
    const damageComp = new DamageComponent();
    const timeComp = new TimeComponent();
    const statsComp = new StatsComponent(stats);

    world.addComponent(entity, stateComp);
    world.addComponent(entity, gaugeComp);
    world.addComponent(entity, skillComp);
    world.addComponent(entity, buffComp);
    world.addComponent(entity, damageComp);
    world.addComponent(entity, timeComp);
    world.addComponent(entity, statsComp);

    // 이퀼리브리엄 진입시 이벤트 리스너 등록
    const onEquilibriumEnter = (eventType: string, e: Entity) => {
      if (e.id === entity.id) {
        const skillSystem = world.getSystem<any>('SkillSystem');
        if (skillSystem) {
          skillSystem.resetEquilibriumSkillUsage(entity);
        }
      }
    };

    world.on('state:entered_equilibrium', onEquilibriumEnter);

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
      world.off('state:entered_equilibrium', onEquilibriumEnter);
      world.destroyEntity(entity);
    };
  }, [world, characterStats]);

  return character;
}