// src/ecs/components/ActionDelayComponent.ts
import { BaseComponent } from '../core/Component';

export class ActionDelayComponent extends BaseComponent {
  readonly type = 'actionDelay';
  
  constructor(
    public isInActionDelay: boolean = false,
    public actionDelayEndTime: number = 0,
    public currentActionSkillId: string = '',
    public canInterruptWithSpecialSkills: boolean = true
  ) {
    super();
  }

  // 액션 딜레이 시작
  startActionDelay(skillId: string, delay: number, currentTime: number): void {
    this.isInActionDelay = true;
    this.actionDelayEndTime = currentTime + delay;
    this.currentActionSkillId = skillId;
  }

  // 액션 딜레이 종료
  endActionDelay(): void {
    this.isInActionDelay = false;
    this.actionDelayEndTime = 0;
    this.currentActionSkillId = '';
  }

  // 액션 딜레이 중인지 확인
  isActionDelayActive(currentTime: number): boolean {
    if (!this.isInActionDelay) return false;
    
    if (currentTime >= this.actionDelayEndTime) {
      this.endActionDelay();
      return false;
    }
    
    return true;
  }

  // 남은 액션 딜레이 시간
  getRemainingDelay(currentTime: number): number {
    if (!this.isActionDelayActive(currentTime)) return 0;
    return Math.max(0, this.actionDelayEndTime - currentTime);
  }

  clone(): ActionDelayComponent {
    return new ActionDelayComponent(
      this.isInActionDelay,
      this.actionDelayEndTime,
      this.currentActionSkillId,
      this.canInterruptWithSpecialSkills
    );
  }
}