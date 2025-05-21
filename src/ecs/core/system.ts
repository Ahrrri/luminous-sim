// src/ecs/core/system.ts
import type { World } from './world';

/**
 * 시스템 추상 클래스
 * 특정 컴포넌트를 가진 엔티티들에 동작하는 로직 포함
 */
export abstract class System {
  /** 우선순위 (높을수록 먼저 실행) */
  priority: number = 0;
  
  /** 활성화 여부 */
  enabled: boolean = true;
  
  /**
   * @param world 이 시스템이 동작할 월드 참조
   */
  constructor(protected world: World) {}
  
  /**
   * 시스템 업데이트 메서드 (각 자식 클래스에서 구현)
   * @param deltaTime 이전 프레임과의 시간 차이 (ms)
   */
  abstract update(deltaTime: number): void;
  
  /**
   * 시스템 초기화 (필요 시 자식 클래스에서 오버라이드)
   */
  initialize(): void {}
  
  /**
   * 시스템 정리 (필요 시 자식 클래스에서 오버라이드)
   */
  cleanup(): void {}
}