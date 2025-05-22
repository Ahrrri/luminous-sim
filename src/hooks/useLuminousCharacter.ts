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
import type { CharacterStats } from '../ecs/components/StatsComponent';
import type { SkillData } from '../ecs/components/SkillComponent';

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

// 기본 스킬 데이터 정의
const DEFAULT_SKILLS: SkillData[] = [
  { id: 'reflection', name: '라이트 리플렉션', cooldown: 0, maxCooldown: 0, isAvailable: true },
  { id: 'apocalypse', name: '아포칼립스', cooldown: 0, maxCooldown: 0, isAvailable: true },
  { id: 'absolute_kill', name: '앱솔루트 킬', cooldown: 0, maxCooldown: 10000, isAvailable: true },
  { id: 'door_of_truth', name: '진리의 문', cooldown: 0, maxCooldown: 0, isAvailable: true },
  { id: 'baptism', name: '빛과 어둠의 세례', cooldown: 0, maxCooldown: 30000, isAvailable: true },
  { id: 'nova', name: '트와일라잇 노바', cooldown: 0, maxCooldown: 15000, isAvailable: true },
  { id: 'punishing', name: '퍼니싱 리소네이터', cooldown: 0, maxCooldown: 30000, isAvailable: true },
  { id: 'heroic_oath', name: '히어로즈 오쓰', cooldown: 0, maxCooldown: 120000, isAvailable: true },
];

export function useLuminousCharacter(characterStats?: CharacterStats): LuminousCharacterData | null {
  const world = useECS();
  const [character, setCharacter] = useState<LuminousCharacterData | null>(null);

  useEffect(() => {
    // 루미너스 캐릭터 Entity 생성
    const entity = world.createEntity();

    // 기본 컴포넌트들 추가
    const stateComp = new StateComponent();
    const gaugeComp = new GaugeComponent();
    const skillComp = new SkillComponent(DEFAULT_SKILLS); // 기본 스킬들 추가
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