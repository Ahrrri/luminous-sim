// src/models/skills.ts
export interface Skill {
  id: string;
  name: string;
  type: 'ATTACK' | 'BUFF' | 'SUMMON';
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';
  damage: number; // 스킬 데미지 %
  hitCount: number; // 타수
  maxTargets: number;
  cooldown: number; // 쿨타임 (ms)
  delay: number; // 스킬 딜레이 (ms)
  gaugeCharge: number; // 게이지 충전량
  
  // 루미너스 특화 필드
  addCritRate?: number; // 추가 크리티컬 확률
  addIgnoreDefense?: number; // 추가 방무
  isEquilibriumOnly?: boolean; // 이퀼 상태에서만 사용 가능한 스킬인지
  cooldownResetOnEquilibrium?: boolean; // 이퀼 상태 진입 시 쿨타임 초기화
  
  // 루미너스의 특수 스킬 효과
  special?: {
    additionalHit?: boolean; // 추가타
    reduceOtherCooldown?: { // 다른 스킬의 쿨타임 감소 효과
      skillId?: string;
      amount?: number; // ms
      condition?: 'EQUILIBRIUM' | 'ALWAYS';
    };
    extendEquilibriumDuration?: number; // 이퀼 지속시간 연장 (ms)
  };
}

// 중요 스킬 데이터를 더 자세히 정의
export const skills: Record<string, Skill> = {
  REFLECTION: {
    id: 'REFLECTION',
    name: '라이트 리플렉션',
    type: 'ATTACK',
    element: 'LIGHT',
    damage: 810,
    hitCount: 4,
    maxTargets: 8,
    cooldown: 0,
    delay: 660, // 실제 게임 내 딜레이에 맞게 조정
    gaugeCharge: 451,
  },
  APOCALYPSE: {
    id: 'APOCALYPSE',
    name: '아포칼립스',
    type: 'ATTACK',
    element: 'DARK',
    damage: 768,
    hitCount: 7,
    maxTargets: 8,
    cooldown: 0,
    delay: 660, 
    gaugeCharge: 470,
  },
  ABSOLUTE_KILL: {
    id: 'ABSOLUTE_KILL',
    name: '앱솔루트 킬',
    type: 'ATTACK',
    element: 'EQUILIBRIUM',
    damage: 695,
    hitCount: 7,
    maxTargets: 3,
    cooldown: 10000, // 10초
    delay: 660,
    gaugeCharge: 0,
    addCritRate: 100,
    addIgnoreDefense: 45,
    isEquilibriumOnly: true
  },
  ETERNAL_LIGHTNESS: {
    id: 'ETERNAL_LIGHTNESS',
    name: '이터널 라이트니스',
    type: 'ATTACK',
    element: 'LIGHT',
    damage: 1355,
    hitCount: 7,
    maxTargets: 6,
    cooldown: 2000, // 2초
    delay: 0, // 자동 발동
    gaugeCharge: 157,
    special: {
      additionalHit: true
    }
  },
  ENDLESS_DARKNESS: {
    id: 'ENDLESS_DARKNESS',
    name: '엔드리스 다크니스',
    type: 'ATTACK',
    element: 'DARK',
    damage: 1580,
    hitCount: 5,
    maxTargets: 6,
    cooldown: 2000, // 2초
    delay: 0, // 자동 발동
    gaugeCharge: 157,
    special: {
      additionalHit: true
    }
  },
  TWILIGHT_NOVA: {
    id: 'TWILIGHT_NOVA',
    name: '트와일라잇 노바',
    type: 'ATTACK',
    element: 'NONE', // 현재 상태에 따라 결정됨
    damage: 1630, // 빛/어둠 상태. 이퀼 상태에서는 1125%
    hitCount: 7,
    maxTargets: 8,
    cooldown: 15000, // 15초
    delay: 990,
    gaugeCharge: 300, // 상태에 따라 다름
  },
  DOOR_OF_TRUTH: {
    id: 'DOOR_OF_TRUTH',
    name: '진리의 문',
    type: 'SUMMON',
    element: 'EQUILIBRIUM',
    damage: 990,
    hitCount: 10,
    maxTargets: 12,
    cooldown: 0, // 이퀼 당 1회만 사용 가능
    delay: 660,
    gaugeCharge: 0,
    isEquilibriumOnly: true
  },
  PUNISHING_RESONATOR: {
    id: 'PUNISHING_RESONATOR',
    name: '퍼니싱 리소네이터',
    type: 'SUMMON',
    element: 'NONE', // 상태에 따라 결정
    damage: 1100, // 이퀼 상태 기준, 빛=1155%, 어둠=935%
    hitCount: 6, // 이퀼 상태 기준, 빛=4, 어둠=5
    maxTargets: 10,
    cooldown: 30000, // 30초
    delay: 660,
    gaugeCharge: 0,
    addCritRate: 15,
  },
  BAPTISM_OF_LIGHT_AND_DARKNESS: {
    id: 'BAPTISM_OF_LIGHT_AND_DARKNESS',
    name: '빛과 어둠의 세례',
    type: 'ATTACK',
    element: 'EQUILIBRIUM',
    damage: 660,
    hitCount: 7,
    maxTargets: 1, // 13회 발동
    cooldown: 30000, // 30초
    delay: 660,
    gaugeCharge: 0,
    addCritRate: 100,
    addIgnoreDefense: 100,
    cooldownResetOnEquilibrium: true,
    special: {
      reduceOtherCooldown: {
        amount: 2000, // 2초
        condition: 'EQUILIBRIUM'
      }
    }
  },
  LIBERATION_ORB_ACTIVE: {
    id: 'LIBERATION_ORB_ACTIVE',
    name: '리버레이션 오브 (액티브)',
    type: 'BUFF',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    cooldown: 120000, // 2분
    delay: 660,
    gaugeCharge: 0,
  },
  HARMONIC_PARADOX: {
    id: 'HARMONIC_PARADOX',
    name: '하모닉 패러독스',
    type: 'ATTACK',
    element: 'EQUILIBRIUM',
    damage: 1538,
    hitCount: 7,
    maxTargets: 15,
    cooldown: 360000, // 6분
    delay: 3500, // 키다운 스킬
    gaugeCharge: 0,
    addIgnoreDefense: 50, // 30레벨 기준
    isEquilibriumOnly: true,
    special: {
      extendEquilibriumDuration: 10000 // 10초 증가
    }
  },
  // 버프 및 마크 스킬들
  MEMORIZE: {
    id: 'MEMORIZE',
    name: '메모라이즈',
    type: 'BUFF',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    cooldown: 120000, // 2분
    delay: 0,
    gaugeCharge: 0,
    special: {
      // 즉시 이퀼 상태로 만들어주는 효과는 시뮬레이션 로직에서 처리
    }
  },
  HEROIC_OATH: {
    id: 'HEROIC_OATH',
    name: '히어로즈 오쓰',
    type: 'BUFF',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    cooldown: 120000, // 2분
    delay: 0,
    gaugeCharge: 0,
  },
  MAPLE_GODDESS_BLESSING: {
    id: 'MAPLE_GODDESS_BLESSING',
    name: '메이플 여신의 축복',
    type: 'BUFF',
    element: 'NONE',
    damage: 0,
    hitCount: 0,
    maxTargets: 0,
    cooldown: 120000, // 2분
    delay: 0,
    gaugeCharge: 0,
  },
};