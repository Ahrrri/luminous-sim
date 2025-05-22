// src/ecs/core/World.ts
import { Entity } from './Entity';
import type { EntityId } from './Entity';
import type { Component } from './Component';
import type { System } from './System';

export interface ComponentStore {
  [componentType: string]: Map<EntityId, Component>;
}

export interface SystemEventCallback {
  (eventType: string, entity: Entity, component?: Component): void;
}

export class World {
  private entities = new Map<EntityId, Entity>();
  private components: ComponentStore = {};
  private systems: System[] = [];
  private eventCallbacks = new Map<string, SystemEventCallback[]>();

  // Entity 관리
  createEntity(): Entity {
    const entity = new Entity();
    this.entities.set(entity.id, entity);
    this.emit('entity:created', entity);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    // 모든 컴포넌트 제거
    Object.keys(this.components).forEach(type => {
      this.removeComponent(entity, type);
    });
    
    this.entities.delete(entity.id);
    this.emit('entity:destroyed', entity);
  }

  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  // Component 관리
  addComponent<T extends Component>(entity: Entity, component: T): void {
    const type = component.type;
    
    if (!this.components[type]) {
      this.components[type] = new Map();
    }
    
    this.components[type].set(entity.id, component);
    this.emit('component:added', entity, component);
  }

  removeComponent(entity: Entity, componentType: string): void {
    const componentStore = this.components[componentType];
    if (componentStore) {
      const component = componentStore.get(entity.id);
      if (component) {
        componentStore.delete(entity.id);
        this.emit('component:removed', entity, component);
      }
    }
  }

  getComponent<T extends Component>(entity: Entity, componentType: string): T | undefined {
    const componentStore = this.components[componentType];
    return componentStore?.get(entity.id) as T;
  }

  hasComponent(entity: Entity, componentType: string): boolean {
    return this.components[componentType]?.has(entity.id) ?? false;
  }

  // System 관리
  addSystem(system: System): void {
    system.setWorld(this);
    this.systems.push(system);
    system.init();
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index >= 0) {
      system.cleanup();
      this.systems.splice(index, 1);
    }
  }

  // System 조회 메서드 추가
  getSystem<T extends System>(systemName: string): T | undefined {
    return this.systems.find(system => system.name === systemName) as T;
  }

  getAllSystems(): System[] {
    return [...this.systems];
  }

  // 모든 시스템 업데이트
  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  // Query 시스템 - 특정 컴포넌트를 가진 Entity들 검색
  query(componentTypes: string[]): Entity[] {
    return this.getAllEntities().filter(entity => 
      componentTypes.every(type => this.hasComponent(entity, type))
    );
  }

  // 이벤트 시스템
  on(eventType: string, callback: SystemEventCallback): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  off(eventType: string, callback: SystemEventCallback): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, entity: Entity, component?: Component): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(eventType, entity, component));
    }
  }

  // 외부에서 이벤트를 발생시킬 수 있도록 public 메서드 추가
  emitEvent(eventType: string, entity: Entity, data?: any): void {
    this.emit(eventType, entity, data);
  }

  // World 상태 초기화
  clear(): void {
    // 모든 시스템 정리
    this.systems.forEach(system => system.cleanup());
    this.systems.length = 0;

    // 모든 데이터 정리
    this.entities.clear();
    this.components = {};
    this.eventCallbacks.clear();
  }
}