// src/workers/simulation.worker.ts
import type { CharacterState } from '../legacy/models/character';
import type { SimulationState } from '../legacy/models/simulation';
import { skills } from '../legacy/models/skills';
import { buffs } from '../legacy/models/buffs';
import { calculateCooldown } from '../utils/helpers';
import { canUseSkill as checkSkillUsable } from '../utils/skillUtils';

// Worker 내에서 사용할 상태 정의
let isRunning = false;
let character: CharacterState;
let simulation: SimulationState;
let timeStep = 30; // 30ms
let previousState = '';

// 메시지 처리
self.onmessage = (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'START':
      character = JSON.parse(JSON.stringify(data.character));
      simulation = JSON.parse(JSON.stringify(data.simulation));
      timeStep = simulation.timeStep;
      isRunning = true;
      previousState = character.currentState;
      console.log('[Worker] 시뮬레이션 시작');
      runSimulation(data.duration, data.policy);
      break;

    case 'PAUSE':
      isRunning = false;
      console.log('[Worker] 시뮬레이션 일시 중지');
      break;

    case 'RESUME':
      isRunning = true;
      console.log('[Worker] 시뮬레이션 재개');
      runSimulation(data.duration, data.policy);
      break;

    case 'STOP':
      isRunning = false;
      console.log('[Worker] 시뮬레이션 정지');
      break;
  }
};

// 시뮬레이션 실행 함수
function runSimulation(duration: number, policyData: any) {
  // 정책 구현 (Worker 내에서 직접 구현)
  const policy = createPolicy(policyData);

  // 시작 시간 기록
  const startTime = Date.now();

  // 목표 시뮬레이션 시간 (ms)
  const targetTime = duration * 1000;

  // 진행 상황 업데이트 간격 (실제 시간, ms)
  const progressUpdateInterval = 100;
  let lastProgressTime = startTime;

  // 시뮬레이션 루프
  function simulationLoop() {
    if (!isRunning) return;

    // 배치 처리로 성능 최적화 (한 번에 여러 스텝 처리)
    const batchSize = 100;
    for (let i = 0; i < batchSize; i++) {
      if (!isRunning) break;

      // 한 스텝 실행
      simulateStep(policy);

      // 목표 시간에 도달하면 종료
      if (simulation.currentTime >= targetTime) {
        isRunning = false;

        // 최종 결과 전송
        self.postMessage({
          type: 'COMPLETE',
          data: {
            totalDamage: simulation.totalDamage,
            currentTime: simulation.currentTime,
            activeBuffs: simulation.activeBuffs,
            cooldowns: simulation.cooldowns,
            character: {
              currentState: character.currentState,
              lightGauge: character.lightGauge,
              darkGauge: character.darkGauge,
              equilibriumEndTime: character.equilibriumEndTime,
              isInEquilibriumDelay: character.isInEquilibriumDelay,
              isContinuousActive: character.isContinuousActive
            }
          }
        });

        console.log('[Worker] 시뮬레이션 완료', {
          실행시간: (Date.now() - startTime) / 1000 + '초',
          시뮬레이션시간: simulation.currentTime / 1000 + '초',
          총데미지: simulation.totalDamage
        });

        return;
      }
    }

    // 실제 시간으로 진행 상황 업데이트
    const now = Date.now();
    if (now - lastProgressTime >= progressUpdateInterval) {
      lastProgressTime = now;

      // 진행 상황 메시지 전송
      self.postMessage({
        type: 'PROGRESS',
        data: {
          currentTime: simulation.currentTime,
          totalDamage: simulation.totalDamage,
          progress: simulation.currentTime / targetTime,
          character: {
            currentState: character.currentState,
            lightGauge: character.lightGauge,
            darkGauge: character.darkGauge,
            isContinuousActive: character.isContinuousActive
          }
        }
      });
    }

    // 다음 배치 실행 예약 (0으로 설정하여 최대한 빠르게 실행)
    setTimeout(simulationLoop, 0);
  }

  // 시뮬레이션 시작
  simulationLoop();
}

