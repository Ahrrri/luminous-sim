// src/ecs/core/event-bus.ts

/** 이벤트 콜백 함수 타입 */
export type EventCallback = (event: GameEvent) => void;

/** 게임 이벤트 기본 인터페이스 */
export interface GameEvent {
  /** 이벤트 타입 */
  type: string;
  /** 타임스탬프 */
  timestamp?: number;
  /** 추가 속성 */
  [key: string]: any;
}

/**
 * 이벤트 버스 클래스
 * 이벤트 발행-구독 패턴 구현
 */
export class EventBus {
  /** 이벤트 타입별 리스너 맵 */
  private listeners: Map<string, EventCallback[]> = new Map();
  
  /** 이벤트 히스토리 (디버깅용, 선택사항) */
  private history: GameEvent[] = [];
  
  /** 히스토리 최대 크기 */
  private maxHistorySize: number = 100;
  
  /** 히스토리 활성화 여부 */
  private historyEnabled: boolean = false;
  
  /**
   * 이벤트 구독
   * @param eventType 구독할 이벤트 타입
   * @param callback 이벤트 발생 시 호출될 콜백 함수
   * @returns 구독 취소 함수
   */
  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    const callbacks = this.listeners.get(eventType)!;
    callbacks.push(callback);
    
    // 구독 취소 함수 반환
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * 이벤트 발행
   * @param event 발행할 이벤트 객체
   */
  publish(event: GameEvent): void {
    // 타임스탬프 추가 (없는 경우)
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }
    
    // 이벤트 히스토리에 추가 (활성화 된 경우)
    if (this.historyEnabled) {
      this.addToHistory(event);
    }
    
    // 해당 이벤트 타입의 모든 리스너 호출
    const callbacks = this.listeners.get(event.type) || [];
    for (const callback of callbacks) {
      callback(event);
    }
    
    // 모든 이벤트를 받는 리스너도 호출 ('*' 타입)
    const globalCallbacks = this.listeners.get('*') || [];
    for (const callback of globalCallbacks) {
      callback(event);
    }
  }
  
  /**
   * 히스토리 활성화/비활성화 설정
   * @param enabled 활성화 여부
   * @param maxSize 최대 히스토리 크기 (선택사항)
   */
  enableHistory(enabled: boolean, maxSize?: number): void {
    this.historyEnabled = enabled;
    if (maxSize !== undefined) {
      this.maxHistorySize = maxSize;
    }
  }
  
  /**
   * 이벤트 히스토리 가져오기
   * @returns 이벤트 히스토리 배열
   */
  getHistory(): GameEvent[] {
    return [...this.history];
  }
  
  /**
   * 히스토리 초기화
   */
  clearHistory(): void {
    this.history = [];
  }
  
  /**
   * 히스토리에 이벤트 추가
   * @param event 추가할 이벤트
   */
  private addToHistory(event: GameEvent): void {
    this.history.push(event);
    
    // 최대 크기 유지
    if (this.history.length > this.maxHistorySize) {
      this.history.shift(); // 가장 오래된 이벤트 제거
    }
  }
}