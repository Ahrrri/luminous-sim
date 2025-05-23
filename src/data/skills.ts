// src/data/skills.ts
import type { SkillData, SkillElement, SkillCategory } from './types/skillTypes';

export const LUMINOUS_SKILLS: SkillData[] = [
  // 빛 스킬
  {
    id: 'reflection',
    name: '라이트 리플렉션',
    icon: '☀️',
    element: 'LIGHT',
    damage: 440,  // 문서 기준 정확한 수치
    hitCount: 4,
    maxTargets: 8,
    gaugeCharge: 409,  // 다크라이트 마스터리 기준
    gaugeChargeVI: 450,  // VI 스킬 사용시
    cooldown: 0,
    description: '빛의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'Q',
    isEquilibriumSkill: false
  },

  // 어둠 스킬
  {
    id: 'apocalypse',
    name: '아포칼립스',
    icon: '🌙',
    element: 'DARK',
    damage: 375,  // 문서 기준 정확한 수치
    hitCount: 7,
    maxTargets: 8,
    gaugeCharge: 430,  // 기본
    gaugeChargeRecharge: 464,  // 아포칼립스-리차지 적용시
    gaugeChargeVI: 520,  // VI 스킬 사용시
    gaugeChargeVIRecharge: 562,  // VI + 리차지
    cooldown: 0,
    description: '어둠의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'W',
    isEquilibriumSkill: false
  },

  // 이퀼리브리엄 스킬
  {
    id: 'absolute_kill',
    name: '앱솔루트 킬',
    icon: '⚡',
    element: 'EQUILIBRIUM',
    damage: 455,  // 문서 기준 정확한 수치
    hitCount: 7,
    maxTargets: 2,  // 기본 2명
    gaugeCharge: 0,
    cooldown: 12000,  // 기본 12초
    cooldownVI: 10000,  // VI 스킬 10초
    description: '이퀼리브리엄 상태에서 재사용 대기시간이 없어지는 강력한 스킬',
    defaultKeyBinding: 'E',
    isEquilibriumSkill: true,
    additionalCritRate: 100,  // 추가 크리티컬 확률 100%
    additionalIgnoreDefense: 40,  // 방어율 40% 추가 무시
    additionalIgnoreDefenseVI: 45  // VI 스킬시 45%
  },
  {
    id: 'door_of_truth',
    name: '진리의 문',
    icon: '🚪',
    element: 'NONE',  // 이퀼리브리엄 스킬이 아님
    damage: 990,  // 30레벨 기준
    hitCount: 10,
    maxTargets: 12,
    gaugeCharge: 0,
    cooldown: 0,  // 이퀼당 1회 제한
    description: '이퀼리브리엄 진입 시 1회만 사용 가능한 설치기',
    defaultKeyBinding: 'R',
    isEquilibriumSkill: false,
    usageLimit: 'once_per_equilibrium'
  },
  {
    id: 'baptism_of_light_and_darkness',
    name: '빛과 어둠의 세례',
    icon: '✨',
    element: 'NONE',  // 라크니스 속성 없음
    damage: 660,  // 30레벨 기준
    hitCount: 7,
    attackCount: 13,  // 13회 연속 공격
    maxTargets: 1,
    gaugeCharge: 0,
    cooldown: 30000,
    description: '이퀼리브리엄 스킬 적중시 쿨타임 2초 감소, 이퀼 진입시 초기화',
    defaultKeyBinding: 'A',
    isEquilibriumSkill: false,
    additionalCritRate: 100,
    additionalIgnoreDefense: 100,
    cooldownReductionOnEquilibriumSkill: 2000  // 이퀼 스킬 적중시 2초 감소
  },

  // 버프/기타 스킬
  {
    id: 'twilight_nova',
    name: '트와일라잇 노바',
    icon: '💥',
    element: 'NONE',
    damage: 1200,  // 선파이어/이클립스
    damageEquilibrium: 450,  // 이퀼리브리엄시
    hitCount: 7,
    hitCountEquilibrium: 6,  // 이퀼시 6타
    explosionCount: 3,  // 폭발 3회
    maxTargets: 8,
    gaugeCharge: 346,  // 문서 기준
    cooldown: 15000,
    description: '라크니스 상태에 따라 변화하는 폭발 스킬',
    defaultKeyBinding: 'S',
    isEquilibriumSkill: false
  },
  {
    id: 'punishing_resonator',
    name: '퍼니싱 리소네이터',
    icon: '🎵',
    element: 'NONE',
    damageSunfire: 1155,  // 선파이어 30레벨
    damageEclipse: 935,   // 이클립스 30레벨
    damageEquilibrium: 1100,  // 이퀼리브리엄 30레벨
    hitCountSunfire: 4,
    hitCountEclipse: 5,
    hitCountEquilibrium: 6,
    maxTargets: 10,
    gaugeCharge: 0,
    cooldown: 30000,
    duration: 6000,  // 6초간 지속
    description: '실시간으로 라크니스 상태가 적용되는 설치기',
    defaultKeyBinding: 'D',
    isEquilibriumSkill: false,
    additionalCritRate: 15
  },
  {
    id: 'heroic_oath',
    name: '히어로즈 오쓰',
    icon: '🛡️',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 120000,
    duration: 60000,  // 60초 지속
    description: '데미지 10% 증가 버프',
    defaultKeyBinding: 'Z',
    isEquilibriumSkill: false,
    damageIncrease: 10
  },
  {
    id: 'memorize',
    name: '메모라이즈',
    icon: '🔮',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 120000,  // 재사용 대기시간 120초
    description: '즉시 이퀼리브리엄 상태로 전환 (버프 지속시간 증가 미적용)',
    defaultKeyBinding: 'X',
    isEquilibriumSkill: false,
    ignoreBuffDuration: true  // 버프 지속시간 증가 무시
  },
  {
    id: 'liberation_orb',
    name: '리버레이션 오브',
    icon: '🌟',
    element: 'NONE',
    damagePassive: 825,  // 패시브 30레벨
    damageActive: 1135,  // 액티브 균형 30레벨
    damageActiveImbalance: 1025,  // 액티브 불균형
    hitCount: 4,
    maxTargets: 1,  // 액티브시
    maxTargetsPassiveLight: 3,  // 패시브 빛
    maxTargetsPassiveDark: 7,   // 패시브 어둠
    gaugeCharge: 0,
    cooldown: 120000,  // 액티브 쿨타임
    duration: 40000,   // 40초 지속
    description: '마력 스택 시스템을 활용하는 극딜기',
    defaultKeyBinding: 'C',
    isEquilibriumSkill: false,
    additionalCritRate: 100  // 액티브시 추크 100%
  }
];