// 한 스텝 시뮬레이션 실행
function simulateStep(policy: any) {
  // 상태 업데이트
  updateState(timeStep);

  // 다음 스킬 선택
  const nextSkillId = policy.selectNextSkill(character, simulation);

  // 스킬 사용
  if (nextSkillId) {
    const skill = skills[nextSkillId];

    if (canUseSkill(skill)) {
      useSkill(skill);

      // 스킬 사용 이벤트 전송
      self.postMessage({
        type: 'SKILL_USED',
        data: {
          skillId: nextSkillId,
          damage: lastDamage,
          time: simulation.currentTime
        }
      });
    }
  }

  // 시간 진행
  simulation.currentTime += timeStep;
}

// Web Worker용 정책 생성 함수
function createPolicy(policyData: any) {
  // 간단한 정책 구현
  return {
    selectNextSkill: (character: CharacterState, simulation: SimulationState) => {
      // 정책 타입에 따라 다른 로직 구현
      switch (policyData.type) {
        case 'basic':
          return selectBasicPolicy(character, simulation);
        case 'equilibrium':
          return selectEquilibriumPolicy(character, simulation);
        case 'burst':
          return selectBurstPolicy(character, simulation, policyData.state);
        case 'continuous':
          return selectContinuousPolicy(character, simulation);
        case 'realistic':
          return selectRealisticPolicy(character, simulation, policyData.state);
        default:
          return selectBasicPolicy(character, simulation);
      }
    }
  };
}

// 마지막 데미지 값 저장 변수
let lastDamage = 0;

// 기본 정책 구현
function selectBasicPolicy(character: CharacterState, simulation: SimulationState) {
  // 우선순위 스킬 목록
  const prioritySkills = [
    'HARMONIC_PARADOX',
    'LIBERATION_ORB_ACTIVE',
    'HEROIC_OATH',
    'MAPLE_GODDESS_BLESSING',
    'BAPTISM_OF_LIGHT_AND_DARKNESS',
    'TWILIGHT_NOVA',
    'PUNISHING_RESONATOR'
  ];

  // 우선순위 스킬 사용 가능 여부 확인
  for (const skillId of prioritySkills) {
    if (canUseSkill(skills[skillId])) {
      return skillId;
    }
  }

  // 상태별 스킬 선택
  if (character.currentState === 'EQUILIBRIUM') {
    if (canUseSkill(skills['DOOR_OF_TRUTH'])) {
      return 'DOOR_OF_TRUTH';
    }

    if (canUseSkill(skills['ABSOLUTE_KILL'])) {
      return 'ABSOLUTE_KILL';
    }
  } else if (character.currentState === 'LIGHT') {
    return 'REFLECTION';
  } else {
    return 'APOCALYPSE';
  }

  return null;
}

// 이퀼 우선 정책 구현
function selectEquilibriumPolicy(character: CharacterState, simulation: SimulationState) {
  // 상태별 우선순위 스킬
  let prioritySkills: string[] = [];

  // 이퀼 상태에서의 우선순위
  if (character.currentState === 'EQUILIBRIUM') {
    prioritySkills = [
      'HEROIC_OATH',
      'MAPLE_GODDESS_BLESSING',
      'LIBERATION_ORB_ACTIVE',
      'DOOR_OF_TRUTH',
      'BAPTISM_OF_LIGHT_AND_DARKNESS',
      'ABSOLUTE_KILL',
      'PUNISHING_RESONATOR',
      'TWILIGHT_NOVA',
      'HARMONIC_PARADOX',
    ];
  }
  // 빛 상태에서의 우선순위
  else if (character.currentState === 'LIGHT') {
    prioritySkills = [
      'BAPTISM_OF_LIGHT_AND_DARKNESS',
      'TWILIGHT_NOVA',
      'PUNISHING_RESONATOR',
      'REFLECTION' // 게이지 채우기
    ];
  }
  // 어둠 상태에서의 우선순위
  else {
    prioritySkills = [
      'BAPTISM_OF_LIGHT_AND_DARKNESS',
      'TWILIGHT_NOVA',
      'PUNISHING_RESONATOR',
      'APOCALYPSE' // 게이지 채우기
    ];
  }

  // 메모라이즈 사용 가능하면 사용
  if (character.isInEquilibriumDelay && canUseSkill(skills['MEMORIZE'])) {
    return 'MEMORIZE';
  }

  // 우선순위 스킬 사용 가능 여부 확인
  for (const skillId of prioritySkills) {
    if (canUseSkill(skills[skillId])) {
      return skillId;
    }
  }

  return null;
}

