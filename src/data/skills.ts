// src/data/skills.ts
import type { SkillData, SkillCategory, LuminousState } from './types/skillTypes';

export const LUMINOUS_SKILLS: SkillData[] = [
  // 직접 공격 스킬
  {
    id: 'reflection',
    name: '라이트 리플렉션',
    icon: '☀️',
    element: 'LIGHT',
    category: 'direct_attack',
    damage: 440,
    hitCount: 4,
    maxTargets: 8,
    gaugeCharge: 409,
    gaugeChargeVI: 450,
    cooldown: 0,
    actionDelay: 600,  // 600ms 액션 딜레이
    description: '빛의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'Q',
    isEquilibriumSkill: false,
    // 시스템 연동
    canDirectUse: true,   // 직접 사용 가능
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    fifthEnhanceRate: 2,
    sixthEnhanceRate: 3,
    maxFifthLevel: 60,
    maxSixthLevel: 30
  },

  // 간접 공격 스킬 (추가타)
  {
    id: 'eternal_lightness',
    name: '이터널 라이트니스',
    icon: '🌟',
    element: 'LIGHT',
    category: 'indirect_attack',
    damage: 280,  // 추가타 데미지
    hitCount: 3,
    maxTargets: 6,
    gaugeCharge: 200,  // 게이지 충전량
    cooldown: 2000,   // 2초 쿨타임
    description: '빛 스킬 적중시 자동 발동되는 추가타',
    defaultKeyBinding: '',  // 직접 사용 불가
    isEquilibriumSkill: false,
    // 시스템 연동
    canDirectUse: false,  // 직접 사용 불가
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 트리거 조건
    triggerConditions: {
      onSkillHit: {
        elements: ['LIGHT'],
        requiredState: ['LIGHT', 'EQUILIBRIUM']
      }
    },
    // 강화 정보
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    fifthEnhanceRate: 2,
    sixthEnhanceRate: 3,
    maxFifthLevel: 60,
    maxSixthLevel: 30
  },

  {
    id: 'endless_darkness',
    name: '엔드리스 다크니스',
    icon: '🌑',
    element: 'DARK',
    category: 'indirect_attack',
    damage: 285,  // 추가타 데미지
    hitCount: 4,
    maxTargets: 6,
    gaugeCharge: 200,  // 게이지 충전량
    cooldown: 2000,   // 2초 쿨타임
    description: '어둠 스킬 적중시 자동 발동되는 추가타',
    defaultKeyBinding: '',  // 직접 사용 불가
    isEquilibriumSkill: false,
    // 시스템 연동
    canDirectUse: false,  // 직접 사용 불가
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 트리거 조건
    triggerConditions: {
      onSkillHit: {
        elements: ['DARK'],
        requiredState: ['DARK', 'EQUILIBRIUM']
      }
    },
    // 강화 정보
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    fifthEnhanceRate: 2,
    sixthEnhanceRate: 3,
    maxFifthLevel: 60,
  },

  {
    id: 'apocalypse',
    name: '아포칼립스',
    icon: '🌙',
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
    // 시스템 연동
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    fifthEnhanceRate: 2,
    sixthEnhanceRate: 3,
    maxFifthLevel: 60,
    maxSixthLevel: 30
  },

  {
    id: 'absolute_kill',
    name: '앱솔루트 킬',
    icon: '⚡',
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
    // 시스템 연동
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: true,
    canEnhanceSixth: true,
    fifthEnhanceRate: 2,
    sixthEnhanceRate: 3,
    maxFifthLevel: 60,
    maxSixthLevel: 30
  },

  {
    id: 'twilight_nova',
    name: '트와일라잇 노바',
    icon: '💥',
    element: 'NONE',
    category: 'direct_attack',
    maxTargets: 8,
    gaugeCharge: 346,
    cooldown: 15000,
    description: '라크니스 상태에 따라 변화하는 폭발 스킬',
    defaultKeyBinding: 'S',
    isEquilibriumSkill: false,
    // 시스템 연동
    triggersBreathing: true,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 동적 스킬
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
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: true,
    sixthEnhanceRate: 3,
    maxSixthLevel: 30
  },

  // 소환 스킬
  {
    id: 'door_of_truth',
    name: '진리의 문',
    icon: '🚪',
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
    // 소환수 정보
    summonType: 'placed',
    summonDuration: 30000,      // 30초 지속
    summonAttackInterval: 300,  // 300ms마다 공격
    summonRange: 800,           // 사거리
    summonDelay: 600,           // 소환 완료까지 600ms
    // 시스템 연동
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: true,
    sixthEnhanceRate: 3,
    maxSixthLevel: 30
  },

  {
    id: 'baptism_of_light_and_darkness',
    name: '빛과 어둠의 세례',
    icon: '✨',
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
      amount: 2000,  // 2초 감소
      excludeConditions: [
        {
          skillId: 'twilight_nova',
          whenState: ['EQUILIBRIUM']  // 이퀼 상태의 트노바는 제외
        }
      ]
    },
    // 소환수 정보
    summonType: 'instant',
    summonDuration: 10000,      // 10초 지속 (13회 공격)
    summonAttackInterval: 770,  // 770ms마다 공격 (13회)
    summonRange: 600,           // 사거리
    summonDelay: 600,           // 소환 완료까지 600ms
    // 시스템 연동
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: true,
    sixthEnhanceRate: 3,
    maxSixthLevel: 30
  },

  {
    id: 'punishing_resonator',
    name: '퍼니싱 리소네이터',
    icon: '🎵',
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
    // 소환수 정보
    summonType: 'placed',
    summonDuration: 6000,       // 6초 지속
    summonAttackInterval: 210,  // 210ms마다 공격
    summonRange: 700,           // 사거리
    summonDelay: 600,           // 소환 완료까지 600ms
    // 시스템 연동
    triggersBreathing: false,
    affectedByBuffDuration: false,
    affectedByCooldownReduction: true,
    // 동적 스킬
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
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: true,
    sixthEnhanceRate: 3,
    maxSixthLevel: 30
  },

  // 액티브 버프 스킬
  {
    id: 'heroic_oath',
    name: '히어로즈 오쓰',
    icon: '🛡️',
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
    // 시스템 연동
    triggersBreathing: false,
    affectedByBuffDuration: true,  // 벞지 적용 O
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: false
  },

  {
    id: 'liberation_orb',
    name: '리버레이션 오브',
    icon: '🌟',
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
    // 시스템 연동
    triggersBreathing: false,
    affectedByBuffDuration: true,  // 벞지 적용 O
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: true,
    sixthEnhanceRate: 3,
    maxSixthLevel: 30
  },

  // 즉발형 스킬
  {
    id: 'memorize',
    name: '메모라이즈',
    icon: '🔮',
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
    // 시스템 연동
    triggersBreathing: false,
    affectedByBuffDuration: false,  // 벞지 적용 X
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: false
  },

  // 링크 스킬
  {
    id: 'angelic_buster_link',
    name: '엔젤릭 버스터',
    icon: '👼',
    element: 'NONE',
    category: 'active_buff',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 90000,  // 90초 쿨타임
    duration: 60000,  // 60초 지속
    description: '데미지 증가 링크스킬 (다른 스킬 사용 중에도 사용 가능)',
    defaultKeyBinding: 'V',
    isEquilibriumSkill: false,
    damageIncrease: 0,  // 실제 수치는 레벨에 따라 다름
    // 시스템 연동
    canDirectUse: true,
    canUseWhileCasting: true,   // 다른 스킬 사용 중에도 사용 가능!
    cannotUseWhileCasting: ['harmonic_paradox'],  // 하모닉 패러독스 중에는 불가
    triggersBreathing: false,
    affectedByBuffDuration: false,  // 링크스킬은 벞지 적용 X
    affectedByCooldownReduction: true,
    // 강화 정보
    canEnhanceFifth: false,
    canEnhanceSixth: false
  }
];

// 카테고리별 스킬 분류 함수
export const getSkillsByCategory = (category: SkillCategory): SkillData[] => {
  return LUMINOUS_SKILLS.filter(skill => skill.category === category);
};

// 기본 키 바인딩 생성
export const getDefaultKeyBindings = () => {
  return LUMINOUS_SKILLS.map(skill => ({
    skillId: skill.id,
    key: skill.defaultKeyBinding?.toLowerCase() || '',
    displayKey: skill.defaultKeyBinding || ''
  }));
};