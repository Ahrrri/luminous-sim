// src/data/types/skillTypes.ts

export type LuminousState = 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
export type SkillElement = 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';

export type SkillCategory = 
  | 'direct_attack'     // 직접 공격 (라리플, 아포, 앱킬, 트노바, 오리진) - 숨돌리기 O
  | 'indirect_attack'   // 간접 공격 (이터널, 엔드리스) - 다른 스킬 적중시 자동 발동
  | 'active_buff'       // 액티브 버프 (오쓰, 리버레이션 오브) - 숨돌리기 X
  | 'instant_skill'     // 즉발형 스킬 (메모라이즈) - 숨돌리기 X
  | 'summon'           // 소환 스킬 (진리의 문, 세례, 퍼니싱) - 숨돌리기 X
  | 'passive_enhancement'; // 패시브 강화 스킬 (5차 리인포스, 6차 마스터리, 6차 리인포스)

export interface DynamicSkillProperties {
  damage?: number;
  hitCount?: number;
  element?: SkillElement;
  maxTargets?: number;
  gaugeCharge?: number;
}

// 패시브 강화 효과 정의
export interface PassiveEnhancementEffect {
  targetSkillId: string;  // 강화 대상 스킬 ID
  effectType: 'damage_multiplier' | 'final_damage' | 'skill_override' | 'other_skill_bonus';
  
  // effectType별 데이터
  multiplierPerLevel?: number;  // damage_multiplier용 - 레벨당 증가율
  finalDamageArray?: number[];  // final_damage용 - 레벨별 최종뎀 증가량
  overrideData?: {              // skill_override용 - 스킬 데이터 오버라이드
    [property: string]: (number | null)[];  // null은 0레벨 (미적용)
  };
  bonusArray?: number[];        // other_skill_bonus용 - 다른 스킬에 주는 보너스
}

export interface SkillData {
  id: string;
  name: string;
  icon: string;
  iconPath?: string;
  element: SkillElement;
  category: SkillCategory;
  
  // 레벨 관련
  maxLevel?: number;  // 기본값 1, 패시브는 30 또는 60
  
  // 데미지 관련
  damage?: number;
  damageSunfire?: number;
  damageEclipse?: number;
  damageEquilibrium?: number;
  damagePassive?: number;
  damageActive?: number;
  damageActiveImbalance?: number;
  
  // 타격 관련
  hitCount?: number;
  hitCountSunfire?: number;
  hitCountEclipse?: number;
  hitCountEquilibrium?: number;
  attackCount?: number;
  explosionCount?: number;
  
  // 대상 관련
  maxTargets: number;
  maxTargetsPassiveLight?: number;
  maxTargetsPassiveDark?: number;
  
  // 게이지 관련
  gaugeCharge: number;
  gaugeChargeVI?: number;
  gaugeChargeRecharge?: number;
  gaugeChargeVIRecharge?: number;
  
  // 쿨타임 관련
  cooldown: number;
  cooldownVI?: number;
  actionDelay?: number;
  cooldownReductionOnEquilibriumSkill?: {
    amount: number;
    excludeSkills?: string[];
    excludeConditions?: {
      skillId: string;
      whenState?: LuminousState[];
    }[];
  };
  
  // 버프/지속 관련
  duration?: number;
  damageIncrease?: number;
  
  // 소환수 관련
  summonType?: 'instant' | 'placed';
  summonDuration?: number;
  summonAttackInterval?: number;
  summonRange?: number;
  summonDelay?: number;
  
  // 특수 효과
  isEquilibriumSkill?: boolean;
  additionalCritRate?: number;
  additionalIgnoreDefense?: number;
  additionalIgnoreDefenseVI?: number;
  ignoreBuffDuration?: boolean;
  usageLimit?: 'once_per_equilibrium';
  
  // 시스템 연동 관련
  canDirectUse?: boolean;
  canUseWhileCasting?: boolean;
  cannotUseWhileCasting?: string[];
  triggersBreathing?: boolean;
  affectedByBuffDuration?: boolean;
  affectedByCooldownReduction?: boolean;
  
  // 간접 스킬용 트리거 조건
  triggerConditions?: {
    onSkillHit?: {
      elements?: SkillElement[];
      categories?: SkillCategory[];
      requiredState?: LuminousState[];
    };
  };
  
  // 패시브 강화 효과 (패시브 스킬용)
  passiveEffects?: PassiveEnhancementEffect[];
  
  // 레벨별 효과 배열 (필요시 사용)
  effects?: {
    [effectType: string]: number[];  // 인덱스 = 레벨 (0은 효과 없음)
  };
  
  // 다른 스킬에 미치는 영향 (예: 라리VI가 앱킬에 주는 보너스)
  affectsOtherSkills?: {
    [targetSkillId: string]: {
      damageIncrease?: number[];  // 레벨별 데미지 증가량
    };
  };
  
  // 강화 가능 여부
  canEnhanceFifth?: boolean;     // 5차 강화 가능 여부 (기본 true)
  canEnhanceSixth?: boolean;     // 6차 강화 가능 여부 (기본 true)
  maxFifthLevel?: number;        // 최대 5차 레벨 (기본 60)
  maxSixthLevel?: number;        // 최대 6차 레벨 (기본 30)
  
  // 동적 스킬 관련
  isDynamic?: boolean;
  getDynamicProperties?: (state: LuminousState) => DynamicSkillProperties;
  
  // 종속 관계 (이터널/엔드리스 VI용)
  dependsOn?: string;  // 부모 스킬 ID
  
  description?: string;
  defaultKeyBinding?: string;
}