// 극딜 주기 정책 구현
function selectBurstPolicy(character: CharacterState, simulation: SimulationState, state: any) {
  // 상태 정보가 없으면 초기화
  if (!state.burstWindow) {
    state.burstWindow = false;
    state.burstStartTime = 0;
    state.burstDuration = 40000; // 40초 극딜
  }

  // 극딜 윈도우 체크/업데이트
  if (state.burstWindow && simulation.currentTime - state.burstStartTime > state.burstDuration) {
    state.burstWindow = false;
  }

  // 2분 버프 사용 가능 상태에서 극딜 시작
  if (!state.burstWindow &&
    canUseSkill(skills['HEROIC_OATH']) &&
    canUseSkill(skills['MAPLE_GODDESS_BLESSING'])) {
    state.burstWindow = true;
    state.burstStartTime = simulation.currentTime;
    return 'HEROIC_OATH';
  }

  // 극딜 중이라면 순서대로 사용
  if (state.burstWindow) {
    // 메용2 사용
    if (canUseSkill(skills['MAPLE_GODDESS_BLESSING'])) {
      return 'MAPLE_GODDESS_BLESSING';
    }

    // 오브 사용
    if (canUseSkill(skills['LIBERATION_ORB_ACTIVE'])) {
      return 'LIBERATION_ORB_ACTIVE';
    }

    // 6차 사용
    if (character.currentState === 'EQUILIBRIUM' &&
      canUseSkill(skills['HARMONIC_PARADOX'])) {
      return 'HARMONIC_PARADOX';
    }
  }

  // 이퀼리브리엄 진입 전 메모라이즈 판단
  if (character.isInEquilibriumDelay) {
    // 극딜 중이거나 메모라이즈 쿨이 돌았으면 바로 진입
    if (state.burstWindow && canUseSkill(skills['MEMORIZE'])) {
      return 'MEMORIZE';
    }
  }

  // 그 외 상황에서는 기본 정책 사용
  return selectBasicPolicy(character, simulation);
}

// 컨티 효율 중시 정책 구현
function selectContinuousPolicy(character: CharacterState, simulation: SimulationState) {
  // 컨티링 활성화 여부 확인
  const isContinuousActive = character.isContinuousActive;

  // 컨티링 활성화 시 고데미지 스킬 우선 사용
  if (isContinuousActive) {
    // 우선 순위 스킬
    const prioritySkills = [
      'HEROIC_OATH',
      'MAPLE_GODDESS_BLESSING',
      'HARMONIC_PARADOX',
      'DOOR_OF_TRUTH',
      'BAPTISM_OF_LIGHT_AND_DARKNESS',
      'ABSOLUTE_KILL',
      'TWILIGHT_NOVA',
      'PUNISHING_RESONATOR'
    ];

    // 이퀼 아닐 때 메모라이즈 사용 가능하면 즉시 사용
    if (!character.currentState.includes('EQUILIBRIUM') &&
      canUseSkill(skills['MEMORIZE'])) {
      return 'MEMORIZE';
    }

    // 우선순위 스킬 사용 가능 여부 확인
    for (const skillId of prioritySkills) {
      if (canUseSkill(skills[skillId])) {
        return skillId;
      }
    }

    // 상태별 기본 스킬 사용
    if (character.currentState === 'EQUILIBRIUM') {
      return 'ABSOLUTE_KILL';
    } else if (character.currentState === 'LIGHT') {
      return 'REFLECTION';
    } else {
      return 'APOCALYPSE';
    }
  }
  // 컨티링 비활성화 시 게이지 충전 위주
  else {
    // 이퀼 상태에서는 게이지 충전 위주로
    if (character.currentState === 'EQUILIBRIUM') {
      if (character.nextState === 'LIGHT') {
        // 어둠 게이지 충전을 위해 아포 사용
        return 'APOCALYPSE';
      } else {
        // 빛 게이지 충전을 위해 라리플 사용
        return 'REFLECTION';
      }
    }
    // 빛/어둠 상태에서도 게이지 충전 최우선
    else if (character.currentState === 'LIGHT') {
      return 'REFLECTION';
    } else {
      return 'APOCALYPSE';
    }
  }
}

