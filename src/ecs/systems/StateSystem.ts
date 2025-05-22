// src/ecs/systems/StateSystem.ts
import { System } from '../core/System';
import { StateComponent } from '../components/StateComponent';
import { GaugeComponent } from '../components/GaugeComponent';
import { BuffComponent } from '../components/BuffComponent';
import { TimeComponent } from '../components/TimeComponent';

export class StateSystem extends System {
  readonly name = 'StateSystem';

  update(deltaTime: number): void {
    const entities = this.world.query(['state', 'gauge', 'time']);
    
    entities.forEach(entity => {
      const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
      const gaugeComp = this.world.getComponent<GaugeComponent>(entity, 'gauge');
      const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
      
      if (!stateComp || !gaugeComp || !timeComp) return;

      // 이퀼리브리엄 상태 종료 체크
      if (stateComp.currentState === 'EQUILIBRIUM') {
        this.checkEquilibriumEnd(entity, stateComp, gaugeComp, timeComp);
      }

      // 게이지 가득참 -> 이퀼 유예 상태 체크
      if (stateComp.currentState !== 'EQUILIBRIUM') {
        this.checkGaugeFullForEquilibrium(entity, stateComp, gaugeComp);
      }

      // 자동 모드에서 이퀼 유예 -> 자동 진입
      if (stateComp.isInEquilibriumDelay && stateComp.equilibriumMode === 'AUTO') {
        this.enterEquilibrium(entity, stateComp, gaugeComp, timeComp);
      }
    });
  }

  private checkEquilibriumEnd(
    entity: any, 
    stateComp: StateComponent, 
    gaugeComp: GaugeComponent, 
    timeComp: TimeComponent
  ): void {
    if (stateComp.equilibriumEndTime && timeComp.currentTime >= stateComp.equilibriumEndTime) {
      this.exitEquilibrium(entity, stateComp, gaugeComp);
    }
  }

  private checkGaugeFullForEquilibrium(
    entity: any, 
    stateComp: StateComponent, 
    gaugeComp: GaugeComponent
  ): void {
    if (stateComp.currentState === 'LIGHT' && gaugeComp.isDarkFull()) {
      stateComp.isInEquilibriumDelay = true;
    } else if (stateComp.currentState === 'DARK' && gaugeComp.isLightFull()) {
      stateComp.isInEquilibriumDelay = true;
    }
  }

  public enterEquilibrium(
    entity: any, 
    stateComp: StateComponent, 
    gaugeComp: GaugeComponent, 
    timeComp: TimeComponent
  ): void {
    const prevState = stateComp.currentState;
    
    // 상태 변경
    stateComp.currentState = 'EQUILIBRIUM';
    stateComp.isInEquilibriumDelay = false;
    stateComp.nextState = prevState === 'LIGHT' ? 'DARK' : 'LIGHT';
    
    // 이퀼 지속시간 설정 (기본 17초, 버프 지속시간 증가 효과는 나중에 적용)
    const baseDuration = 17000; // 17초
    stateComp.equilibriumEndTime = timeComp.currentTime + baseDuration;

    // 이벤트 발생
    this.world.emitEvent('state:entered_equilibrium', entity, stateComp);
  }

  private exitEquilibrium(
    entity: any, 
    stateComp: StateComponent, 
    gaugeComp: GaugeComponent
  ): void {
    const nextState = stateComp.nextState;
    
    // 상태 변경
    stateComp.currentState = nextState;
    stateComp.isInEquilibriumDelay = false;
    stateComp.equilibriumEndTime = undefined;
    
    // 게이지 초기화
    if (nextState === 'LIGHT') {
      gaugeComp.resetLightGauge();
    } else {
      gaugeComp.resetDarkGauge();
    }

    // 이벤트 발생
    this.world.emitEvent('state:exited_equilibrium', entity, stateComp);
  }
}