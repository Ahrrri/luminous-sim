// src/utils/cooldownUtils.ts

/**
 * 메르세데스 레벨에 따른 쿨타임 감소율
 */
export const getMercedesCooldownReduction = (merLevel: number): number => {
    switch (merLevel) {
      case 0: return 0;     // 70레벨 미만
      case 2: return 0.02;  // 70레벨
      case 3: return 0.03;  // 120레벨
      case 4: return 0.04;  // 160레벨
      case 5: return 0.05;  // 200레벨
      case 6: return 0.06;  // 210레벨
      default: return 0;
    }
  };
  
  /**
   * 실제 쿨타임 계산
   * 문서 기준:
   * 1. 메르 쿨감 % 먼저 적용
   * 2. 쿨뚝 n초 적용 (10초까지는 그대로, 이후는 5%씩)
   * 3. 최소 5초 제한
   */
  export const calculateActualCooldown = (
    baseCooldown: number,
    merLevel: number,
    cooldownReduction: number
  ): number => {
    // 0초 쿨타임은 그대로 반환
    if (baseCooldown === 0) return 0;
    
    // 1. 메르 쿨감 적용
    const merReduction = getMercedesCooldownReduction(merLevel);
    let cooldown = baseCooldown * (1 - merReduction);
    
    // 2. 쿨뚝 적용
    if (cooldownReduction > 0) {
      if (cooldown > 10000) {
        // 10초 초과분에 대해
        const reductionFor10s = Math.min(cooldownReduction * 1000, cooldown - 10000);
        cooldown -= reductionFor10s;
        
        // 남은 쿨뚝을 %로 변환 (1초당 5%)
        const remainingReduction = Math.max(0, cooldownReduction - reductionFor10s / 1000);
        if (remainingReduction > 0 && cooldown > 10000) {
          const percentReduction = remainingReduction * 0.05;
          cooldown *= (1 - percentReduction);
        }
      } else {
        // 10초 이하는 쿨뚝을 %로 적용
        const percentReduction = cooldownReduction * 0.05;
        cooldown *= (1 - percentReduction);
      }
    }
    
    // 3. 최소 5초 제한
    return Math.max(5000, Math.floor(cooldown));
  };
  
  /**
   * 프리드의 가호 1중첩 효과 적용
   * 재사용 대기시간이 10% 더 빠르게 감소
   */
  export const applyFreedBlessingReduction = (cooldown: number): number => {
    return cooldown * 0.9;
  };
  
  /**
   * 재사용 대기시간 미적용 확률 계산
   */
  export const calculateCooldownResetChance = (baseChance: number): boolean => {
    return Math.random() * 100 < baseChance;
  };