// 현실적인 플레이어 시뮬레이션 정책 구현
function selectRealisticPolicy(character: CharacterState, simulation: SimulationState, state: any) {
  // 상태 초기화
  if (!state.lastDecisionTime) {
    state.lastDecisionTime = 0;
    state.humanReactionTime = 210; // 인간 반응 시간 (ms)
    state.skillQueue = []; // 빠르게 연속으로 누르려는 스킬 큐
    state.burstWindow = false;
    state.burstStartTime = 0;
    state.burstDuration = 40000; // 40초 극딜
  }

  // 인간 반응 시간을 시뮬레이션
  if (simulation.currentTime - state.lastDecisionTime < state.humanReactionTime) {
    return null;
  }

  // 큐에 스킬이 있으면 먼저 처리
  if (state.skillQueue.length > 0) {
    const nextSkill = state.skillQueue.shift() || null;
    if (nextSkill && canUseSkill(skills[nextSkill])) {
      state.lastDecisionTime = simulation.currentTime;
      return nextSkill;
    }
  }

  // 극딜 윈도우 체크/업데이트
  if (state.burstWindow && simulation.currentTime - state.burstStartTime > state.burstDuration) {
    state.burstWindow = false;
  }

  // 2분 버프 사용 가능 상태에서 극딜 시작
  if (!state.burstWindow &&
    canUseSkill(skills['HEROIC_OATH']) &&
    canUseSkill(skills['MAPLE_GODDESS_BLESSING'])) {
    state.burstWindow = true;
    state.burstStartTime = simulation.currentTime;

    // 극딜 시작시 스킬 순서를 큐에 넣음
    state.skillQueue.push('HEROIC_OATH', 'MAPLE_GODDESS_BLESSING', 'LIBERATION_ORB_ACTIVE');

    state.lastDecisionTime = simulation.currentTime;
    return state.skillQueue.shift();
  }

  // 이퀼 유예 상태에서 메모라이즈 판단
  if (character.isInEquilibriumDelay) {
    if (canUseSkill(skills['MEMORIZE'])) {
      // 극딜 중이거나 이퀼 진입이 유리한 상황이면 메모라이즈 사용
      if (state.burstWindow ||
        canUseSkill(skills['HARMONIC_PARADOX']) ||
        canUseSkill(skills['DOOR_OF_TRUTH'])) {
        state.lastDecisionTime = simulation.currentTime;
        return 'MEMORIZE';
      }
    }
  }

  // 상태별 스킬 선택은 기본 정책 사용
  const skillId = selectBasicPolicy(character, simulation);
  if (skillId) {
    state.lastDecisionTime = simulation.currentTime;
  }
  return skillId;
}

// canUseSkill 함수를 유틸리티 함수로 대체
function canUseSkill(skill: any): boolean {
  if (!skill) return false;
  return checkSkillUsable(skill.id, character, simulation);
}

// 스킬 사용 함수
function useSkill(skill: any) {

  // 쿨타임 설정
  if (skill.cooldown > 0) {
    simulation.cooldowns[skill.id] = calculateCooldown(
      skill.cooldown,
      character.merLevel,
      character.cooldownReduction
    );
  }

  // 스킬 딜레이 설정 추가
  if (skill.delay > 0) {
    simulation.inSkillDelay = true;
    simulation.skillDelayEndTime = simulation.currentTime + skill.delay;
  }

  // 진리의 문 사용 여부 체크
  if (skill.id === 'DOOR_OF_TRUTH') {
    simulation.doorOfTruthUsed = true;
  }

  // 게이지 충전
  chargeGauge(skill);

  // 데미지 계산
  lastDamage = calculateDamage(skill);
  simulation.totalDamage += lastDamage;

  // 마지막 사용 스킬 정보 업데이트
  simulation.lastSkillUsed = skill.id;
  simulation.lastSkillTime = simulation.currentTime;

  // 스킬 특수 효과 처리
  processSpecialEffects(skill);

  // 상태 변경이 있을 때 이벤트 발송
  if (character.currentState !== previousState) {
    self.postMessage({
      type: 'STATE_CHANGED',
      data: {
        state: character.currentState,
        time: simulation.currentTime
      }
    });
    previousState = character.currentState;
  }

  // 버프 변경 이벤트는 여기에 추가
}

