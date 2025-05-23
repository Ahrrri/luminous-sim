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
      this.world.emitEvent('gauge:full', entity, { gaugeType: 'dark' });
    } else if (stateComp.currentState === 'DARK' && gaugeComp.isLightFull()) {
      stateComp.isInEquilibriumDelay = true;
      this.world.emitEvent('gauge:full', entity, { gaugeType: 'light' });
    }
  }

  public enterEquilibrium(
    entity: any, 
    stateComp: StateComponent, 
    gaugeComp: GaugeComponent, 
    timeComp: TimeComponent,
    isMemorize: boolean = false
  ): void {
    const prevState = stateComp.currentState;
    
    // 상태 컴포넌트의 enterEquilibrium 메서드 사용
    stateComp.enterEquilibrium(timeComp.currentTime, isMemorize);
    stateComp.nextState = prevState === 'LIGHT' ? 'DARK' : 'LIGHT';

    // 이퀼리브리엄 버프 추가 (서버렉 적용 가능)
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
    if (buffComp) {
      buffComp.addBuff({
        id: 'equilibrium',
        name: '이퀼리브리엄',
        duration: stateComp.getEquilibriumDuration(),
        maxDuration: stateComp.getEquilibriumDuration(),
        startTime: timeComp.currentTime,
        endTime: stateComp.equilibriumEndTime!,
        effects: {
          // 스탠스 100% 등의 효과는 다른 시스템에서 처리
        },
        ignoreBuffDuration: isMemorize,
        canApplyServerLag: true
      });
    }

    // 이벤트 발생
    this.world.emitEvent('state:entered_equilibrium', entity, { 
      duration: stateComp.getEquilibriumDuration(),
      isMemorize 
    });
  }

  private exitEquilibrium(
    entity: any, 
    stateComp: StateComponent, 
    gaugeComp: GaugeComponent
  ): void {
    const nextState = stateComp.nextState;
    
    // 상태 변경
    stateComp.exitEquilibrium();
    
    // 게이지 초기화
    if (nextState === 'LIGHT') {
      gaugeComp.resetLightGauge();
    } else {
      gaugeComp.resetDarkGauge();
    }

    // 버프 제거
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'buff');
    if (buffComp) {
      buffComp.removeBuff('equilibrium');
    }

    // 이벤트 발생
    this.world.emitEvent('state:exited_equilibrium', entity, { nextState });
  }

  // 메모라이즈로 즉시 이퀼 진입
  public useMemorize(entity: any): boolean {
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    const gaugeComp = this.world.getComponent<GaugeComponent>(entity, 'gauge');
    const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
    
    if (!stateComp || !gaugeComp || !timeComp) return false;
    
    // 이미 이퀼리브리엄 상태면 사용 불가
    if (stateComp.currentState === 'EQUILIBRIUM') return false;
    
    // 메모라이즈로 이퀼 진입
    this.enterEquilibrium(entity, stateComp, gaugeComp, timeComp, true);
    
    // 게이지 초기화
    gaugeComp.resetLightGauge();
    gaugeComp.resetDarkGauge();
    
    return true;
  }
}