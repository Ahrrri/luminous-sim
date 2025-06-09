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
import { LearnedSkillsComponent } from '../ecs/components/LearnedSkillsComponent'; // EnhancementComponent 대체
import { ActionDelayComponent } from '../ecs/components/ActionDelayComponent';
import { EnemyStatsComponent } from '../ecs/components/EnemyStatsComponent';
// 데이터 타입들
import type { CharacterStats, SkillEnhancement } from '../data/types/characterTypes';
import type { SkillData as ECSSkillData } from '../ecs/components/SkillComponent';
import { LUMINOUS_SKILLS } from '../data/skills';

interface LuminousCharacterData {
  entity: Entity;
  state: StateComponent;
  gauge: GaugeComponent;
  skills: SkillComponent;
  buffs: BuffComponent;
  damage: DamageComponent;
  time: TimeComponent;
  stats: StatsComponent;
  learnedSkills: LearnedSkillsComponent; // enhancement 대체
  actionDelay: ActionDelayComponent;
  enemyEntity: Entity; // 전역 적 엔티티 추가
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

export function useLuminousCharacter(
  characterStats?: CharacterStats,
  skillEnhancements?: SkillEnhancement[]
): LuminousCharacterData | null {
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

    // 기본 스킬 강화 (모든 스킬 5차 60레벨, 6차 30레벨)
    const defaultEnhancements: SkillEnhancement[] = LUMINOUS_SKILLS.map(skill => ({
      skillId: skill.id,
      fifthLevel: 60,
      sixthLevel: 30
    }));

    const stats = characterStats || defaultStats;
    const enhancements = skillEnhancements || defaultEnhancements;

    // 루미너스 캐릭터 Entity 생성
    const entity = world.createEntity();
    
    // 전역 적 Entity 생성
    const enemyEntity = world.createEntity();
    const enemyStatsComp = new EnemyStatsComponent({
      level: 285,
      physicalDefense: 1200,
      magicalDefense: 1200,
      elementalResistances: {
        fire: 0,
        ice: 0,
        lightning: 0,
        poison: 0,
        holy: 0,
        dark: 0
      }
    });
    world.addComponent(enemyEntity, enemyStatsComp);

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
    const actionDelayComp = new ActionDelayComponent();
    const learnedSkillsComp = new LearnedSkillsComponent();
    
    // 1. 모든 액티브 스킬 습득
    LUMINOUS_SKILLS
      .filter(skill => skill.canDirectUse !== false && skill.category !== 'passive_enhancement')
      .forEach(skill => {
        learnedSkillsComp.learnSkill(skill.id, 1, 'active');
      });
    
    // 2. 강화 설정에 따라 패시브 스킬들 업데이트
    learnedSkillsComp.updateFromEnhancements(enhancements);

    world.addComponent(entity, stateComp);
    world.addComponent(entity, gaugeComp);
    world.addComponent(entity, skillComp);
    world.addComponent(entity, buffComp);
    world.addComponent(entity, damageComp);
    world.addComponent(entity, timeComp);
    world.addComponent(entity, statsComp);
    world.addComponent(entity, actionDelayComp);
    world.addComponent(entity, learnedSkillsComp);

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
      stats: statsComp,
      learnedSkills: learnedSkillsComp,
      actionDelay: actionDelayComp,
      enemyEntity
    });

    return () => {
      world.off('state:entered_equilibrium', onEquilibriumEnter);
      world.destroyEntity(entity);
      world.destroyEntity(enemyEntity);
    };
  }, [world, characterStats, skillEnhancements]);

  return character;
}