// 게이지 충전 함수
function chargeGauge(skill: any) {
  if (skill.gaugeCharge <= 0) return;

  // 상태에 따른 게이지 충전
  if (character.currentState === 'LIGHT') {
    // 빛 상태에서는 어둠 게이지 충전
    character.darkGauge = Math.min(10000, character.darkGauge + skill.gaugeCharge);

    // 게이지가 가득 찼는지 확인
    if (character.darkGauge >= 10000) {
      handleFullGauge();
    }
  } else if (character.currentState === 'DARK') {
    // 어둠 상태에서는 빛 게이지 충전
    character.lightGauge = Math.min(10000, character.lightGauge + skill.gaugeCharge);

    // 게이지가 가득 찼는지 확인
    if (character.lightGauge >= 10000) {
      handleFullGauge();
    }
  } else if (character.currentState === 'EQUILIBRIUM') {
    // 이퀼 상태에서는 다음 상태에 따라 게이지 충전
    if (character.nextState === 'LIGHT') {
      character.darkGauge = Math.min(10000, character.darkGauge + skill.gaugeCharge);

      // 게이지가 가득 찼는지 확인
      if (character.darkGauge >= 10000) {
        character.isInEquilibriumDelay = true;
      }
    } else {
      character.lightGauge = Math.min(10000, character.lightGauge + skill.gaugeCharge);

      // 게이지가 가득 찼는지 확인
      if (character.lightGauge >= 10000) {
        character.isInEquilibriumDelay = true;
      }
    }
  }
}

// 게이지가 가득 찼을 때 처리
function handleFullGauge() {
  // 이퀼 유예 모드에 따른 처리
  if (character.equilibriumMode === 'AUTO') {
    enterEquilibrium();
  } else {
    // 수동 모드에서는 유예 상태만 설정
    character.isInEquilibriumDelay = true;
  }
}

// 이퀼리브리엄 상태 진입
function enterEquilibrium() {
  // 이전 상태 저장
  const prevState = character.currentState;

  // 상태 변경
  character.currentState = 'EQUILIBRIUM';
  character.isInEquilibriumDelay = false;

  // 다음 상태 설정 (현재 상태의 반대)
  character.nextState = prevState === 'LIGHT' ? 'DARK' : 'LIGHT';

  // 버프 지속시간 증가 효과 적용
  let duration = simulation.equilibriumDuration;
  if (prevState !== 'EQUILIBRIUM') { // 메모라이즈로 인한 이퀼이 아닐 때만 벞지 적용
    duration = duration * (1 + character.buffDuration / 100);
  }

  // 이퀼 종료 시간 설정
  character.equilibriumEndTime = simulation.currentTime + duration;

  // 빛과 어둠의 세례 쿨타임 초기화
  if (simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] > 0) {
    simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] = 0;
  }

  // 상태 변경 이벤트 발생
  self.postMessage({
    type: 'STATE_CHANGED',
    data: {
      state: 'EQUILIBRIUM',
      time: simulation.currentTime
    }
  });

  // 버프 추가 (내부적으로만 처리)
  addBuff({
    ...buffs.EQUILIBRIUM,
    isActive: true,
    startTime: simulation.currentTime,
    endTime: character.equilibriumEndTime
  });

  // 진리의 문 사용 여부 초기화
  simulation.doorOfTruthUsed = false;
}

