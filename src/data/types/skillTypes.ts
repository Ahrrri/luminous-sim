// src/data/types/skillTypes.ts

export type LuminousState = 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
export type SkillElement = 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';

export type SkillCategory = 
  | 'direct_attack'     // 직접 공격 (라리플, 아포, 앱킬, 트노바) - 숨돌리기 O
  | 'indirect_attack'   // 간접 공격 (이터널, 엔드리스) - 다른 스킬 적중시 자동 발동
  | 'active_buff'       // 액티브 버프 (오쓰, 리버레이션 오브) - 숨돌리기 X
  | 'instant_skill'     // 즉발형 스킬 (메모라이즈) - 숨돌리기 X
  | 'summon';          // 소환 스킬 (진리의 문, 세례, 퍼니싱) - 숨돌리기 X

export interface DynamicSkillProperties {
  damage?: number;
  hitCount?: number;
  element?: SkillElement;
  maxTargets?: number;
  gaugeCharge?: number;
}

export interface SkillData {
  id: string;
  name: string;
  icon: string;
  element: SkillElement;
  category: SkillCategory;
  
  // 데미지 관련
  damage?: number;  // 기본 데미지
  damageSunfire?: number;  // 선파이어시 데미지 (퍼니싱)
  damageEclipse?: number;  // 이클립스시 데미지 (퍼니싱)
  damageEquilibrium?: number;  // 이퀼시 데미지 (노바, 퍼니싱)
  damagePassive?: number;  // 패시브 데미지 (오브)
  damageActive?: number;  // 액티브 데미지 (오브)
  damageActiveImbalance?: number;  // 불균형시 데미지 (오브)
  
  // 타격 관련
  hitCount?: number;
  hitCountSunfire?: number;  // 선파이어시 타수
  hitCountEclipse?: number;  // 이클립스시 타수
  hitCountEquilibrium?: number;  // 이퀼시 타수
  attackCount?: number;  // 연속 공격 횟수 (빛둠세)
  explosionCount?: number;  // 폭발 횟수 (노바)
  
  // 대상 관련
  maxTargets: number;
  maxTargetsPassiveLight?: number;  // 패시브 빛 대상 수 (오브)
  maxTargetsPassiveDark?: number;   // 패시브 어둠 대상 수 (오브)
  
  // 게이지 관련
  gaugeCharge: number;
  gaugeChargeVI?: number;  // VI 스킬 사용시
  gaugeChargeRecharge?: number;  // 리차지 적용시
  gaugeChargeVIRecharge?: number;  // VI + 리차지
  
  // 쿨타임 관련
  cooldown: number;
  cooldownVI?: number;  // VI 스킬 쿨타임
  actionDelay?: number; // 액션 딜레이 (ms, 기본: 600ms)
  cooldownReductionOnEquilibriumSkill?: {
    amount: number;                    // 감소량 (ms)
    excludeSkills?: string[];          // 제외할 스킬 ID들
    excludeConditions?: {              // 더 복잡한 제외 조건
      skillId: string;
      whenState?: LuminousState[];     // 특정 상태에서만 제외
    }[];
  };
  
  // 버프/지속 관련
  duration?: number;  // 지속시간
  damageIncrease?: number;  // 데미지 증가량 (오쓰)
  
  // 소환수 관련
  summonType?: 'instant' | 'placed';  // 즉시 소환 / 설치형
  summonDuration?: number;             // 소환수 지속시간 (ms)
  summonAttackInterval?: number;       // 소환수 공격 주기 (ms)
  summonRange?: number;                // 소환수 사거리
  summonDelay?: number;                // 소환 완료까지 시간 (ms, 기본: actionDelay와 동일)
  
  // 특수 효과
  isEquilibriumSkill?: boolean;  // 이퀼리브리엄 계열 스킬 여부
  additionalCritRate?: number;  // 추가 크리티컬 확률
  additionalIgnoreDefense?: number;  // 추가 방어율 무시
  additionalIgnoreDefenseVI?: number;  // VI시 추가 방무
  ignoreBuffDuration?: boolean;  // 버프 지속시간 증가 무시 (메모라이즈)
  usageLimit?: 'once_per_equilibrium';  // 사용 제한
  
  // 시스템 연동 관련
  canDirectUse?: boolean;             // 직접 사용 가능 여부 (기본: true)
  canUseWhileCasting?: boolean;       // 다른 스킬 사용 중에도 사용 가능 (기본: false)
  cannotUseWhileCasting?: string[];   // 특정 스킬들 사용 중에는 사용 불가 (스킬 ID 배열)
  triggersBreathing?: boolean;        // 숨돌리기 발동 여부 (기본: category 기반 자동 결정)
  affectedByBuffDuration?: boolean;   // 버프 지속시간 증가 적용 여부 (기본: true)
  affectedByCooldownReduction?: boolean; // 쿨타임 감소 적용 여부 (기본: true)
  
  // 간접 스킬용 트리거 조건
  triggerConditions?: {
    onSkillHit?: {
      elements?: SkillElement[];        // 어떤 속성 스킬 적중시
      categories?: SkillCategory[];     // 어떤 카테고리 적중시
      requiredState?: LuminousState[];  // 필요한 상태
    };
  };
  
  // 강화 관련
  canEnhanceFifth?: boolean;     // 5차 강화 가능 여부 (기본 true)
  canEnhanceSixth?: boolean;     // 6차 강화 가능 여부 (기본 true)
  fifthEnhanceRate?: number;     // 5차 강화 레벨당 증가율 (기본 2%)
  sixthEnhanceRate?: number;     // 6차 강화 레벨당 증가율 (기본 3%)
  maxFifthLevel?: number;        // 최대 5차 레벨 (기본 60)
  maxSixthLevel?: number;        // 최대 6차 레벨 (기본 30)
  
  // 동적 스킬 관련
  isDynamic?: boolean;
  getDynamicProperties?: (state: LuminousState) => DynamicSkillProperties;
  
  description?: string;
  defaultKeyBinding?: string;
}