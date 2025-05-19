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
    addCritRate?: number; // 추가 크리티컬 확률
    addIgnoreDefense?: number; // 추가 방무
    special?: {
      additionalHit?: boolean;
      cooldownReset?: boolean;
      // 기타 특수 효과
    };
  }
  
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
      delay: 900, // 가정값
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
      delay: 900, // 가정값
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
      delay: 900, // 가정값
      gaugeCharge: 0,
      addCritRate: 100,
      addIgnoreDefense: 45,
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
    },
    // 나머지 스킬들도 추가...
  };