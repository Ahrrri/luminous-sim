// src/data/types/characterTypes.ts

// 기본 캐릭터 스탯
export interface CharacterStats {
  // 기본 스탯
  int: number;
  luk: number;
  magicAttack: number;
  
  // 데미지 관련
  damagePercent: number;     // 데미지%
  bossDamage: number;        // 보스 데미지%
  critRate: number;          // 크리티컬 확률%
  critDamage: number;        // 크리티컬 데미지%
  
  // 무시 관련
  ignoreDefense: number;     // 방어율 무시%
  ignoreElementalResist: number; // 속성 내성 무시%
  
  // 무기/기타
  weaponConstant: number;    // 무기 상수
  mastery: number;           // 숙련도%
  attackSpeed: number;       // 공격속도 (0~2단계)
  
  // 시스템 관련
  merLevel: number;          // 메르세데스 레벨 (쿨감)
  buffDuration: number;      // 버프 지속시간 증가% (벞지)
  cooldownReduction: number; // 재사용 감소 (초) (쿨뚝)
  cooldownResetChance: number; // 재사용 확률% (재사용)
  continuousLevel: number;   // 컨티뉴어스 링 레벨
  equilibriumMode: 'AUTO' | 'MANUAL'; // 이퀼 유예 모드
  
  // 추가 스탯
  finalDamage?: number;      // 최종 데미지%
}

// 보스 정보
export interface BossStats {
  level: number;             // 보스 레벨
  defenseRate: number;       // 보스 방어율%
  elementalResist: number;   // 속성 저항%
}

// 스킬별 강화 정보
export interface SkillEnhancement {
  skillId: string;
  fifthLevel: number;        // 5차 강화 레벨 (0~60)
  sixthLevel: number;        // 6차 강화 레벨 (0~30)
}

// 전체 설정
export interface GameSettings {
  character: CharacterStats;
  boss: BossStats;
  skillEnhancements: SkillEnhancement[];
  
  // 시뮬레이션 설정
  simulation: {
    serverLagEnabled: boolean;
    serverLagProbability: number;  // 서버렉 발생 확률%
    serverLagDuration: number;     // 서버렉 최대 지속시간(ms)
    applyOneHitPerTarget: boolean; // 한 적당 최대 한 번 충돌
    simulateBossOnly: boolean;
  };
}