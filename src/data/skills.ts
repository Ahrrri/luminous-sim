// src/data/skills.ts
import type { SkillData, SkillElement, SkillCategory } from './types/skillTypes';

export const LUMINOUS_SKILLS: SkillData[] = [
  // 빛 스킬
  {
    id: 'reflection',
    name: '라이트 리플렉션',
    icon: '☀️',
    element: 'LIGHT',
    damage: 810,
    hitCount: 4,
    maxTargets: 8,
    gaugeCharge: 451,
    cooldown: 0,
    description: '빛의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'Q'
  },

  // 어둠 스킬
  {
    id: 'apocalypse',
    name: '아포칼립스',
    icon: '🌙',
    element: 'DARK',
    damage: 768,
    hitCount: 7,
    maxTargets: 8,
    gaugeCharge: 470,
    cooldown: 0,
    description: '어둠의 힘을 이용한 기본 공격 스킬',
    defaultKeyBinding: 'W'
  },

  // 이퀼리브리엄 스킬
  {
    id: 'absolute_kill',
    name: '앱솔루트 킬',
    icon: '⚡',
    element: 'EQUILIBRIUM',
    damage: 695,
    hitCount: 7,
    maxTargets: 3,
    gaugeCharge: 0,
    cooldown: 10000,
    description: '이퀼리브리엄 상태에서만 사용 가능한 강력한 연타 스킬',
    defaultKeyBinding: 'E'
  },
  {
    id: 'door_of_truth',
    name: '진리의 문',
    icon: '🚪',
    element: 'EQUILIBRIUM',
    damage: 990,
    hitCount: 10,
    maxTargets: 12,
    gaugeCharge: 0,
    cooldown: 0,
    description: '이퀼리브리엄 진입 시 1회만 사용 가능한 광역 스킬',
    defaultKeyBinding: 'R'
  },
  {
    id: 'baptism_of_light_and_darkness',
    name: '빛과 어둠의 세례',
    icon: '✨',
    element: 'EQUILIBRIUM',
    damage: 660,
    hitCount: 7,
    maxTargets: 1,
    gaugeCharge: 0,
    cooldown: 30000,
    description: '빛과 어둠의 힘을 동시에 사용하는 강력한 스킬',
    defaultKeyBinding: 'A'
  },

  // 버프/기타 스킬
  {
    id: 'twilight_nova',
    name: '트와일라잇 노바',
    icon: '💥',
    element: 'NONE',
    damage: 1630,
    hitCount: 7,
    maxTargets: 8,
    gaugeCharge: 300,
    cooldown: 15000,
    description: '상태에 관계없이 사용 가능한 강력한 폭발 스킬',
    defaultKeyBinding: 'S'
  },
  {
    id: 'punishing_resonator',
    name: '퍼니싱 리소네이터',
    icon: '🎵',
    element: 'NONE',
    damage: 1100,
    hitCount: 6,
    maxTargets: 10,
    gaugeCharge: 0,
    cooldown: 30000,
    description: '소환수를 생성하여 지속적인 공격을 하는 스킬',
    defaultKeyBinding: 'D'
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
    description: '2분 쿨타임의 강력한 버프 스킬',
    defaultKeyBinding: 'Z'
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
    cooldown: 0,
    description: '즉시 이퀼리브리엄 상태로 전환하는 스킬',
    defaultKeyBinding: 'X'
  },
  {
    id: 'liberation_orb',
    name: '리버레이션 오브',
    icon: '🌟',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    gaugeCharge: 0,
    cooldown: 0,
    description: '추가타 효과를 제공하는 버프 스킬',
    defaultKeyBinding: 'C'
  }
];

// 카테고리별 필터링 함수들
export const getSkillsByElement = (element: SkillElement): SkillData[] => {
  return LUMINOUS_SKILLS.filter(skill => skill.element === element);
};

export const getSkillsByCategory = (category: SkillCategory): SkillData[] => {
  switch (category) {
    case 'light':
      return getSkillsByElement('LIGHT');
    case 'dark':
      return getSkillsByElement('DARK');
    case 'equilibrium':
      return getSkillsByElement('EQUILIBRIUM');
    case 'buff':
      return getSkillsByElement('NONE');
    default:
      return [];
  }
};

export const getSkillById = (id: string): SkillData | undefined => {
  return LUMINOUS_SKILLS.find(skill => skill.id === id);
};

export const getLightSkills = () => getSkillsByElement('LIGHT');
export const getDarkSkills = () => getSkillsByElement('DARK');
export const getEquilibriumSkills = () => getSkillsByElement('EQUILIBRIUM');
export const getBuffSkills = () => getSkillsByElement('NONE');

// 기본 키 바인딩 생성
export const getDefaultKeyBindings = () => {
  return LUMINOUS_SKILLS
    .filter(skill => skill.defaultKeyBinding)
    .map(skill => ({
      skillId: skill.id,
      key: skill.defaultKeyBinding!.toLowerCase(),
      displayKey: skill.defaultKeyBinding!
    }));
};