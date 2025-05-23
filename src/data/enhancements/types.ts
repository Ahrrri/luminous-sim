// src/data/enhancements/types.ts

export type EnhancementType = 
  | 'damage_multiplier'      // 기존 퍼뎀에 곱하기 (5차 강화)
  | 'final_damage'          // 최종 데미지 증가 (세례 6차)
  | 'skill_data_override'   // 스킬 데이터 자체 변경 (VI 스킬)
  | 'additional_effect';    // 추가 효과 (쿨타임 감소, 타수 증가 등)

export interface FifthEnhancement {
  type: 'damage_multiplier';
  rate: number;  // 레벨당 증가율 (0.02 = 2%)
}

export interface SixthEnhancement {
  type: EnhancementType;
  levels?: number[];  // 미리 정의된 배열
  pattern?: string;   // 패턴 이름 (PREDEFINED_PATTERNS의 키)
  dependsOn?: string; // 다른 스킬의 6차 레벨을 따라가는 경우 (이터널/엔드리스용)
  overrides?: {       // skill_data_override용
    [key: string]: {
      levels?: number[];
      base?: number;
      increment?: number;
    }
  };
}

export interface SkillEnhancementData {
  fifth?: FifthEnhancement;
  sixth?: SixthEnhancement;
}

export interface EnhancementDataMap {
  [skillId: string]: SkillEnhancementData;
}

// 실제 적용된 강화 효과
export interface AppliedEnhancement {
  skillId: string;
  fifthLevel: number;    // 0~60
  sixthLevel: number;    // 0~30
  
  // 계산된 효과들
  fifthMultiplier: number;        // 5차 데미지 배율
  sixthFinalDamage?: number;      // 6차 최종 데미지 증가
  overriddenSkillData?: Partial<any>; // 덮어쓴 스킬 데이터
}

export interface EnhancementSettings {
  [skillId: string]: {
    fifthLevel: number;
    sixthLevel: number;
  };
}