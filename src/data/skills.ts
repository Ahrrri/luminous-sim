// src/data/skills.ts
import type { SkillData, SkillCategory, LuminousState } from './types/skillTypes';

export const LUMINOUS_SKILLS: SkillData[] = [
  // ==================== 4차 액티브 스킬 ====================
  
  // 라이트 리플렉션
  {
    id: 'reflection',
    name: '라이트 리플렉션',
    icon: '☀️',
    iconPath: '/skill-icons/reflection.png',
    element: 'LIGHT',
    category: 'direct_attack',
    damage: 440,
    hitCount: 4,
    maxTargets: 8,
    gaugeCharge: 409,
    gaugeChargeVI: 450,
    cooldown: 0,
    actionDelay: 600,
    description: '빛의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'Q',
    isEquilibriumSkill: false,
    canDirectUse: true,
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: true,
    canEnhanceSixth: true,
  },

  // 아포칼립스
  {
    id: 'apocalypse',
    name: '아포칼립스',
    icon: '🌙',
    iconPath: '/skill-icons/apocalypse.png',
    element: 'DARK',
    category: 'direct_attack',
    damage: 375,
    hitCount: 7,
    maxTargets: 8,
    gaugeCharge: 430,
    gaugeChargeRecharge: 464,
    gaugeChargeVI: 520,
    gaugeChargeVIRecharge: 562,
    cooldown: 0,
    description: '어둠의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'W',
    isEquilibriumSkill: false,
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: true,
    canEnhanceSixth: true,
  },

  // 앱솔루트 킬
  {
    id: 'absolute_kill',
    name: '앱솔루트 킬',
    icon: '⚡',
    iconPath: '/skill-icons/absolute_kill.png',
    element: 'EQUILIBRIUM',
    category: 'direct_attack',
    damage: 455,
    hitCount: 7,
    maxTargets: 2,
    gaugeCharge: 0,
    cooldown: 12000,
    cooldownVI: 10000,
    description: '이퀼리브리엄 상태에서 재사용 대기시간이 없어지는 강력한 스킬',
    defaultKeyBinding: 'E',
    isEquilibriumSkill: true,
    additionalCritRate: 100,
    additionalIgnoreDefense: 40,
    additionalIgnoreDefenseVI: 45,
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: true,
    canEnhanceSixth: true,
  },

  // 트와일라잇 노바
  {
    id: 'twilight_nova',
    name: '트와일라잇 노바',
    icon: '💥',
    iconPath: '/skill-icons/twilight_nova.png',
    element: 'NONE',
    category: 'direct_attack',
    maxTargets: 8,
    gaugeCharge: 346,
    cooldown: 15000,
    description: '라크니스 상태에 따라 변화하는 폭발 스킬',
    defaultKeyBinding: 'S',
    isEquilibriumSkill: false,
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 5차 강화 없음
    canEnhanceSixth: true,
    isDynamic: true,
    getDynamicProperties: (state: LuminousState) => {
      switch(state) {
        case 'LIGHT':
        case 'DARK':
          return { 
            damage: 1200,
            hitCount: 7,
            element: state,
            gaugeCharge: 346
          };
        case 'EQUILIBRIUM':
          return { 
            damage: 450,
            hitCount: 6,
            element: 'EQUILIBRIUM',
            gaugeCharge: 346
          };
        default:
          return { damage: 450, hitCount: 6 };
      }
    },
  },

  // ==================== 5차 액티브 스킬 ====================

  // 진리의 문
  {
    id: 'door_of_truth',
    name: '진리의 문',
    icon: '🚪',
    iconPath: '/skill-icons/door_of_truth.png',
    element: 'NONE',
    category: 'summon',
    damage: 990,
    hitCount: 10,
    maxTargets: 12,
    gaugeCharge: 0,
    cooldown: 0,
    actionDelay: 600,
    description: '이퀼리브리엄 진입 시 1회만 사용 가능한 설치기',
    defaultKeyBinding: 'R',
    isEquilibriumSkill: false,
    usageLimit: 'once_per_equilibrium',
    summonType: 'placed',
    summonDuration: 30000,
    summonAttackInterval: 300,
    summonRange: 800,
    summonDelay: 600,
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 5차 강화 없음
    canEnhanceSixth: true,
  },

  // 빛과 어둠의 세례
  {
    id: 'baptism_of_light_and_darkness',
    name: '빛과 어둠의 세례',
    icon: '✨',
    iconPath: '/skill-icons/baptism_of_light_and_darkness.png',
    element: 'NONE',
    category: 'summon',
    damage: 660,
    hitCount: 7,
    attackCount: 13,
    maxTargets: 1,
    gaugeCharge: 0,
    cooldown: 30000,
    actionDelay: 600,
    description: '이퀼리브리엄 스킬 적중시 쿨타임 2초 감소, 이퀼 진입시 초기화',
    defaultKeyBinding: 'A',
    isEquilibriumSkill: false,
    additionalCritRate: 100,
    additionalIgnoreDefense: 100,
    cooldownReductionOnEquilibriumSkill: {
      amount: 2000,
      excludeConditions: [
        {
          skillId: 'twilight_nova',
          whenState: ['EQUILIBRIUM']
        }
      ]
    },
    summonType: 'instant',
    summonDuration: 10000,
    summonAttackInterval: 770,
    summonRange: 600,
    summonDelay: 600,
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 5차 강화 없음
    canEnhanceSixth: true,
  },

  // 퍼니싱 리소네이터
  {
    id: 'punishing_resonator',
    name: '퍼니싱 리소네이터',
    icon: '🎵',
    iconPath: '/skill-icons/punishing_resonator.png',
    element: 'NONE',
    category: 'summon',
    maxTargets: 10,
    gaugeCharge: 0,
    cooldown: 30000,
    actionDelay: 600,
    duration: 6000,
    description: '실시간으로 라크니스 상태가 적용되는 설치기',
    defaultKeyBinding: 'D',
    isEquilibriumSkill: false,
    additionalCritRate: 15,
    summonType: 'placed',
    summonDuration: 6000,
    summonAttackInterval: 210,
    summonRange: 700,
    summonDelay: 600,
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 5차 강화 없음
    canEnhanceSixth: true,
    isDynamic: true,
    getDynamicProperties: (state: LuminousState) => {
      switch(state) {
        case 'LIGHT':
          return { damage: 1155, hitCount: 4 };
        case 'DARK':
          return { damage: 935, hitCount: 5 };
        case 'EQUILIBRIUM':
          return { damage: 1100, hitCount: 6 };
        default:
          return { damage: 935, hitCount: 4 };
      }
    },
  },

  // 리버레이션 오브
  {
    id: 'liberation_orb',
    name: '리버레이션 오브',
    icon: '🌟',
    iconPath: '/skill-icons/liberation_orb.png',
    element: 'NONE',
    category: 'active_buff',
    damagePassive: 825,
    damageActive: 1135,
    damageActiveImbalance: 1025,
    hitCount: 4,
    maxTargets: 1,
    maxTargetsPassiveLight: 3,
    maxTargetsPassiveDark: 7,
    gaugeCharge: 0,
    cooldown: 120000,
    duration: 40000,
    description: '마력 스택 시스템을 활용하는 극딜기 (액티브 중 패시브 효과 정지)',
    defaultKeyBinding: 'C',
    isEquilibriumSkill: false,
    additionalCritRate: 100,
    triggersBreathing: false,
    affectedByBuffDuration: true,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 5차 강화 없음
    canEnhanceSixth: true,
  },

  // ==================== 간접 공격 스킬 ====================

  // 이터널 라이트니스
  {
    id: 'eternal_lightness',
    name: '이터널 라이트니스',
    icon: '🌟',
    iconPath: '/skill-icons/eternal_lightness.png',
    element: 'LIGHT',
    category: 'indirect_attack',
    damage: 280,
    hitCount: 3,
    maxTargets: 6,
    gaugeCharge: 200,
    cooldown: 2000,
    description: '빛 스킬 적중시 자동 발동되는 추가타',
    defaultKeyBinding: '',
    isEquilibriumSkill: false,
    canDirectUse: false,
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    triggerConditions: {
      onSkillHit: {
        elements: ['LIGHT'],
        requiredState: ['LIGHT', 'EQUILIBRIUM']
      }
    },
  },

  // 엔드리스 다크니스
  {
    id: 'endless_darkness',
    name: '엔드리스 다크니스',
    icon: '🌑',
    iconPath: '/skill-icons/endless_darkness.png',
    element: 'DARK',
    category: 'indirect_attack',
    damage: 285,
    hitCount: 4,
    maxTargets: 6,
    gaugeCharge: 200,
    cooldown: 2000,
    description: '어둠 스킬 적중시 자동 발동되는 추가타',
    defaultKeyBinding: '',
    isEquilibriumSkill: false,
    canDirectUse: false,
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    triggerConditions: {
      onSkillHit: {
        elements: ['DARK'],
        requiredState: ['DARK', 'EQUILIBRIUM']
      }
    },
  },

  // ==================== 버프/유틸리티 스킬 ====================

  // 히어로즈 오쓰
  {
    id: 'heroic_oath',
    name: '히어로즈 오쓰',
    icon: '🛡️',
    iconPath: '/skill-icons/heroic_oath.png',
    element: 'NONE',
    category: 'active_buff',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 120000,
    duration: 60000,
    description: '데미지 10% 증가 버프',
    defaultKeyBinding: 'Z',
    isEquilibriumSkill: false,
    damageIncrease: 10,
    triggersBreathing: false,
    affectedByBuffDuration: true,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 버프는 강화 없음
    canEnhanceSixth: false,
  },

  // 메모라이즈
  {
    id: 'memorize',
    name: '메모라이즈',
    icon: '🔮',
    iconPath: '/skill-icons/memorize.png',
    element: 'NONE',
    category: 'instant_skill',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 120000,
    description: '즉시 이퀼리브리엄 상태로 전환 (버프 지속시간 증가 미적용)',
    defaultKeyBinding: 'X',
    isEquilibriumSkill: false,
    ignoreBuffDuration: true,
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 버프는 강화 없음
    canEnhanceSixth: false,
  },

  // 엔젤릭 버스터 링크
  {
    id: 'angelic_buster_link',
    name: '엔젤릭 버스터',
    icon: '👼',
    iconPath: '/skill-icons/angelic_buster_link.png',
    element: 'NONE',
    category: 'active_buff',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 90000,
    duration: 60000,
    description: '데미지 증가 링크스킬 (다른 스킬 사용 중에도 사용 가능)',
    defaultKeyBinding: 'V',
    isEquilibriumSkill: false,
    damageIncrease: 0,
    canDirectUse: true,
    canUseWhileCasting: true,
    cannotUseWhileCasting: ['harmonic_paradox'],
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    canEnhanceFifth: false,  // 링크는 강화 없음
    canEnhanceSixth: false,
  },

  // ==================== 패시브 강화 스킬 (5차 리인포스) ====================

  // 라이트 리플렉션 리인포스
  {
    id: 'reflection_reinforce',
    name: '라이트 리플렉션 리인포스',
    icon: '💪',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 60,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'reflection',
      effectType: 'damage_multiplier',
      multiplierPerLevel: 0.02  // 레벨당 2%
    }],
    description: '라이트 리플렉션의 데미지를 레벨당 2% 증가'
  },

  // 아포칼립스 리인포스
  {
    id: 'apocalypse_reinforce',
    name: '아포칼립스 리인포스',
    icon: '💪',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 60,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'apocalypse',
      effectType: 'damage_multiplier',
      multiplierPerLevel: 0.02
    }],
    description: '아포칼립스의 데미지를 레벨당 2% 증가'
  },

  // 앱솔루트 킬 리인포스
  {
    id: 'absolute_kill_reinforce',
    name: '앱솔루트 킬 리인포스',
    icon: '💪',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 60,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'absolute_kill',
      effectType: 'damage_multiplier',
      multiplierPerLevel: 0.02
    }],
    description: '앱솔루트 킬의 데미지를 레벨당 2% 증가'
  },

  // 이터널 라이트니스 리인포스
  {
    id: 'eternal_lightness_reinforce',
    name: '이터널 라이트니스 리인포스',
    icon: '💪',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 60,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'eternal_lightness',
      effectType: 'damage_multiplier',
      multiplierPerLevel: 0.02
    }],
    description: '이터널 라이트니스의 데미지를 레벨당 2% 증가'
  },

  // 엔드리스 다크니스 리인포스
  {
    id: 'endless_darkness_reinforce',
    name: '엔드리스 다크니스 리인포스',
    icon: '💪',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 60,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'endless_darkness',
      effectType: 'damage_multiplier',
      multiplierPerLevel: 0.02
    }],
    description: '엔드리스 다크니스의 데미지를 레벨당 2% 증가'
  },

  // ==================== 패시브 강화 스킬 (6차 마스터리) ====================

  // 라이트 리플렉션 VI
  {
    id: 'reflection_mastery',
    name: '라이트 리플렉션 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'reflection',
      effectType: 'skill_override',
      overrideData: {
        damage: [null,
          491, 502, 513, 524, 535, 546, 557, 568, 579, 590, // 1-10
          601, 612, 623, 634, 645, 656, 667, 678, 689, 700, // 11-20
          711, 722, 733, 744, 755, 766, 777, 788, 799, 810  // 21-30
        ],
        gaugeCharge: [null,
          451, 451, 451, 451, 451, 451, 451, 451, 451, 451, // 1-10
          451, 451, 451, 451, 451, 451, 451, 451, 451, 451, // 11-20
          451, 451, 451, 451, 451, 451, 451, 451, 451, 451  // 21-30
        ]
      }
    }, {
      targetSkillId: 'absolute_kill',
      effectType: 'other_skill_bonus',
      bonusArray: [0,
        43, 46, 49, 52, 55, 58, 61, 64, 67, 70,           // 1-10
        73, 76, 79, 82, 85, 88, 91, 94, 97, 100,          // 11-20
        103, 106, 109, 112, 115, 118, 121, 124, 127, 130  // 21-30
      ]
    }],
    description: '라이트 리플렉션을 강화하고 앱솔루트 킬의 데미지 증가',
    affectsOtherSkills: {
      'absolute_kill': {
        damageIncrease: [0,
          43, 46, 49, 52, 55, 58, 61, 64, 67, 70,           // 1-10
          73, 76, 79, 82, 85, 88, 91, 94, 97, 100,          // 11-20
          103, 106, 109, 112, 115, 118, 121, 124, 127, 130  // 21-30
        ]
      }
    }
  },

  // 아포칼립스 VI
  {
    id: 'apocalypse_mastery',
    name: '아포칼립스 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'apocalypse',
      effectType: 'skill_override',
      overrideData: {
        damage: [null,
          420, 432, 444, 456, 468, 480, 492, 504, 516, 528, // 1-10
          540, 552, 564, 576, 588, 600, 612, 624, 636, 648, // 11-20
          660, 672, 684, 696, 708, 720, 732, 744, 756, 768  // 21-30
        ],
        gaugeCharge: [null,
          470, 470, 470, 470, 470, 470, 470, 470, 470, 470, // 1-10
          470, 470, 470, 470, 470, 470, 470, 470, 470, 470, // 11-20
          470, 470, 470, 470, 470, 470, 470, 470, 470, 470  // 21-30
        ]
      }
    }],
    description: '아포칼립스를 강화'
  },

  // 앱솔루트 킬 VI
  {
    id: 'absolute_kill_mastery',
    name: '앱솔루트 킬 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'absolute_kill',
      effectType: 'skill_override',
      overrideData: {
        damage: [null,
          492, 499, 506, 513, 520, 527, 534, 541, 548, 555, // 1-10
          562, 569, 576, 583, 590, 597, 604, 611, 618, 625, // 11-20
          632, 639, 646, 653, 660, 667, 674, 681, 688, 695  // 21-30
        ],
        cooldown: [null,
          10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, // 1-10
          10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, // 11-20
          10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000  // 21-30
        ],
        additionalIgnoreDefense: [null,
          41, 41, 41, 41, 41, 41, 42, 42, 42, 42, // 1-10
          42, 42, 43, 43, 43, 43, 43, 43, 44, 44, // 11-20
          44, 44, 44, 44, 45, 45, 45, 45, 45, 45  // 21-30
        ]
      }
    }],
    description: '앱솔루트 킬을 강화'
  },

  // 트와일라잇 노바 VI
  {
    id: 'twilight_nova_mastery',
    name: '트와일라잇 노바 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'twilight_nova',
      effectType: 'skill_override',
      overrideData: {
        damageLight: [null,
          470, 510, 550, 590, 630, 670, 710, 750, 790, 830,           // 1-10
          870, 910, 950, 990, 1030, 1070, 1110, 1150, 1190, 1230,     // 11-20
          1270, 1310, 1350, 1390, 1430, 1470, 1510, 1550, 1590, 1630  // 21-30
        ],
        damageDark: [null,
          470, 510, 550, 590, 630, 670, 710, 750, 790, 830,           // 1-10
          870, 910, 950, 990, 1030, 1070, 1110, 1150, 1190, 1230,     // 11-20
          1270, 1310, 1350, 1390, 1430, 1470, 1510, 1550, 1590, 1630  // 21-30
        ],
        damageEquilibrium: [null,
          400, 425, 450, 475, 500, 525, 550, 575, 600, 625,      // 1-10
          650, 675, 700, 725, 750, 775, 800, 825, 850, 875,      // 11-20
          900, 925, 950, 975, 1000, 1025, 1050, 1075, 1100, 1125 // 21-30
        ]
      }
    }],
    description: '트와일라잇 노바를 강화'
  },

  // 빛과 어둠의 세례 VI
  {
    id: 'baptism_mastery',
    name: '빛과 어둠의 세례 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'baptism_of_light_and_darkness',
      effectType: 'final_damage',
      finalDamageArray: [0,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 25, // 1-10
        26, 27, 28, 29, 30, 31, 32, 33, 34, 40, // 11-20
        41, 42, 43, 44, 45, 46, 47, 48, 49, 60  // 21-30
      ]
    }],
    description: '빛과 어둠의 세례의 최종 데미지 증가'
  },

  // 퍼니싱 리소네이터 VI
  {
    id: 'punishing_mastery',
    name: '퍼니싱 리소네이터 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'punishing_resonator',
      effectType: 'final_damage',
      finalDamageArray: [0,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 25, // 1-10
        26, 27, 28, 29, 30, 31, 32, 33, 34, 40, // 11-20
        41, 42, 43, 44, 45, 46, 47, 48, 49, 60  // 21-30
      ]
    }],
    description: '퍼니싱 리소네이터의 최종 데미지 증가'
  },

  // 진리의 문 VI
  {
    id: 'door_of_truth_mastery',
    name: '진리의 문 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'door_of_truth',
      effectType: 'final_damage',
      finalDamageArray: [0,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 25, // 1-10
        26, 27, 28, 29, 30, 31, 32, 33, 34, 40, // 11-20
        41, 42, 43, 44, 45, 46, 47, 48, 49, 60  // 21-30
      ]
    }],
    description: '진리의 문의 최종 데미지 증가'
  },

  // 리버레이션 오브 VI
  {
    id: 'liberation_orb_mastery',
    name: '리버레이션 오브 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    passiveEffects: [{
      targetSkillId: 'liberation_orb',
      effectType: 'final_damage',
      finalDamageArray: [0,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 25, // 1-10
        26, 27, 28, 29, 30, 31, 32, 33, 34, 40, // 11-20
        41, 42, 43, 44, 45, 46, 47, 48, 49, 60  // 21-30
      ]
    }],
    description: '리버레이션 오브의 최종 데미지 증가'
  },

  // 이터널 라이트니스 VI (아포칼립스 VI에 종속)
  {
    id: 'eternal_lightness_mastery',
    name: '이터널 라이트니스 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    dependsOn: 'apocalypse_mastery',
    passiveEffects: [{
      targetSkillId: 'eternal_lightness',
      effectType: 'skill_override',
      overrideData: {
        damage: [null,
          775, 795, 815, 835, 855, 875, 895, 915, 935, 955, // 1-10
          975, 995, 1015, 1035, 1055, 1075, 1095, 1115, 1135, 1155, // 11-20
          1175, 1195, 1215, 1235, 1255, 1275, 1295, 1315, 1335, 1355 // 21-30
        ]
      }
    }],
    description: '이터널 라이트니스를 강화 (아포칼립스 VI 레벨에 종속)'
  },

  // 엔드리스 다크니스 VI (라이트 리플렉션 VI에 종속)
  {
    id: 'endless_darkness_mastery',
    name: '엔드리스 다크니스 VI',
    icon: '🌟',
    element: 'NONE',
    category: 'passive_enhancement',
    maxLevel: 30,
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    canDirectUse: false,
    dependsOn: 'reflection_mastery',
    passiveEffects: [{
      targetSkillId: 'endless_darkness',
      effectType: 'skill_override',
      overrideData: {
        damage: [null,
          855, 880, 905, 930, 955, 980, 1005, 1030, 1055, 1080, // 1-10
          1105, 1130, 1155, 1180, 1205, 1230, 1255, 1280, 1305, 1330, // 11-20
          1355, 1380, 1405, 1430, 1455, 1480, 1505, 1530, 1555, 1580 // 21-30
        ]
      }
    }],
    description: '엔드리스 다크니스를 강화 (라이트 리플렉션 VI 레벨에 종속)'
  }
];

// 카테고리별 스킬 분류 함수
export const getSkillsByCategory = (category: SkillCategory): SkillData[] => {
  return LUMINOUS_SKILLS.filter(skill => skill.category === category);
};

// 기본 키 바인딩 생성 (액티브 스킬만)
export const getDefaultKeyBindings = () => {
  return LUMINOUS_SKILLS
    .filter(skill => skill.canDirectUse !== false && skill.defaultKeyBinding)
    .map(skill => ({
      skillId: skill.id,
      key: skill.defaultKeyBinding?.toLowerCase() || '',
      displayKey: skill.defaultKeyBinding || ''
    }));
};