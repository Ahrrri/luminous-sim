// src/engine/simulator.ts
import type { CharacterState } from '../models/character';
import type { SimulationState } from '../models/simulation';
import type { Skill } from '../models/skills';
import { skills } from '../models/skills';
import type { Buff } from '../models/buffs';
import { buffs } from '../models/buffs';
import { calculateCooldown } from '../utils/helpers';

// 인터페이스를 simulator.ts에 직접 선언
export interface SkillSelectionPolicy {
  selectNextSkill(
    character: CharacterState,
    simulation: SimulationState
  ): string | null; // 다음에 사용할 스킬 ID 또는 대기(null)
}

export class SimulationEngine {
  private character: CharacterState;
  private simulation: SimulationState;
  private policy: SkillSelectionPolicy;
  private isRunning: boolean = false;
  private listeners: {
    onDamage?: (damage: number, skill: string, time: number) => void;
    onStateChange?: (state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM', time: number) => void;
    onBuffChange?: (buffId: string, action: 'APPLIED' | 'EXPIRED', time: number) => void;
    onCooldownUpdate?: (skillId: string, cooldown: number, time: number) => void;
  } = {};

  constructor(character: CharacterState, simulation: SimulationState, policy: SkillSelectionPolicy) {
    this.character = { ...character };
    this.simulation = { ...simulation };
    this.policy = policy;
  }

  // 리스너 등록
  public setDamageListener(callback: (damage: number, skill: string, time: number) => void) {
    this.listeners.onDamage = callback;
  }

  public setStateChangeListener(callback: (state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM', time: number) => void) {
    this.listeners.onStateChange = callback;
  }

  public setBuffChangeListener(callback: (buffId: string, action: 'APPLIED' | 'EXPIRED', time: number) => void) {
    this.listeners.onBuffChange = callback;
  }

  public setCooldownUpdateListener(callback: (skillId: string, cooldown: number, time: number) => void) {
    this.listeners.onCooldownUpdate = callback;
  }

  // Web Worker를 생성하고 시뮬레이션 시작
  startSimulation() {
    this.isRunning = true;
    this.simulateLoop();
  }

  pauseSimulation() {
    this.isRunning = false;
  }

  stopSimulation() {
    this.isRunning = false;
    this.simulation.currentTime = 0;
    this.simulation.totalDamage = 0;
    this.simulation.cooldowns = {};
    this.simulation.activeBuffs = [];
    this.character.lightGauge = 0;
    this.character.darkGauge = 0;
    this.character.currentState = 'LIGHT';
  }

  // 시뮬레이션 메인 루프
  private simulateLoop() {
    if (!this.isRunning) return;

    this.simulateStep();

    // 브라우저 성능을 위해 requestAnimationFrame 사용
    requestAnimationFrame(() => this.simulateLoop());
  }

  // 한 타임스텝 실행
  simulateStep() {
    const timeStep = this.simulation.timeStep;

    // 상태 업데이트 (쿨타임, 버프 등)
    this.updateState(timeStep);

    // 다음에 사용할 스킬 결정
    const nextSkillId = this.policy.selectNextSkill(this.character, this.simulation);

    // 스킬 사용이 결정됐다면
    if (nextSkillId) {
      const skill = skills[nextSkillId];

      // 스킬 사용 조건 확인
      if (this.canUseSkill(skill)) {
        // 스킬 사용
        this.useSkill(skill);
      }
    }

    // 시간 진행
    this.simulation.currentTime += timeStep;
  }

  // 스킬 사용 가능 여부 확인
  private canUseSkill(skill: Skill): boolean {
    // 이퀼 전용 스킬 체크
    if (skill.isEquilibriumOnly && this.character.currentState !== 'EQUILIBRIUM') {
      return false;
    }

    // 쿨타임 체크
    if (this.simulation.cooldowns[skill.id] && this.simulation.cooldowns[skill.id] > 0) {
      return false;
    }

    // 진리의 문은 이퀼 당 1회만 사용 가능
    if (skill.id === 'DOOR_OF_TRUTH' && this.simulation.doorOfTruthUsed) {
      return false;
    }

    return true;
  }

  // 스킬 사용
  private useSkill(skill: Skill) {
    // 쿨타임 설정
    if (skill.cooldown > 0) {
      const calculatedCooldown = calculateCooldown(
        skill.cooldown,
        this.character.merLevel,
        this.character.cooldownReduction
      );
      this.simulation.cooldowns[skill.id] = calculatedCooldown;

      // 쿨타임 업데이트 이벤트 발생
      if (this.listeners.onCooldownUpdate) {
        this.listeners.onCooldownUpdate(skill.id, calculatedCooldown, this.simulation.currentTime);
      }
    }

    // 진리의 문 사용 여부 체크
    if (skill.id === 'DOOR_OF_TRUTH') {
      this.simulation.doorOfTruthUsed = true;
    }

    // 게이지 충전
    this.chargeGauge(skill);

    // 데미지 계산
    const damage = this.calculateDamage(skill);
    this.simulation.totalDamage += damage;

    // 데미지 이벤트 발생
    if (this.listeners.onDamage) {
      this.listeners.onDamage(damage, skill.id, this.simulation.currentTime);
    }

    // 마지막 사용 스킬 정보 업데이트
    this.simulation.lastSkillUsed = skill.id;
    this.simulation.lastSkillTime = this.simulation.currentTime;

    // 스킬 특수 효과 처리
    this.processSpecialEffects(skill);
  }

  // 게이지 충전
  private chargeGauge(skill: Skill) {
    if (skill.gaugeCharge <= 0) return;

    // 상태에 따른 게이지 충전
    if (this.character.currentState === 'LIGHT') {
      // 빛 상태에서는 어둠 게이지 충전
      this.character.darkGauge = Math.min(10000, this.character.darkGauge + skill.gaugeCharge);

      // 게이지가 가득 찼는지 확인
      if (this.character.darkGauge >= 10000) {
        this.handleFullGauge();
      }
    } else if (this.character.currentState === 'DARK') {
      // 어둠 상태에서는 빛 게이지 충전
      this.character.lightGauge = Math.min(10000, this.character.lightGauge + skill.gaugeCharge);

      // 게이지가 가득 찼는지 확인
      if (this.character.lightGauge >= 10000) {
        this.handleFullGauge();
      }
    } else if (this.character.currentState === 'EQUILIBRIUM') {
      // 이퀼 상태에서는 다음 상태에 따라 게이지 충전
      if (this.character.nextState === 'LIGHT') {
        this.character.darkGauge = Math.min(10000, this.character.darkGauge + skill.gaugeCharge);

        // 게이지가 가득 찼는지 확인
        if (this.character.darkGauge >= 10000) {
          this.character.isInEquilibriumDelay = true;
        }
      } else {
        this.character.lightGauge = Math.min(10000, this.character.lightGauge + skill.gaugeCharge);

        // 게이지가 가득 찼는지 확인
        if (this.character.lightGauge >= 10000) {
          this.character.isInEquilibriumDelay = true;
        }
      }
    }
  }

  // src/engine/simulator.ts (계속)

  // 게이지가 가득 찼을 때 처리
  private handleFullGauge() {
    // 이퀼 유예 모드에 따른 처리
    if (this.character.equilibriumMode === 'AUTO') {
      this.enterEquilibrium();
    } else {
      // 수동 모드에서는 유예 상태만 설정
      this.character.isInEquilibriumDelay = true;
    }
  }

  // 이퀼리브리엄 상태 진입
  private enterEquilibrium() {
    // 이전 상태 저장
    const prevState = this.character.currentState;

    // 상태 변경
    this.character.currentState = 'EQUILIBRIUM';
    this.character.isInEquilibriumDelay = false;

    // 다음 상태 설정 (현재 상태의 반대)
    this.character.nextState = prevState === 'LIGHT' ? 'DARK' : 'LIGHT';

    // 버프 지속시간 증가 효과 적용
    let duration = this.simulation.equilibriumDuration;
    if (prevState !== 'EQUILIBRIUM') { // 메모라이즈로 인한 이퀼이 아닐 때만 벞지 적용
      duration = duration * (1 + this.character.buffDuration / 100);
    }

    // 이퀼 종료 시간 설정
    this.character.equilibriumEndTime = this.simulation.currentTime + duration;

    // 빛과 어둠의 세례 쿨타임 초기화
    if (this.simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] > 0) {
      this.simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] = 0;

      // 쿨타임 업데이트 이벤트 발생
      if (this.listeners.onCooldownUpdate) {
        this.listeners.onCooldownUpdate('BAPTISM_OF_LIGHT_AND_DARKNESS', 0, this.simulation.currentTime);
      }
    }

    // 상태 변경 이벤트 발생
    if (this.listeners.onStateChange) {
      this.listeners.onStateChange('EQUILIBRIUM', this.simulation.currentTime);
    }

    // 버프 추가
    this.addBuff({
      ...buffs.EQUILIBRIUM,
      isActive: true,
      startTime: this.simulation.currentTime,
      endTime: this.character.equilibriumEndTime
    });

    // 진리의 문 사용 여부 초기화
    this.simulation.doorOfTruthUsed = false;
  }

