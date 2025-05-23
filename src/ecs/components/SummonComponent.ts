// src/ecs/components/SummonComponent.ts
import { BaseComponent } from '../core/Component';
import type { EntityId } from '../core/Entity';
import type { LuminousState } from '../../data/types/skillTypes';

export interface SummonData {
  summonId: string;           // 소환수 고유 ID
  skillId: string;            // 소환한 스킬 ID
  ownerId: EntityId;          // 소환한 플레이어 ID
  summonType: 'instant' | 'placed';  // 소환 타입
  
  // 지속시간 관련
  startTime: number;          // 소환 시작 시간
  endTime: number;            // 소환 종료 시간
  isActive: boolean;          // 활성 상태
  
  // 공격 관련
  damage: number;             // 공격력
  hitCount: number;           // 타격 수
  maxTargets: number;         // 최대 대상 수
  attackInterval: number;     // 공격 주기 (ms)
  lastAttackTime: number;     // 마지막 공격 시간
  
  // 위치/범위 관련
  range: number;              // 사거리
  
  // 특수 효과
  additionalCritRate?: number;
  additionalIgnoreDefense?: number;
  
  // 동적 스킬용 (퍼니싱 등)
  isDynamic?: boolean;
  currentState?: LuminousState;  // 현재 라크니스 상태 (퍼니싱용)
}

export class SummonComponent extends BaseComponent {
  readonly type = 'summon';
  
  constructor(public summonData: SummonData) {
    super();
  }

  // 공격 가능한지 확인
  canAttack(currentTime: number): boolean {
    if (!this.summonData.isActive) return false;
    if (currentTime >= this.summonData.endTime) return false;
    
    return currentTime >= this.summonData.lastAttackTime + this.summonData.attackInterval;
  }

  // 공격 실행
  attack(currentTime: number): void {
    this.summonData.lastAttackTime = currentTime;
  }

  // 소환수 만료 확인
  isExpired(currentTime: number): boolean {
    return currentTime >= this.summonData.endTime;
  }

  // 소환수 비활성화
  deactivate(): void {
    this.summonData.isActive = false;
  }

  // 동적 스킬의 상태 업데이트 (퍼니싱용)
  updateState(newState: LuminousState): void {
    if (this.summonData.isDynamic) {
      this.summonData.currentState = newState;
    }
  }

  clone(): SummonComponent {
    return new SummonComponent({ ...this.summonData });
  }
}