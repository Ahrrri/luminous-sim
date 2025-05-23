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
   * 2. 쿨뚝 n초 적용
   *    - 10초 초과 부분: n초 그대로 빼기
   *    - 10초 이하 부분: n초를 5% × n 비율로 감소
   * 3. 쿨뚝 적용 결과가 5초 미만이 되면 5초로 제한
   *    (단, 원래 쿨타임이 5초 미만이었다면 쿨뚝 적용 없이 그대로)
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

  // 원래 쿨타임이 5초 미만이면 쿨뚝 적용 없이 그대로 반환
  if (cooldown < 5000) {
    return Math.floor(cooldown);
  }

  // 2. 쿨뚝 적용 (5초 이상인 경우만)
  if (cooldownReduction > 0) {
    if (cooldown > 10000) {
      // 10초 초과분: 쿨뚝을 그대로 빼기
      const excessTime = cooldown - 10000;
      const reductionForExcess = Math.min(cooldownReduction * 1000, excessTime);
      cooldown -= reductionForExcess;

      // 남은 쿨뚝이 있으면 10초 이하 부분에 %로 적용
      const remainingReduction = cooldownReduction - (reductionForExcess / 1000);
      if (remainingReduction > 0) {
        const percentReduction = remainingReduction * 0.05;
        cooldown *= (1 - percentReduction);
      }
    } else {
      // 10초 이하: 쿨뚝을 %로 적용 (1초당 5%)
      const percentReduction = cooldownReduction * 0.05;
      cooldown *= (1 - percentReduction);
    }
  }

  // 3. 쿨뚝 적용 결과가 5초 미만이 되면 5초로 제한
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