  // 이퀼리브리엄 상태 종료
  private exitEquilibrium() {
    // 상태 변경
    this.character.currentState = this.character.nextState;
    this.character.isInEquilibriumDelay = false;
    this.character.equilibriumEndTime = undefined;

    // 게이지 초기화
    if (this.character.currentState === 'LIGHT') {
      this.character.lightGauge = 0;
    } else {
      this.character.darkGauge = 0;
    }

    // 상태 변경 이벤트 발생
    if (this.listeners.onStateChange) {
      this.listeners.onStateChange(this.character.currentState, this.simulation.currentTime);
    }

    // 버프 제거
    this.removeBuff('EQUILIBRIUM');
  }

  // 버프 추가
  private addBuff(buff: Buff) {
    // 이미 존재하는 버프인지 확인
    const existingIndex = this.simulation.activeBuffs.findIndex(b => b.id === buff.id);

    if (existingIndex >= 0) {
      // 기존 버프 업데이트
      this.simulation.activeBuffs[existingIndex] = buff;
    } else {
      // 새 버프 추가
      this.simulation.activeBuffs.push(buff);
    }

    // 버프 추가 이벤트 발생
    if (this.listeners.onBuffChange) {
      this.listeners.onBuffChange(buff.id, 'APPLIED', this.simulation.currentTime);
    }
  }

