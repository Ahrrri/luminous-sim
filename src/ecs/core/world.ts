// src/ecs/core/world.ts
import { Entity } from './entity';
import { System } from './system';
import { EventBus, type GameEvent } from './event-bus';
import { TimeManager } from './time-manager';

/**
 * 월드 클래스
 * 모든 엔티티와 시스템을 관리하고 게임 루프를 실행
 */
export class World {
  /** 엔티티 맵 (ID로 빠른 접근) */
  private entities: Map<string, Entity> = new Map();
  
  /** 시스템 목록 */
  private systems: System[] = [];
  
  /** 이벤트 버스 */
  private eventBus: EventBus;
  
  /** 시간 관리자 */
  private timeManager: TimeManager;
  
  /** 활성화 여부 */
  private active: boolean = true;
  
  /**
   * 월드 생성자
   */
  constructor() {
    this.eventBus = new EventBus();
    this.timeManager = new TimeManager(this);
  }
  
  /**
   * 엔티티 추가
   * @param entity 추가할 엔티티
   * @returns 체이닝을 위한 this
   */
  addEntity(entity: Entity): this {
    this.entities.set(entity.id, entity);
    
    // 엔티티 추가 이벤트 발행
    this.eventBus.publish({
      type: 'ENTITY_ADDED',
      entityId: entity.id
    });
    
    return this;
  }
  
  /**
   * 엔티티 제거
   * @param entityId 제거할 엔티티 ID
   * @returns 제거 성공 여부
   */
  removeEntity(entityId: string): boolean {
    const result = this.entities.delete(entityId);
    
    if (result) {
      // 엔티티 제거 이벤트 발행
      this.eventBus.publish({
        type: 'ENTITY_REMOVED',
        entityId
      });
    }
    
    return result;
  }
  
  /**
   * 엔티티 가져오기
   * @param entityId 엔티티 ID
   * @returns 찾은 엔티티 또는 undefined
   */
  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }
  
  /**
   * 시스템 추가
   * @param system 추가할 시스템
   * @returns 체이닝을 위한 this
   */
  addSystem(system: System): this {
    this.systems.push(system);
    
    // 우선순위 기준 정렬
    this.systems.sort((a, b) => b.priority - a.priority);
    
    // 시스템 초기화
    system.initialize();
    
    return this;
  }
  
  /**
   * 시스템 제거
   * @param systemType 제거할 시스템 클래스
   * @returns 제거 성공 여부
   */
  removeSystem(systemType: Function): boolean {
    const index = this.systems.findIndex(s => s instanceof systemType);
    
    if (index !== -1) {
      const system = this.systems[index];
      
      // 시스템 정리
      system.cleanup();
      
      // 시스템 제거
      this.systems.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * 월드 업데이트
   * @param deltaTime 이전 프레임과의 시간 차이 (ms)
   */
  update(deltaTime: number): void {
    if (!this.active) return;
    
    // 시간 관리자 업데이트
    this.timeManager.update(deltaTime);
    
    // 활성화된 시스템만 업데이트
    for (const system of this.systems) {
      if (system.enabled) {
        system.update(deltaTime);
      }
    }
  }
  
  /**
   * 모든 엔티티 가져오기
   * @returns 엔티티 배열
   */
  get allEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * 특정 컴포넌트를 가진 엔티티 필터링
   * @param componentTypes 필요한 컴포넌트 타입들
   * @returns 조건에 맞는 엔티티 배열
   */
  getEntitiesWith(...componentTypes: string[]): Entity[] {
    return this.allEntities.filter(entity => 
      componentTypes.every(type => entity.hasComponent(type))
    );
  }
  
  /**
   * 이벤트 버스 접근자
   */
  get events(): EventBus {
    return this.eventBus;
  }
  
  /**
   * 시간 관리자 접근자
   */
  get time(): TimeManager {
    return this.timeManager;
  }
  
  /**
   * 이벤트 발행 (편의 메서드)
   * @param event 발행할 이벤트
   */
  publishEvent(event: GameEvent): void {
    this.eventBus.publish(event);
  }
  
  /**
   * 월드 활성화/비활성화
   * @param active 활성화 여부
   */
  setActive(active: boolean): void {
    this.active = active;
  }
  
  /**
   * 월드 초기화 (모든 엔티티 및 시스템 제거)
   */
  clear(): void {
    // 모든 시스템 정리
    for (const system of this.systems) {
      system.cleanup();
    }
    
    this.entities.clear();
    this.systems = [];
    this.eventBus.clearHistory();
    this.timeManager.reset();
  }
}