// 상태 업데이트 함수
function updateState(elapsedTime: number) {
  // 쿨타임 업데이트
  for (const skillId in simulation.cooldowns) {
    if (simulation.cooldowns[skillId] > 0) {
      simulation.cooldowns[skillId] = Math.max(0, simulation.cooldowns[skillId] - elapsedTime);
    }
  }

  // 딜레이 상태 업데이트
  if (simulation.inSkillDelay && simulation.skillDelayEndTime) {
    if (simulation.currentTime >= simulation.skillDelayEndTime) {
      // 딜레이 종료
      simulation.inSkillDelay = false;
      simulation.skillDelayEndTime = undefined;
    }
  }

  // 버프 상태 업데이트
  for (let i = simulation.activeBuffs.length - 1; i >= 0; i--) {
    const buff = simulation.activeBuffs[i];

    if (buff.endTime && buff.endTime <= simulation.currentTime) {
      // 이퀼리브리엄 버프가 종료됐다면 상태 전환
      if (buff.id === 'EQUILIBRIUM') {
        exitEquilibrium();
      } else {
        // 일반 버프 제거
        simulation.activeBuffs.splice(i, 1);

        // 버프 종료 이벤트 발생
        self.postMessage({
          type: 'BUFF_CHANGED',
          data: {
            buffId: buff.id,
            action: 'EXPIRED',
            time: simulation.currentTime
          }
        });
      }
    }
  }

  // 컨티 사이클 업데이트
  updateContinuousCycle(elapsedTime);

  // 이퀼 상태에서 딜레이가 발생하면 수동/자동 모드에 따라 처리
  if (character.isInEquilibriumDelay && character.equilibriumMode === 'AUTO') {
    enterEquilibrium();
  }
}

// 이퀼리브리엄 상태 종료
function exitEquilibrium() {
  // 상태 변경
  character.currentState = character.nextState;
  character.isInEquilibriumDelay = false;
  character.equilibriumEndTime = undefined;

  // 게이지 초기화
  if (character.currentState === 'LIGHT') {
    character.lightGauge = 0;
  } else {
    character.darkGauge = 0;
  }

  // 상태 변경 이벤트 발생
  self.postMessage({
    type: 'STATE_CHANGED',
    data: {
      state: character.currentState,
      time: simulation.currentTime
    }
  });

  // 이퀼리브리엄 버프 제거
  removeBuff('EQUILIBRIUM');
}
// src/workers/simulation.worker.ts (계속)
// 컨티 사이클 업데이트 함수 마저 작성
function updateContinuousCycle(elapsedTime: number) {
  const cycle = { ...simulation.continuousCycle };

  if (!cycle.lastActivationTime) {
    // 초기 활성화 - 새 객체 생성
    simulation.continuousCycle = {
      ...cycle,
      isActive: true,
      lastActivationTime: simulation.currentTime
    };

    // 컨티 버프 추가
    addBuff({
      ...buffs.CONTINUOUS_RING,
      isActive: true,
      startTime: simulation.currentTime,
      endTime: simulation.currentTime + cycle.activeTime
    });

    character.isContinuousActive = true;
    character.continuousStartTime = simulation.currentTime;
  } else {
    const timeSinceLastActivation = simulation.currentTime - cycle.lastActivationTime;

    if (cycle.isActive && timeSinceLastActivation >= cycle.activeTime) {
      // 활성 -> 대기 - 새 객체 생성
      simulation.continuousCycle = {
        ...cycle,
        isActive: false,
        lastActivationTime: simulation.currentTime
      };

      // 컨티 버프 제거
      removeBuff('CONTINUOUS_RING');

      character.isContinuousActive = false;
      character.continuousStartTime = undefined;
    } else if (!cycle.isActive && timeSinceLastActivation >= cycle.cooldownTime) {
      // 대기 -> 활성 - 새 객체 생성
      simulation.continuousCycle = {
        ...cycle,
        isActive: true,
        lastActivationTime: simulation.currentTime
      };

      // 컨티 버프 추가
      addBuff({
        ...buffs.CONTINUOUS_RING,
        isActive: true,
        startTime: simulation.currentTime,
        endTime: simulation.currentTime + cycle.activeTime
      });

      character.isContinuousActive = true;
      character.continuousStartTime = simulation.currentTime;
    }
  }
}

