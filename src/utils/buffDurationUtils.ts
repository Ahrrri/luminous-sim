// src/utils/buffDurationUtils.ts

/**
 * 버프 지속시간 증가 계산
 * 기본값에 버프 지속시간 증가 %를 적용
 */
export const calculateBuffDuration = (
    baseDuration: number,
    buffDurationIncrease: number,
    ignoreBuffDuration: boolean = false
  ): number => {
    if (ignoreBuffDuration) {
      return baseDuration;
    }
    
    return Math.floor(baseDuration * (1 + buffDurationIncrease / 100));
  };
  
  /**
   * 이퀼리브리엄 지속시간 계산
   * 기본 17초 + 다크라이트 마스터리 7초 = 24초
   * 여기에 버프 지속시간 증가 적용
   */
  export const calculateEquilibriumDuration = (
    buffDurationIncrease: number,
    isMemorize: boolean = false
  ): number => {
    const baseDuration = 17000; // 17초
    const darkLightMasteryBonus = 7000; // 7초
    
    // 메모라이즈로 발동된 이퀼은 버프 지속시간 증가 무시
    if (isMemorize) {
      return baseDuration; // 17초 고정
    }
    
    const totalBaseDuration = baseDuration + darkLightMasteryBonus; // 24초
    return calculateBuffDuration(totalBaseDuration, buffDurationIncrease);
  };
  
  /**
   * 퍼니싱 리소네이터 2회 사용 가능 여부 판단
   * 이퀼리브리엄이 36초 이상 지속되어야 함
   */
  export const canUseDoublePunishing = (buffDurationIncrease: number): boolean => {
    const equilibriumDuration = calculateEquilibriumDuration(buffDurationIncrease);
    return equilibriumDuration >= 36000; // 36초 이상
  };
  
  /**
   * 버프 지속시간 증가 수치별 실제 이퀼 지속시간
   */
  export const getEquilibriumDurationTable = () => {
    const buffDurationValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];
    return buffDurationValues.map(bd => ({
      buffDuration: bd,
      equilibriumDuration: calculateEquilibriumDuration(bd),
      seconds: calculateEquilibriumDuration(bd) / 1000,
      canDoublePunishing: canUseDoublePunishing(bd)
    }));
  };