  // 버프 제거
  private removeBuff(buffId: string) {
    this.simulation.activeBuffs = this.simulation.activeBuffs.filter(b => b.id !== buffId);

    // 버프 제거 이벤트 발생
    if (this.listeners.onBuffChange) {
      this.listeners.onBuffChange(buffId, 'EXPIRED', this.simulation.currentTime);
    }
  }

  // 스킬 특수 효과 처리
  private processSpecialEffects(skill: Skill) {
    if (!skill.special) return;

    // 다른 스킬의 쿨타임 감소 효과
    if (skill.special.reduceOtherCooldown) {
      const { skillId, amount, condition } = skill.special.reduceOtherCooldown;

      // 조건 확인
      if (!condition || condition === 'ALWAYS' ||
        (condition === 'EQUILIBRIUM' && this.character.currentState === 'EQUILIBRIUM')) {

        // 특정 스킬의 쿨타임 감소
        if (skillId && this.simulation.cooldowns[skillId]) {
          this.simulation.cooldowns[skillId] = Math.max(0, this.simulation.cooldowns[skillId] - (amount || 0));

          // 쿨타임 업데이트 이벤트 발생
          if (this.listeners.onCooldownUpdate) {
            this.listeners.onCooldownUpdate(skillId, this.simulation.cooldowns[skillId], this.simulation.currentTime);
          }
        } else if (!skillId) {
          // 빛과 어둠의 세례 쿨타임 감소 (이퀼 스킬 사용 시)
          if (this.character.currentState === 'EQUILIBRIUM' &&
            this.simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS']) {
            this.simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] = Math.max(
              0,
              this.simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] - 2000 // 2초 감소
            );

            // 쿨타임 업데이트 이벤트 발생
            if (this.listeners.onCooldownUpdate) {
              this.listeners.onCooldownUpdate(
                'BAPTISM_OF_LIGHT_AND_DARKNESS',
                this.simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'],
                this.simulation.currentTime
              );
            }
          }
        }
      }
    }

    // 이퀼 지속시간 연장 효과
    if (skill.special.extendEquilibriumDuration && this.character.currentState === 'EQUILIBRIUM') {
      const extension = skill.special.extendEquilibriumDuration;

      if (this.character.equilibriumEndTime) {
        this.character.equilibriumEndTime += extension;

        // 활성화된 이퀼 버프의 종료 시간도 업데이트
        const buffIndex = this.simulation.activeBuffs.findIndex(b => b.id === 'EQUILIBRIUM');
        if (buffIndex >= 0) {
          this.simulation.activeBuffs[buffIndex].endTime = this.character.equilibriumEndTime;
        }
      }
    }
  }

  // updateState 메서드 수정 - elapsedTime 파라미터 사용
  updateState(elapsedTime: number) {
    // 쿨타임 업데이트
    for (const skillId in this.simulation.cooldowns) {
      if (this.simulation.cooldowns[skillId] > 0) {
        this.simulation.cooldowns[skillId] = Math.max(0, this.simulation.cooldowns[skillId] - elapsedTime);
        
        // 쿨타임 업데이트 이벤트 발생
        if (this.listeners.onCooldownUpdate) {
          this.listeners.onCooldownUpdate(skillId, this.simulation.cooldowns[skillId], this.simulation.currentTime);
        }
      }
    }

    // 버프 상태 업데이트
    for (let i = this.simulation.activeBuffs.length - 1; i >= 0; i--) {
      const buff = this.simulation.activeBuffs[i];

      if (buff.endTime && buff.endTime <= this.simulation.currentTime) {
        // 이퀼리브리엄 버프가 종료됐다면 상태 전환
        if (buff.id === 'EQUILIBRIUM') {
          this.exitEquilibrium();
        } else {
          // 일반 버프 제거
          this.simulation.activeBuffs.splice(i, 1);

          // 버프 종료 이벤트 발생
          if (this.listeners.onBuffChange) {
            this.listeners.onBuffChange(buff.id, 'EXPIRED', this.simulation.currentTime);
          }
        }
      }
    }

    // 컨티 사이클 업데이트
    this.updateContinuousCycle(elapsedTime);

    // 이퀼 상태에서 딜레이가 발생하면 수동/자동 모드에 따라 처리
    if (this.character.isInEquilibriumDelay && this.character.equilibriumMode === 'AUTO') {
      this.enterEquilibrium();
    }
  }

  // 컨티 사이클 업데이트
  private updateContinuousCycle(elapsedTime: number) {
    const cycle = this.simulation.continuousCycle;

    if (!cycle.lastActivationTime) {
      // 초기 활성화
      cycle.isActive = true;
      cycle.lastActivationTime = this.simulation.currentTime;

      // 컨티 버프 추가
      this.addBuff({
        ...buffs.CONTINUOUS_RING,
        isActive: true,
        startTime: this.simulation.currentTime,
        endTime: this.simulation.currentTime + cycle.activeTime
      });

      this.character.isContinuousActive = true;
      this.character.continuousStartTime = this.simulation.currentTime;
    } else {
      const timeSinceLastActivation = this.simulation.currentTime - cycle.lastActivationTime;

      if (cycle.isActive && timeSinceLastActivation >= cycle.activeTime) {
        // 활성 -> 대기
        cycle.isActive = false;
        cycle.lastActivationTime = this.simulation.currentTime;

        // 컨티 버프 제거
        this.removeBuff('CONTINUOUS_RING');

        this.character.isContinuousActive = false;
        this.character.continuousStartTime = undefined;
      } else if (!cycle.isActive && timeSinceLastActivation >= cycle.cooldownTime) {
        // 대기 -> 활성
        cycle.isActive = true;
        cycle.lastActivationTime = this.simulation.currentTime;

        // 컨티 버프 추가
        this.addBuff({
          ...buffs.CONTINUOUS_RING,
          isActive: true,
          startTime: this.simulation.currentTime,
          endTime: this.simulation.currentTime + cycle.activeTime
        });

        this.character.isContinuousActive = true;
        this.character.continuousStartTime = this.simulation.currentTime;
      }
    }
  }

  // 딜 계산
  calculateDamage(skill: Skill): number {
    // 기본 데미지 계산
    let damage = skill.damage * skill.hitCount * skill.maxTargets;

    // 일부 스킬은 한 적당 한 번만 적용
    if (this.simulation.applyOneHitPerTarget && skill.id === 'ABSOLUTE_KILL') {
      damage = skill.damage * skill.hitCount;
    }

    // 캐릭터 상태에 따른 데미지 보정
    if (this.character.currentState === 'EQUILIBRIUM') {
      // 이퀼 상태에서는 앱킬 사용시 데미지 증가
      if (skill.id === 'ABSOLUTE_KILL') {
        damage *= 2; // 이퀼 상태에서 앱킬은 2배 데미지
      }

      // 추가 타격 효과
      if (skill.special?.additionalHit) {
        damage *= 1.5; // 추가타 효과로 1.5배 데미지
      }
    } else {
      // 빛/어둠 상태에서는 각 속성 스킬에 적용되는 효과
      if ((this.character.currentState === 'LIGHT' && skill.element === 'LIGHT') ||
        (this.character.currentState === 'DARK' && skill.element === 'DARK')) {
        damage *= 1.5; // 속성 일치 시 1.5배 데미지
      }
    }

    // 버프 효과 적용
    for (const buff of this.simulation.activeBuffs) {
      if (buff.effects.damageIncrease) {
        damage *= (1 + buff.effects.damageIncrease / 100);
      }
      if (buff.effects.finalDamageIncrease) {
        damage *= (1 + buff.effects.finalDamageIncrease / 100);
      }
    }

    // 보스 데미지 보정
    if (this.simulation.simulateBossOnly) {
      damage *= (1 + this.character.bossDamage / 100);
    }

    // 크리티컬 확률 및 데미지 보정
    const critRate = Math.min(100, this.character.critRate + (skill.addCritRate || 0));
    if (Math.random() * 100 < critRate) {
      damage *= (1 + this.character.critDamage / 100);
    }

    // 재사용 확률 적용
    if (skill.cooldown > 0 && Math.random() * 100 < this.character.cooldownResetChance) {
      this.simulation.cooldowns[skill.id] = 0;

      // 쿨타임 업데이트 이벤트 발생
      if (this.listeners.onCooldownUpdate) {
        this.listeners.onCooldownUpdate(skill.id, 0, this.simulation.currentTime);
      }
    }

    return damage;
  }
}

// 스킬 선택 정책 인터페이스
export interface SkillSelectionPolicy {
  selectNextSkill(
    character: CharacterState,
    simulation: SimulationState
  ): string | null; // 다음에 사용할 스킬 ID 또는 대기(null)
}