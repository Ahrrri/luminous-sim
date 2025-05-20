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
  // 메르 레벨에 따른 쿨타임 감소(%)
  const merReduction = baseCooldown * (merLevel / 100);
  let remaining = baseCooldown - merReduction;

  // 쿨다운 감소 적용 (ms 단위로 변환)
  const cdrMs = cooldownReduction * 1000;

  if (remaining > 10000) {
    // 10초 초과 구간은 직접 초 단위로 감소
    const reductionUntil10s = Math.min(cdrMs, remaining - 10000);
    remaining -= reductionUntil10s;

    // 10초 이하 구간에 대한 추가 감소 계산
    if (remaining <= 10000 && cdrMs > reductionUntil10s) {
      // 10초 이하 구간에는 비율로 감소
      const remainingCdr = cdrMs - reductionUntil10s;
      const reductionRate = (remainingCdr / 1000) * 0.05; // 1초당 5%
      remaining = remaining * (1 - reductionRate);
    }
  } else if (remaining > 5000) {
    // 10초 이하 구간은 비율로 감소
    const reductionRate = (cdrMs / 1000) * 0.05; // 1초당 5%
    remaining = Math.max(remaining * (1 - reductionRate), 5000);
  }

  return remaining;
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