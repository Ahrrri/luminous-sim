// src/models/buffs.ts
export interface Buff {
  id: string;
  name: string;
  duration: number; // ms
  cooldown: number; // ms
  isActive: boolean;
  startTime?: number;
  endTime?: number;
  stacks?: number;
  maxStacks?: number;
  effects: {
    damageIncrease?: number; // %
    finalDamageIncrease?: number; // %
    bossDamageIncrease?: number; // %
    critRateIncrease?: number; // %
    critDamageIncrease?: number; // %
    ignoreDefenseIncrease?: number; // %
    cooldownReduction?: number; // %
    // 추가 효과
    extendEquilibriumDuration?: number; // ms
  };
  serverLagApplicable: boolean; // 서버렉 영향을 받는지 여부
}

export const buffs: Record<string, Omit<Buff, 'isActive' | 'startTime' | 'endTime'>> = {
  EQUILIBRIUM: {
    id: 'EQUILIBRIUM',
    name: '이퀼리브리엄',
    duration: 17000, // 17초 (벞지 적용 전)
    cooldown: 0, // 게이지에 의해 결정
    effects: {
      // 추가 효과 정의 필요시 추가
    },
    serverLagApplicable: true,
  },
  HEROIC_OATH: {
    id: 'HEROIC_OATH',
    name: '히어로즈 오쓰',
    duration: 60000, // 60초
    cooldown: 120000, // 120초
    effects: {
      damageIncrease: 10, // 데미지 10% 증가
    },
    serverLagApplicable: true,
  },
  MAPLE_GODDESS_BLESSING: {
    id: 'MAPLE_GODDESS_BLESSING',
    name: '메이플 여신의 축복',
    duration: 60000, // 60초
    cooldown: 120000, // 120초
    effects: {
      damageIncrease: 20, // 데미지 20% 증가
    },
    serverLagApplicable: true,
  },
  FREUDS_BLESSING: {
    id: 'FREUDS_BLESSING',
    name: '프리드의 가호',
    duration: 30000, // 30초
    cooldown: 240000, // 240초
    maxStacks: 6,
    effects: {
      cooldownReduction: 10, // 1스택: 쿨타임 10% 감소
      // 나머지 스택 효과는 로직에서 구현
    },
    serverLagApplicable: true,
  },
  ANGELIC_BLESSING: {
    id: 'ANGELIC_BLESSING',
    name: '엔버 링크스킬',
    duration: 10000, // 10초
    cooldown: 60000, // 60초
    effects: {
      damageIncrease: 45, // 데미지 45% 증가
    },
    serverLagApplicable: true,
  },
  CONTINUOUS_RING: {
    id: 'CONTINUOUS_RING',
    name: '컨티뉴어스 링',
    duration: 8000, // 8초
    cooldown: 4000, // 4초 대기시간
    effects: {
      // 효과는 레벨에 따라 다름 - 로직에서 구현
    },
    serverLagApplicable: false, // 컨티는 서버렉 영향 없음
  },
  LIBERATION_ORB: {
    id: 'LIBERATION_ORB',
    name: '리버레이션 오브',
    duration: 40000, // 40초
    cooldown: 120000, // 120초
    effects: {
      // 효과는 로직에서 구현
    },
    serverLagApplicable: true,
  },
  ONE_STROKE_CONCENTRATION: {
    id: 'ONE_STROKE_CONCENTRATION',
    name: '일필집중',
    duration: 2000, // 2초
    cooldown: 30000, // 30초
    effects: {
      finalDamageIncrease: 100, // 최종 데미지 100% 증가
    },
    serverLagApplicable: true,
  },
};