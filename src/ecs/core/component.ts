// src/ecs/core/component.ts
import type { Entity } from './entity';

/**
 * 모든 컴포넌트의 기본 추상 클래스
 * 각 컴포넌트는 데이터만 포함하며 로직은 포함하지 않음
 */
export abstract class Component {
  /** 이 컴포넌트를 소유한 엔티티 참조 */
  entity: Entity | null = null;
  
  /** 컴포넌트 타입 (자식 클래스에서 구현해야 함) */
  abstract get type(): string;
  
  /**
   * 이 컴포넌트의 사본 생성
   * @returns 동일한 속성을 가진 새 컴포넌트
   */
  abstract clone(): Component;
  
  /**
   * 직렬화 메서드 - JSON 변환을 위한 객체 반환
   * @returns 순수 객체 표현
   */
  serialize(): any {
    const result: any = {
      type: this.type
    };
    
    // 일반 객체로 변환 (기본 구현 - 자식 클래스에서 오버라이드 가능)
    for (const [key, value] of Object.entries(this)) {
      if (key !== 'entity' && key !== 'type') {
        result[key] = value;
      }
    }
    
    return result;
  }
}