// 버프 관련 함수
function addBuff(buff: any) {
  // 이미 존재하는 버프인지 확인
  const existingIndex = simulation.activeBuffs.findIndex(b => b.id === buff.id);

  if (existingIndex >= 0) {
    // 기존 버프 업데이트
    simulation.activeBuffs[existingIndex] = buff;
  } else {
    // 새 버프 추가
    simulation.activeBuffs.push(buff);

    // 버프 추가 이벤트 발생
    self.postMessage({
      type: 'BUFF_CHANGED',
      data: {
        buffId: buff.id,
        action: 'APPLIED',
        time: simulation.currentTime
      }
    });
  }
}

function removeBuff(buffId: string) {
  simulation.activeBuffs = simulation.activeBuffs.filter(b => b.id !== buffId);

  // 버프 제거 이벤트 발생
  self.postMessage({
    type: 'BUFF_CHANGED',
    data: {
      buffId: buffId,
      action: 'EXPIRED',
      time: simulation.currentTime
    }
  });
}

// 스킬 특수 효과 처리 함수
function processSpecialEffects(skill: any) {
  if (!skill.special) return;

  // 다른 스킬의 쿨타임 감소 효과
  if (skill.special.reduceOtherCooldown) {
    const { skillId, amount, condition } = skill.special.reduceOtherCooldown;

    // 조건 확인
    if (!condition || condition === 'ALWAYS' ||
      (condition === 'EQUILIBRIUM' && character.currentState === 'EQUILIBRIUM')) {

      // 특정 스킬의 쿨타임 감소
      if (skillId && simulation.cooldowns[skillId]) {
        simulation.cooldowns[skillId] = Math.max(0, simulation.cooldowns[skillId] - (amount || 0));
      } else if (!skillId) {
        // 빛과 어둠의 세례 쿨타임 감소 (이퀼 스킬 사용 시)
        if (character.currentState === 'EQUILIBRIUM' &&
          simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS']) {
          simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] = Math.max(
            0,
            simulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] - 2000 // 2초 감소
          );
        }
      }
    }
  }

  // 이퀼 지속시간 연장 효과
  if (skill.special.extendEquilibriumDuration && character.currentState === 'EQUILIBRIUM') {
    const extension = skill.special.extendEquilibriumDuration;

    if (character.equilibriumEndTime) {
      character.equilibriumEndTime += extension;

      // 활성화된 이퀼 버프의 종료 시간도 업데이트
      const buffIndex = simulation.activeBuffs.findIndex(b => b.id === 'EQUILIBRIUM');
      if (buffIndex >= 0) {
        simulation.activeBuffs[buffIndex].endTime = character.equilibriumEndTime;
      }
    }
  }
}

// 데미지 계산 함수
function calculateDamage(skill: any): number {
  // 기본 데미지 계산
  let damage = skill.damage * skill.hitCount * skill.maxTargets;

  // 일부 스킬은 한 적당 한 번만 적용
  if (simulation.applyOneHitPerTarget && skill.id === 'ABSOLUTE_KILL') {
    damage = skill.damage * skill.hitCount;
  }

  // 캐릭터 상태에 따른 데미지 보정
  if (character.currentState === 'EQUILIBRIUM') {
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
    if ((character.currentState === 'LIGHT' && skill.element === 'LIGHT') ||
      (character.currentState === 'DARK' && skill.element === 'DARK')) {
      damage *= 1.5; // 속성 일치 시 1.5배 데미지
    }
  }

  // 버프 효과 적용
  for (const buff of simulation.activeBuffs) {
    if (buff.effects.damageIncrease) {
      damage *= (1 + buff.effects.damageIncrease / 100);
    }
    if (buff.effects.finalDamageIncrease) {
      damage *= (1 + buff.effects.finalDamageIncrease / 100);
    }
  }

  // 보스 데미지 보정
  if (simulation.simulateBossOnly) {
    damage *= (1 + character.bossDamage / 100);
  }

  // 크리티컬 확률 및 데미지 보정
  const critRate = Math.min(100, character.critRate + (skill.addCritRate || 0));
  if (Math.random() * 100 < critRate) {
    damage *= (1 + character.critDamage / 100);
  }

  // 재사용 확률 적용
  if (skill.cooldown > 0 && Math.random() * 100 < character.cooldownResetChance) {
    simulation.cooldowns[skill.id] = 0;
  }

  return damage;
}