// src/utils/helpers.ts
// 유용한 헬퍼 함수들
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatTimeWithMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000); // Math.floor를 사용하여 소수점 제거
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export function calculateCooldown(baseCooldown: number, merLevel: number, cooldownReduction: number): number {
  // 메르 레벨과 쿨감에 따른 실제 쿨타임 계산
  const merReduction = baseCooldown * (merLevel / 100);
  let remaining = baseCooldown - merReduction;
  
  // 쿨감 적용 (10초까지는 그대로 감소, 이후 1초당 5% 비율로 감소)
  if (remaining > 10000) {
    const overTenSeconds = remaining - 10000;
    const reductionUntil10s = Math.min(cooldownReduction * 1000, 10000);
    let additionalReduction = 0;
    
    if (cooldownReduction * 1000 > 10000) {
      // 10초 이상 쿨감이 가능한 경우
      const remainingReduction = (cooldownReduction * 1000) - 10000;
      additionalReduction = (overTenSeconds * (remainingReduction / 1000) * 0.05);
    }
    
    remaining = remaining - reductionUntil10s - additionalReduction;
  } else {
    // 10초 이하인 경우
    remaining = Math.max(remaining - (cooldownReduction * 1000), 5000);
  }
  
  // 5초 미만으로는 감소 불가 (이미 5초 미만인 경우는 예외)
  if (baseCooldown >= 5000) {
    return Math.max(remaining, 5000);
  } else {
    return remaining;
  }
}

// 서버렉 시뮬레이션
export function simulateServerLag(probability: number, maxDuration: number): number {
  if (Math.random() <= probability) {
    return Math.random() * maxDuration;
  }
  return 0;
}

// 루미너스 게이지 충전량 계산
export function calculateGaugeCharge(
  baseCharge: number, 
  skillElement: string, 
  characterState: string
): number {
  // 이퀼 상태가 아닐 때는 반대 속성 스킬만 게이지 충전
  if (characterState === 'LIGHT' && skillElement !== 'DARK') {
    return 0;
  }
  if (characterState === 'DARK' && skillElement !== 'LIGHT') {
    return 0;
  }
  
  // 이퀼 상태에서는 모든 스킬이 게이지 충전 가능
  return baseCharge;
}

// 빛/어둠/이퀼 상태에 따른 스킬 데미지 계산
export function calculateElementalMultiplier(
  skillElement: string, 
  characterState: string
): number {
  // 이퀼 상태에서는 모든 속성 스킬이 동일한 데미지
  if (characterState === 'EQUILIBRIUM') {
    return 1.0;
  }
  
  // 상태와 스킬 속성이 일치하면 추가 데미지
  if ((characterState === 'LIGHT' && skillElement === 'LIGHT') ||
      (characterState === 'DARK' && skillElement === 'DARK')) {
    return 1.5; // 50% 추가 데미지
  }
  
  return 1.0;
}