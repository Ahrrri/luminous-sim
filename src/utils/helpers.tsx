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
  
  export function calculateCooldown(baseCooldown: number, merLevel: number, cooldownReduction: number): number {
    // 메르 레벨과 쿨감에 따른 실제 쿨타임 계산
    const merReduction = baseCooldown * (merLevel / 100);
    let remaining = baseCooldown - merReduction;
    
    // 쿨감 적용 (10초까지는 그대로 감소, 이후 1초당 5% 비율로 감소)
    if (remaining > 10000) {
      const overTenSeconds = remaining - 10000;
      const reductionRatio = Math.min(cooldownReduction * 1000, 10000) / 1000;
      const additionalReduction = (cooldownReduction - reductionRatio > 0) ? 
                                 (overTenSeconds * ((cooldownReduction - reductionRatio) * 5 / 100)) : 0;
      
      remaining = remaining - reductionRatio * 1000 - additionalReduction;
    } else {
      // 10초 이하인 경우
      const reductionRatio = Math.min(cooldownReduction * 1000, remaining) / 1000;
      remaining = remaining - reductionRatio * 1000;
    }
    
    // 5초 미만으로는 감소 불가
    return Math.max(remaining, 5000);
  }