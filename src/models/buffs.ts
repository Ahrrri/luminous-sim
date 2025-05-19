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
      damageIncrease?: number;
      finalDamageIncrease?: number;
      bossDamageIncrease?: number;
      critRateIncrease?: number;
      critDamageIncrease?: number;
      ignoreDefenseIncrease?: number;
      cooldownReduction?: number;
      // 기타 효과
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
        // 이퀼리브리엄 효과
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
    // 나머지 버프들도 추가...
  };