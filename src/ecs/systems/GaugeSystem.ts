// src/ecs/systems/GaugeSystem.ts
import { System } from '../core/System';
import { GaugeComponent } from '../components/GaugeComponent';
import { StateComponent } from '../components/StateComponent';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { SkillData } from '../../data/types/skillTypes';

export class GaugeSystem extends System {
  readonly name = 'GaugeSystem';

  update(deltaTime: number): void {
    // 이 시스템은 주로 이벤트 기반으로 동작
    // 스킬 사용 시 게이지 충전이 발생
  }

  // 게이지 충전
  chargeGauge(entity: any, skillId: string, isVI: boolean = false): void {
    const gaugeComp = this.world.getComponent<GaugeComponent>(entity, 'gauge');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    
    if (!gaugeComp || !stateComp) return;

    // 스킬 데이터 가져오기
    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef) return;

    // 게이지 충전량 결정
    let chargeAmount = 0;
    
    if (skillDef.element === 'LIGHT' || skillDef.element === 'DARK') {
      // VI 스킬 사용시
      if (isVI && skillDef.gaugeChargeVI) {
        chargeAmount = skillDef.gaugeChargeVI;
      }
      // 아포칼립스 리차지 효과 (하이퍼 패시브)
      else if (skillId === 'apocalypse' && skillDef.gaugeChargeRecharge) {
        // TODO: 하이퍼 패시브 적용 여부 체크
        chargeAmount = skillDef.gaugeChargeRecharge;
      }
      else {
        chargeAmount = skillDef.gaugeCharge;
      }
    } else if (skillDef.element === 'NONE' && skillDef.gaugeCharge > 0) {
      // 트와일라잇 노바 같은 무속성 스킬
      chargeAmount = skillDef.gaugeCharge;
    }

    // 상태에 따른 게이지 충전 규칙
    if (stateComp.currentState === 'DARK') {
      // 어둠 상태에서는 빛 게이지만 충전
      if (skillDef.element === 'LIGHT' || skillDef.element === 'NONE') {
        gaugeComp.chargeLightGauge(chargeAmount);
        this.world.emitEvent('gauge:charged', entity, { type: 'light', amount: chargeAmount });
      }
    } else if (stateComp.currentState === 'LIGHT') {
      // 빛 상태에서는 어둠 게이지만 충전
      if (skillDef.element === 'DARK' || skillDef.element === 'NONE') {
        gaugeComp.chargeDarkGauge(chargeAmount);
        this.world.emitEvent('gauge:charged', entity, { type: 'dark', amount: chargeAmount });
      }
    } else if (stateComp.currentState === 'EQUILIBRIUM') {
      // 이퀼 상태에서는 다음 상태의 반대 게이지 충전
      if (stateComp.nextState === 'LIGHT') {
        // 다음이 빛이면 어둠 게이지 충전
        if (skillDef.element === 'DARK' || skillDef.element === 'NONE' || skillDef.element === 'EQUILIBRIUM') {
          gaugeComp.chargeDarkGauge(chargeAmount);
          this.world.emitEvent('gauge:charged', entity, { type: 'dark', amount: chargeAmount });
        }
      } else {
        // 다음이 어둠이면 빛 게이지 충전
        if (skillDef.element === 'LIGHT' || skillDef.element === 'NONE' || skillDef.element === 'EQUILIBRIUM') {
          gaugeComp.chargeLightGauge(chargeAmount);
          this.world.emitEvent('gauge:charged', entity, { type: 'light', amount: chargeAmount });
        }
      }
    }
  }

  // 스킬 미적중시 게이지 충전 (50%만)
  chargeGaugeMiss(entity: any, skillId: string, isVI: boolean = false): void {
    const gaugeComp = this.world.getComponent<GaugeComponent>(entity, 'gauge');
    const stateComp = this.world.getComponent<StateComponent>(entity, 'state');
    
    if (!gaugeComp || !stateComp) return;

    const skillDef = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skillDef || skillDef.gaugeCharge === 0) return;

    // 미적중시 50%만 충전
    let baseCharge = isVI && skillDef.gaugeChargeVI ? skillDef.gaugeChargeVI : skillDef.gaugeCharge;
    const chargeAmount = Math.floor(baseCharge * 0.5);

    // 동일한 충전 로직 적용
    if (stateComp.currentState === 'DARK' && (skillDef.element === 'LIGHT' || skillDef.element === 'NONE')) {
      gaugeComp.chargeLightGauge(chargeAmount);
    } else if (stateComp.currentState === 'LIGHT' && (skillDef.element === 'DARK' || skillDef.element === 'NONE')) {
      gaugeComp.chargeDarkGauge(chargeAmount);
    }
  }
}