// src/utils/serverLagUtils.ts

/**
 * 서버렉 적용 가능한 버프 타입
 */
export const SERVER_LAG_APPLICABLE_BUFFS = [
    'equilibrium',      // 이퀼리브리엄
    'one_hit_kill',     // 일필
    'link_skills',      // 각종 링크 스킬
    'angelic_buster',   // 엔버 링크
    'freed_blessing'    // 프리드의 가호 (6스택 제외)
  ];
  
  /**
   * 서버렉 계산
   * 확률적으로 0~maxDuration ms 만큼 버프 종료 지연
   */
  export const calculateServerLag = (
    probability: number,
    maxDuration: number
  ): number => {
    if (Math.random() * 100 < probability) {
      // 서버렉 발생
      return Math.floor(Math.random() * maxDuration);
    }
    return 0;
  };
  
  /**
   * 서버렉이 적용된 실제 버프 종료 시간 계산
   */
  export const applyServerLagToBuffEnd = (
    originalEndTime: number,
    serverLagEnabled: boolean,
    serverLagProbability: number,
    serverLagDuration: number
  ): number => {
    if (!serverLagEnabled) {
      return originalEndTime;
    }
    
    const lag = calculateServerLag(serverLagProbability, serverLagDuration);
    return originalEndTime + lag;
  };
  
  /**
   * 서버렉 그룹화 효과
   * 비슷한 시간에 끝나는 버프들이 함께 종료되는 경향
   */
  export const groupServerLagBuffs = (
    buffs: Array<{ id: string; endTime: number }>,
    groupingWindow: number = 3000 // 3초 이내
  ): Array<{ id: string; endTime: number; laggedEndTime: number }> => {
    const sortedBuffs = [...buffs].sort((a, b) => a.endTime - b.endTime);
    const result = [];
    
    for (let i = 0; i < sortedBuffs.length; i++) {
      const buff = sortedBuffs[i];
      let laggedEndTime = buff.endTime;
      
      // 이전 버프와의 시간 차이 확인
      if (i > 0) {
        const prevBuff = result[i - 1];
        const timeDiff = buff.endTime - prevBuff.endTime;
        
        if (timeDiff <= groupingWindow) {
          // 그룹화: 이전 버프와 동시에 종료
          laggedEndTime = prevBuff.laggedEndTime;
        }
      }
      
      result.push({
        ...buff,
        laggedEndTime
      });
    }
    
    return result;
  };