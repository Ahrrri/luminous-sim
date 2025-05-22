// src/ecs/systems/GaugeSystem.ts
import { System } from '../core/System';
import { GaugeComponent } from '../components/GaugeComponent';
import { StateComponent } from '../components/StateComponent';

export class GaugeSystem extends System {
  readonly name = 'GaugeSystem';

  update(deltaTime: number): void {
    // 이 시스템은 주로 이벤트 기반으로 동작
    // 스킬 사용 시 게이지 충전이 발생
  }

  // 게이지 충전
  chargeGauge(entity: any, skillElement: 'LIGHT' | 'DARK', amount: number): void {
    const gaugeComp = this.world.getComponent<GaugeComponent>(entity, 'gauge');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    
    if (!gaugeComp || !stateComp) return;

    // 상태에 따른 게이지 충전 규칙
    if (stateComp.currentState === 'DARK') {
      // 어둠 상태에서는 어둠 게이지만 충전
      if (skillElement === 'DARK') {
        gaugeComp.chargeDarkGauge(amount);
        this.world.emitEvent('gauge:charged', entity, { type: 'dark', amount });
      }
    } else if (stateComp.currentState === 'LIGHT') {
      // 빛 상태에서는 빛 게이지만 충전
      if (skillElement === 'LIGHT') {
        gaugeComp.chargeLightGauge(amount);
        this.world.emitEvent('gauge:charged', entity, { type: 'light', amount });
      }
    } else if (stateComp.currentState === 'EQUILIBRIUM') {
      // 이퀼 상태에서는 다음 상태에 따라 게이지 충전
      if (stateComp.nextState === 'LIGHT' && skillElement === 'LIGHT') {
        gaugeComp.chargeDarkGauge(amount);
        this.world.emitEvent('gauge:charged', entity, { type: 'light', amount });
      } else if (stateComp.nextState === 'DARK' && skillElement === 'DARK') {
        gaugeComp.chargeLightGauge(amount);
        this.world.emitEvent('gauge:charged', entity, { type: 'dark', amount });
      }
    }
  }
}