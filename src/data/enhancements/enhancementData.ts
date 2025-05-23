// src/data/enhancements/enhancementData.ts
import { PREDEFINED_PATTERNS, LINEAR_PATTERNS } from './enhancementPatterns';
import type { EnhancementDataMap } from './types';

export const ENHANCEMENT_DATA: EnhancementDataMap = {
  // ==================== 4차 스킬들 ====================
  
  // 라이트 리플렉션 (4차)
  'reflection': {
    fifth: { type: 'damage_multiplier', rate: 0.02 }, // 2%씩 증가
    sixth: { 
      type: 'skill_data_override',
      overrides: {
        damage: { base: 440, increment: 1.5 },      // 440 + (레벨 * 1.5)
        gaugeCharge: { base: 409, increment: 1.4 }  // 409 + (레벨 * 1.4)
      }
    }
  },
  
  // 아포칼립스 (4차)
  'apocalypse': {
    fifth: { type: 'damage_multiplier', rate: 0.02 },
    sixth: { 
      type: 'skill_data_override',
      overrides: {
        damage: { base: 375, increment: 1.2 },
        gaugeCharge: { base: 430, increment: 1.3 }
      }
    }
  },
  
  // 앱솔루트 킬 (4차)
  'absolute_kill': {
    fifth: { type: 'damage_multiplier', rate: 0.02 },
    sixth: { 
      type: 'skill_data_override',
      overrides: {
        damage: { base: 455, increment: 1.5 },
        cooldown: { base: 12000, increment: -66.7 }, // 12초 → 10초 (30레벨에서)
        additionalIgnoreDefense: { base: 40, increment: 0.167 } // 40% → 45%
      }
    }
  },
  
  // 트와일라잇 노바 (4차)
  'twilight_nova': {
    // 5차 강화 없음
    sixth: { 
      type: 'skill_data_override',
      overrides: {
        // 상태별로 다른 데미지는 getDynamicProperties에서 처리되므로
        // 여기서는 기본 증가만 정의
        gaugeCharge: { base: 346, increment: 1.0 }
      }
    }
  },
  
  // ==================== 5차 스킬들 ====================
  
  // 빛과 어둠의 세례 (5차)
  'baptism_of_light_and_darkness': {
    // 5차 강화 없음
    sixth: {
      type: 'final_damage',
      pattern: 'BAPTISM_FINAL_DAMAGE'
    }
  },
  
  // 퍼니싱 리소네이터 (5차)
  'punishing_resonator': {
    // 5차 강화 없음
    sixth: {
      type: 'damage_multiplier', // 또는 skill_data_override
      pattern: 'PUNISHING_DAMAGE'
    }
  },
  
  // 진리의 문 (5차)
  'door_of_truth': {
    // 5차 강화 없음
    sixth: {
      type: 'damage_multiplier',
      pattern: 'DOOR_OF_TRUTH_DAMAGE'
    }
  },
  
  // 리버레이션 오브 (5차)
  'liberation_orb': {
    // 5차 강화 없음
    sixth: {
      type: 'damage_multiplier',
      pattern: 'LIBERATION_ORB_DAMAGE'
    }
  },
  
  // ==================== 간접 공격 스킬들 ====================
  
  // 이터널 라이트니스 (추가타) - 아포칼립스VI 레벨 종속
  'eternal_lightness': {
    fifth: { type: 'damage_multiplier', rate: 0.02 },
    sixth: { 
      type: 'skill_data_override',
      dependsOn: 'apocalypse', // 아포칼립스VI 레벨을 따라감
      overrides: {
        damage: { base: 280, increment: 1.0 }
      }
    }
  },
  
  // 엔드리스 다크니스 (추가타) - 라이트 리플렉션VI 레벨 종속
  'endless_darkness': {
    fifth: { type: 'damage_multiplier', rate: 0.02 },
    sixth: { 
      type: 'skill_data_override',
      dependsOn: 'reflection', // 라이트 리플렉션VI 레벨을 따라감
      overrides: {
        damage: { base: 285, increment: 1.0 }
      }
    }
  },
  
  // ==================== 버프 스킬들 ====================
  
  // 히어로즈 오쓰 (버프)
  'heroic_oath': {
    // 강화 없음 (버프 스킬)
  },
  
  // 메모라이즈 (즉발)
  'memorize': {
    // 강화 없음
  },
  
  // 엔젤릭 버스터 링크
  'angelic_buster_link': {
    // 강화 없음 (링크 스킬)
  }
};