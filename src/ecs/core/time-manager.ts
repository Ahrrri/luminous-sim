// src/ecs/core/time-manager.ts
import type { World } from './world';
import type { GameEvent } from './event-bus';

/** 예약된 이벤트 인터페이스 */
interface ScheduledEvent {
    /** 이벤트가 발생할 시간 */
    time: number;
    /** 발행할 이벤트 */
    event: GameEvent;
    /** 반복 간격 (ms, 0이면 반복 안 함) */
    repeatInterval?: number;
    /** 고유 ID */
    id: string;
}

/**
 * 시간 관리자 클래스
 * 시간 경과 처리 및 이벤트 예약
 */
export class TimeManager {
    /** 현재 게임 내 시간 (ms) */
    private currentTime: number = 0;

    /** 예약된 이벤트 목록 */
    private scheduledEvents: ScheduledEvent[] = [];

    /** 게임 속도 배율 (1.0 = 정상 속도) */
    private timeScale: number = 1.0;

    /** 일시 정지 여부 */
    private paused: boolean = false;

    /** 다음 이벤트 ID 카운터 */
    private nextEventId: number = 0;

    /**
     * 시간 관리자 생성자
     * @param world 이 관리자가 속한 월드
     */
    constructor(private world: World) { }

    /**
     * 시간 경과 처리
     * @param deltaTime 실제 경과 시간 (ms)
     */
    update(deltaTime: number): void {
        if (this.paused) return;

        // 게임 내 시간 경과
        const scaledDelta = deltaTime * this.timeScale;
        this.currentTime += scaledDelta;

        // 예약된 이벤트 처리
        this.processScheduledEvents();
    }

    /**
     * 이벤트 예약
     * @param delay 지연 시간 (ms)
     * @param event 발행할 이벤트
     * @param repeatInterval 반복 간격 (선택사항, ms)
     * @returns 예약 ID (취소용)
     */
    scheduleEvent(delay: number, event: GameEvent, repeatInterval?: number): string {
        const eventId = `event_${this.nextEventId++}`;

        this.scheduledEvents.push({
            time: this.currentTime + delay,
            event: { ...event, scheduledId: eventId },
            repeatInterval,
            id: eventId
        });

        // 실행 시간 순으로 정렬
        this.sortScheduledEvents();

        return eventId;
    }

    /**
     * 예약된 이벤트 취소
     * @param eventId 취소할 이벤트 ID
     * @returns 취소 성공 여부
     */
    cancelScheduledEvent(eventId: string): boolean {
        const initialLength = this.scheduledEvents.length;
        this.scheduledEvents = this.scheduledEvents.filter(e => e.id !== eventId);
        return initialLength !== this.scheduledEvents.length;
    }

    /**
     * 현재 게임 시간 가져오기
     * @returns 현재 게임 시간 (ms)
     */
    getCurrentTime(): number {
        return this.currentTime;
    }

    /**
     * 게임 속도 설정
     * @param scale 새 속도 배율 (1.0 = 정상 속도)
     */
    setTimeScale(scale: number): void {
        this.timeScale = Math.max(0.0, scale);
    }

    /**
     * 일시 정지 설정
     * @param paused 일시 정지 여부
     */
    setPaused(paused: boolean): void {
        this.paused = paused;
    }

    /**
     * 시간 관리자 초기화
     */
    reset(): void {
        this.currentTime = 0;
        this.scheduledEvents = [];
        this.timeScale = 1.0;
        this.paused = false;
        this.nextEventId = 0;
    }

    /**
     * 예약된 이벤트 처리
     */
    private processScheduledEvents(): void {
        // 실행할 이벤트가 있는 동안 반복
        while (
            this.scheduledEvents.length > 0 &&
            this.scheduledEvents[0].time <= this.currentTime
        ) {
            const event = this.scheduledEvents.shift()!;

            // 이벤트 발행
            this.world.events.publish(event.event);

            // 반복 이벤트인 경우 재예약
            if (event.repeatInterval && event.repeatInterval > 0) {
                this.scheduledEvents.push({
                    time: this.currentTime + event.repeatInterval,
                    event: event.event,
                    repeatInterval: event.repeatInterval,
                    id: event.id
                });

                // 재정렬
                this.sortScheduledEvents();
            }
        }
    }

    /**
     * 예약된 이벤트 정렬
     * 실행 시간 순으로 오름차순 정렬
     */
    private sortScheduledEvents(): void {
        this.scheduledEvents.sort((a, b) => a.time - b.time);
    }

    /**
   * 고정 타임스텝 모드 활성화
   * 실시간 시뮬레이션에서는 비활성화, 빠른 시뮬레이션에서는 활성화
   * @param enabled 활성화 여부
   * @param fixedStep 고정 타임스텝 크기 (ms)
   */
    setFixedTimestepMode(enabled: boolean, fixedStep: number = 30): void {
        this.useFixedTimestep = enabled;
        this.fixedTimestep = fixedStep;
    }

    /**
     * 여러 단계를 한번에 진행
     * 빠른 시뮬레이션에 사용
     * @param steps 진행할 스텝 수
     * @param stepSize 각 스텝 크기 (ms)
     */
    advanceMultipleSteps(steps: number, stepSize: number = 30): void {
        for (let i = 0; i < steps; i++) {
            this.currentTime += stepSize;
            this.processScheduledEvents();

            // 시간 진행 이벤트 발행
            this.world.events.publish({
                type: 'TIME_ADVANCED',
                amount: stepSize,
                currentTime: this.currentTime
            });
        }
    }

    /**
     * 특정 시간으로 점프
     * 에피소드 재생에 사용
     * @param targetTime 대상 시간 (ms)
     */
    jumpToTime(targetTime: number): void {
        this.currentTime = targetTime;
        this.processScheduledEvents();

        // 시간 점프 이벤트 발행
        this.world.events.publish({
            type: 'TIME_JUMPED',
            targetTime,
            previousTime: this.currentTime
        });
    }
}

