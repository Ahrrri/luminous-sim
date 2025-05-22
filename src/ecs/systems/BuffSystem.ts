// src/ecs/systems/BuffSystem.ts
import { System } from '../core/System';
import { BuffComponent } from '../components/BuffComponent';
import type { BuffData } from '../components/BuffComponent';
import { TimeComponent } from '../components/TimeComponent';

export class BuffSystem extends System {
  readonly name = 'BuffSystem';

  update(deltaTime: number): void {
    const entities = this.world.query(['buff', 'time']);
    
    entities.forEach(entity => {
      const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
      const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
      
      if (buffComp && timeComp) {
        // 만료된 버프들 제거
        const expiredBuffs = buffComp.removeExpiredBuffs(timeComp.currentTime);
        
        // 만료 이벤트 발생
        expiredBuffs.forEach(buff => {
          this.world.emitEvent('buff:expired', entity, buff);
        });
      }
    });
  }

  // 버프 적용
  applyBuff(entity: any, buffData: BuffData): void {
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (buffComp && timeComp) {
      // 시작 시간과 종료 시간 설정
      buffData.startTime = timeComp.currentTime;
      buffData.endTime = timeComp.currentTime + buffData.duration;
      
      buffComp.addBuff(buffData);
      
      // 버프 적용 이벤트
      this.world.emitEvent('buff:applied', entity, buffData);
    }
  }
}