// src/ecs/core/entity.ts

/**
 * 게임 세계의 기본 엔티티를 표현하는 클래스
 * 고유 ID와 컴포넌트 모음으로 구성됨
 */
export class Entity {
  readonly id: string;
  private components: Map<string, Component> = new Map();

  constructor(id?: string) {
    // 고유 ID 생성 (제공되지 않은 경우 랜덤 생성)
    this.id = id || crypto.randomUUID();
  }

  /**
   * 컴포넌트를 엔티티에 추가
   * @param component 추가할 컴포넌트
   * @returns 메서드 체이닝을 위한 this 반환
   */
  addComponent(component: Component): this {
    this.components.set(component.type, component);
    component.entity = this;
    return this;
  }

  /**
   * 지정된 타입의 컴포넌트 가져오기
   * @param type 컴포넌트 타입
   * @returns 찾은 컴포넌트 또는 undefined
   */
  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }

  /**
   * 특정 타입의 컴포넌트가 있는지 확인
   * @param type 컴포넌트 타입
   * @returns 존재 여부(boolean)
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * 컴포넌트 제거
   * @param type 제거할 컴포넌트 타입
   * @returns 제거 성공 여부(boolean)
   */
  removeComponent(type: string): boolean {
    const component = this.components.get(type);
    if (component) {
      component.entity = null;
      return this.components.delete(type);
    }
    return false;
  }

  /**
   * 모든 컴포넌트 가져오기
   * @returns 컴포넌트 배열
   */
  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }
}

// 이후에 Component 클래스를 import 해야 하므로 여기서는 타입으로만 참조
import type { Component } from './component';