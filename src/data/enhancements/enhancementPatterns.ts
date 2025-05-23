// src/data/enhancements/enhancementPatterns.ts

// 간단한 패턴 생성 함수들
export const LINEAR_PATTERNS = {
    // 2% 증가 패턴 (4차 스킬 5차 강화용, 0~60레벨)
    damage_2_percent: (base: number) => 
      Array.from({length: 61}, (_, i) => Math.floor(base * (1 + i * 0.02))),
    
    // 선형 증가 패턴들 (4차 스킬 VI용, 0~30레벨)
    linear_increase: (base: number, increment: number) => 
      Array.from({length: 31}, (_, i) => base + Math.floor(i * increment)),
    
    // 퍼센트 증가 패턴 (0~30레벨)
    percent_increase: (base: number, percentPerLevel: number) =>
      Array.from({length: 31}, (_, i) => Math.floor(base * (1 + i * percentPerLevel / 100)))
  };
  
  // 미리 정의된 배열들 (5차 스킬 6차 강화용)
  export const PREDEFINED_PATTERNS = {
    // 빛과 어둠의 세례 6차 최종데미지 증가 (0~30레벨)
    BAPTISM_FINAL_DAMAGE: [0, 3, 6, 9, 12, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63, 67, 71, 75, 79, 83, 87, 91, 95, 99, 103, 107, 111, 115],
    
    // 퍼니싱 리소네이터 6차 데미지 증가 (0~30레벨)
    PUNISHING_DAMAGE: [0, 2, 4, 6, 8, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79, 82, 85],
    
    // 진리의 문 6차 데미지 증가 (0~30레벨) - 예시
    DOOR_OF_TRUTH_DAMAGE: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90],
    
    // 리버레이션 오브 6차 데미지 증가 (0~30레벨) - 예시
    LIBERATION_ORB_DAMAGE: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60]
  };
  
  // 편의 함수: 패턴 타입 구분
  export const createEnhancementLevels = (
    type: 'linear' | 'predefined',
    config: any
  ): number[] => {
    if (type === 'linear') {
      const { base, increment, pattern = 'linear_increase' } = config;
      return LINEAR_PATTERNS[pattern as keyof typeof LINEAR_PATTERNS](base, increment);
    } else {
      return PREDEFINED_PATTERNS[config.pattern as keyof typeof PREDEFINED_PATTERNS];
    }
  };