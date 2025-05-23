// src/data/types/skillTypes.ts

export interface SkillData {
  id: string;
  name: string;
  icon: string;
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';
  
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
  cooldownReductionOnEquilibriumSkill?: number;  // 이퀼 스킬 적중시 감소량
  
  // 버프/지속 관련
  duration?: number;  // 지속시간
  damageIncrease?: number;  // 데미지 증가량 (오쓰)
  
  // 특수 효과
  isEquilibriumSkill?: boolean;  // 이퀼리브리엄 계열 스킬 여부
  additionalCritRate?: number;  // 추가 크리티컬 확률
  additionalIgnoreDefense?: number;  // 추가 방어율 무시
  additionalIgnoreDefenseVI?: number;  // VI시 추가 방무
  ignoreBuffDuration?: boolean;  // 버프 지속시간 증가 무시 (메모라이즈)
  usageLimit?: 'once_per_equilibrium';  // 사용 제한
  
  description?: string;
  defaultKeyBinding?: string;
}

export type SkillElement = 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';

export type SkillCategory = 'light' | 'dark' | 'equilibrium' | 'buff';