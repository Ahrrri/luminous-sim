// src/components/Practice/PracticeMode.tsx 수정
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import SkillBar from './SkillBar';
import KeyBindingPanel from './KeyBindingPanel';
import { addDamageSnapshot, addBuffEvent, addStateChange } from '../../store/slices/resultsSlice';
import { skills } from '../../models/skills';
import { buffs } from '../../models/buffs';
import { calculateCooldown, formatTime, formatTimeWithMs } from '../../utils/helpers';
import './practice.css';

// 타입 임포트
import type { CharacterState } from '../../models/character';
import type { SimulationState } from '../../models/simulation';
import type { Skill } from '../../models/skills';
import type { Buff } from '../../models/buffs';

// 키 바인딩 타입 정의
interface KeyBinding {
  skillId: string;
  key: string;
  displayKey: string;
}

const PracticeMode: React.FC = () => {
  const dispatch = useDispatch();
  const characterState = useSelector((state: RootState) => state.character);
  const simulationState = useSelector((state: RootState) => state.simulation);
  
  // 로컬 상태 관리
  const [localCharacter, setLocalCharacter] = useState<CharacterState>({...characterState});
  const [localSimulation, setLocalSimulation] = useState<SimulationState>({...simulationState});
  const [isRunning, setIsRunning] = useState(false);
  const [gameTime, setGameTime] = useState(0); // ms 단위의 게임 내 시간
  
  // 키 바인딩 상태
  const [keyBindings, setKeyBindings] = useState<KeyBinding[]>([
    { skillId: 'REFLECTION', key: 'q', displayKey: 'Q' },
    { skillId: 'APOCALYPSE', key: 'w', displayKey: 'W' },
    { skillId: 'ABSOLUTE_KILL', key: 'e', displayKey: 'E' },
    { skillId: 'DOOR_OF_TRUTH', key: 'r', displayKey: 'R' },
    { skillId: 'BAPTISM_OF_LIGHT_AND_DARKNESS', key: 'a', displayKey: 'A' },
    { skillId: 'TWILIGHT_NOVA', key: 's', displayKey: 'S' },
    { skillId: 'PUNISHING_RESONATOR', key: 'd', displayKey: 'D' },
    { skillId: 'MEMORIZE', key: 'f', displayKey: 'F' },
    { skillId: 'HEROIC_OATH', key: 'z', displayKey: 'Z' },
    { skillId: 'MAPLE_GODDESS_BLESSING', key: 'x', displayKey: 'X' },
    { skillId: 'LIBERATION_ORB_ACTIVE', key: 'c', displayKey: 'C' },
    { skillId: 'HARMONIC_PARADOX', key: 'v', displayKey: 'V' },
  ]);
  
  // 연습 시작
  const startPractice = useCallback(() => {
    setIsRunning(true);
    setGameTime(0);
  }, []);
  
  // 연습 중지
  const stopPractice = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  // 연습 초기화
  const resetPractice = useCallback(() => {
    setIsRunning(false);
    setGameTime(0);
    setLocalCharacter({...characterState});
    setLocalSimulation({...simulationState});
  }, [characterState, simulationState]);
  
  // 스킬 사용 가능 여부 체크
  const canUseSkill = (skillId: string): boolean => {
    const skill = skills[skillId];
    if (!skill) return false;
    
    // 쿨타임 체크
    if (localSimulation.cooldowns[skillId] > 0) {
      return false;
    }
    
    // 이퀼 전용 스킬 체크
    if (skill.isEquilibriumOnly && localCharacter.currentState !== 'EQUILIBRIUM') {
      return false;
    }
    
    // 진리의 문 체크
    if (skillId === 'DOOR_OF_TRUTH' && localSimulation.doorOfTruthUsed) {
      return false;
    }
    
    // 메모라이즈 체크
    if (skillId === 'MEMORIZE' && !localSimulation.memorizeAvailable) {
      return false;
    }
    
    return true;
  };
  
  // 키보드 이벤트 처리
  useEffect(() => {
    if (!isRunning) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const binding = keyBindings.find(kb => kb.key === e.key.toLowerCase());
      if (binding) {
        useSkill(binding.skillId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning, keyBindings, localCharacter, localSimulation]);
  
  // 스킬 사용 함수
  const useSkill = (skillId: string) => {
    if (!canUseSkill(skillId)) return;
    
    const skill = skills[skillId];
    console.log(skill);
    // 스킬 딜레이만큼 게임 시간 진행
    const timeAdvance = skill.delay;
    
    // 쿨타임 설정
    setLocalSimulation(prev => ({
      ...prev,
      cooldowns: {
        ...prev.cooldowns,
        [skillId]: calculateCooldown(
          skill.cooldown,
          localCharacter.merLevel,
          localCharacter.cooldownReduction
        )
      },
      lastSkillUsed: skillId,
      lastSkillTime: gameTime
    }));
    
    // 특수 스킬 처리
    if (skillId === 'DOOR_OF_TRUTH') {
      setLocalSimulation(prev => ({
        ...prev,
        doorOfTruthUsed: true
      }));
    } else if (skillId === 'MEMORIZE') {
      handleMemorize();
    }
    
    // 게이지 충전
    handleGaugeCharge(skill);
    
    // 데미지 계산 및 이벤트 발생
    const damage = calculateDamage(skill);
    
    dispatch(addDamageSnapshot({
      time: gameTime,
      damage,
      skill: skillId,
      state: localCharacter.currentState
    }));
    
    // 버프 처리
    if (skill.type === 'BUFF') {
      applyBuff(skillId);
    }
    
    // 스킬 특수 효과 처리
    processSpecialEffects(skill);
    
    // 시간 진행 및 상태 업데이트
    advanceGameTime(timeAdvance);
  };
  
  // 게임 시간 진행 함수
  const advanceGameTime = (ms: number) => {
    const newGameTime = gameTime + ms;
    setGameTime(newGameTime);
    
    // 쿨타임 업데이트
    updateCooldowns(ms);
    
    // 버프 지속시간 체크
    checkBuffDurations(ms);
  };
  
  // 쿨타임 업데이트
  const updateCooldowns = (elapsedTime: number) => {
    setLocalSimulation(prev => {
      const updatedCooldowns = {...prev.cooldowns};
      
      Object.keys(updatedCooldowns).forEach(key => {
        if (updatedCooldowns[key] > 0) {
          updatedCooldowns[key] = Math.max(0, updatedCooldowns[key] - elapsedTime);
        }
      });
      
      return {
        ...prev,
        cooldowns: updatedCooldowns
      };
    });
  };
  
  // 버프 지속시간 확인
  const checkBuffDurations = (elapsedTime: number) => {
    setLocalSimulation(prev => {
      const expiredBuffs: string[] = [];
      const updatedBuffs = prev.activeBuffs.map(buff => {
        if (buff.endTime) {
          const newEndTime = buff.endTime - elapsedTime;
          
          if (newEndTime <= gameTime) {
            expiredBuffs.push(buff.id);
            return { ...buff, endTime: newEndTime };
          }
          
          return { ...buff, endTime: newEndTime };
        }
        
        return buff;
      }).filter(buff => !expiredBuffs.includes(buff.id));
      
      // 만료된 버프 처리
      expiredBuffs.forEach(buffId => {
        // 버프 만료 이벤트 발생
        dispatch(addBuffEvent({
          time: gameTime,
          buffId,
          action: 'EXPIRED'
        }));
        
        // 이퀼 버프가 만료되면 상태 전환
        if (buffId === 'EQUILIBRIUM') {
          handleEquilibriumEnd();
        }
      });
      
      // 컨티 사이클 업데이트
      let updatedContinuousCycle = {...prev.continuousCycle};
      
      if (updatedContinuousCycle.isActive) {
        // 컨티 활성 시간 감소
        const remainingActiveTime = localCharacter.continuousStartTime 
          ? (updatedContinuousCycle.activeTime - (gameTime - localCharacter.continuousStartTime))
          : updatedContinuousCycle.activeTime;
        
        if (remainingActiveTime <= 0) {
          // 컨티 비활성화
          setLocalCharacter(prevChar => ({
            ...prevChar,
            isContinuousActive: false,
            continuousStartTime: undefined
          }));
          
          updatedContinuousCycle.isActive = false;
          updatedContinuousCycle.lastActivationTime = gameTime;
        }
      } else if (updatedContinuousCycle.lastActivationTime) {
        // 컨티 대기 시간 감소
        const remainingCooldownTime = 
          (updatedContinuousCycle.cooldownTime - (gameTime - updatedContinuousCycle.lastActivationTime));
        
        if (remainingCooldownTime <= 0) {
          // 컨티 재활성화
          setLocalCharacter(prevChar => ({
            ...prevChar,
            isContinuousActive: true,
            continuousStartTime: gameTime
          }));
          
          updatedContinuousCycle.isActive = true;
          updatedContinuousCycle.lastActivationTime = gameTime;
        }
      }
      
      return {
        ...prev,
        activeBuffs: updatedBuffs,
        continuousCycle: updatedContinuousCycle
      };
    });
    
    // 이퀼 종료 체크
    if (localCharacter.currentState === 'EQUILIBRIUM' && 
        localCharacter.equilibriumEndTime && 
        localCharacter.equilibriumEndTime <= gameTime) {
      handleEquilibriumEnd();
    }
  };
  
  // 게이지 충전 함수
  const handleGaugeCharge = (skill: Skill) => {
    if (skill.gaugeCharge <= 0) return;
    
    setLocalCharacter(prev => {
      let updatedLightGauge = prev.lightGauge;
      let updatedDarkGauge = prev.darkGauge;
      let isInEquilibriumDelay = prev.isInEquilibriumDelay;
      
      // 상태에 따른 게이지 충전
      if (prev.currentState === 'LIGHT') {
        // 빛 상태에서는 어둠 게이지 충전
        updatedDarkGauge = Math.min(10000, updatedDarkGauge + skill.gaugeCharge);
        
        // 게이지가 가득 찼는지 확인
        if (updatedDarkGauge >= 10000) {
          isInEquilibriumDelay = true;
          
          // 자동 모드인 경우 바로 이퀼 진입
          if (prev.equilibriumMode === 'AUTO') {
            setTimeout(() => enterEquilibrium(), 0);
          }
        }
      } else if (prev.currentState === 'DARK') {
        // 어둠 상태에서는 빛 게이지 충전
        updatedLightGauge = Math.min(10000, updatedLightGauge + skill.gaugeCharge);
        
        // 게이지가 가득 찼는지 확인
        if (updatedLightGauge >= 10000) {
          isInEquilibriumDelay = true;
          
          // 자동 모드인 경우 바로 이퀼 진입
          if (prev.equilibriumMode === 'AUTO') {
            setTimeout(() => enterEquilibrium(), 0);
          }
        }
      } else if (prev.currentState === 'EQUILIBRIUM') {
        // 이퀼 상태에서는 다음 상태에 따라 게이지 충전
        if (prev.nextState === 'LIGHT') {
          updatedDarkGauge = Math.min(10000, updatedDarkGauge + skill.gaugeCharge);
          
          // 게이지가 가득 찼는지 확인
          if (updatedDarkGauge >= 10000) {
            isInEquilibriumDelay = true;
          }
        } else {
          updatedLightGauge = Math.min(10000, updatedLightGauge + skill.gaugeCharge);
          
          // 게이지가 가득 찼는지 확인
          if (updatedLightGauge >= 10000) {
            isInEquilibriumDelay = true;
          }
        }
      }
      
      return {
        ...prev,
        lightGauge: updatedLightGauge,
        darkGauge: updatedDarkGauge,
        isInEquilibriumDelay
      };
    });
  };
  
  // 이퀼리브리엄 진입 함수
  const enterEquilibrium = () => {
    setLocalCharacter(prev => {
      // 이전 상태 저장
      const prevState = prev.currentState;
      
      // 버프 지속시간 증가 효과 적용
      let duration = localSimulation.equilibriumDuration;
      if (prevState !== 'EQUILIBRIUM') { // 메모라이즈로 인한 이퀼이 아닐 때만 벞지 적용
        duration = duration * (1 + prev.buffDuration / 100);
      }
      
      // 상태 변경 이벤트 발생
      dispatch(addStateChange({
        time: gameTime,
        state: 'EQUILIBRIUM'
      }));
      
      // 이퀼 버프 추가
      const equilibriumBuff: Buff = {
        ...buffs.EQUILIBRIUM,
        isActive: true,
        startTime: gameTime,
        endTime: gameTime + duration,
        serverLagApplicable: true
      };
      
      applyBuff('EQUILIBRIUM', equilibriumBuff);
      
      // 빛과 어둠의 세례 쿨타임 초기화
      setLocalSimulation(prev => ({
        ...prev,
        cooldowns: {
          ...prev.cooldowns,
          'BAPTISM_OF_LIGHT_AND_DARKNESS': 0
        },
        doorOfTruthUsed: false
      }));
      
      return {
        ...prev,
        currentState: 'EQUILIBRIUM',
        isInEquilibriumDelay: false,
        nextState: prevState === 'LIGHT' ? 'DARK' : 'LIGHT',
        equilibriumEndTime: gameTime + duration
      };
    });
  };
  
  // 이퀼리브리엄 종료 함수
  const handleEquilibriumEnd = () => {
    setLocalCharacter(prev => {
      const nextState = prev.nextState;
      
      // 상태 변경 이벤트 발생
      dispatch(addStateChange({
        time: gameTime,
        state: nextState
      }));
      
      // 이퀼 버프 제거
      removeBuff('EQUILIBRIUM');
      
      return {
        ...prev,
        currentState: nextState,
        isInEquilibriumDelay: false,
        equilibriumEndTime: undefined,
        lightGauge: nextState === 'LIGHT' ? 0 : prev.lightGauge,
        darkGauge: nextState === 'DARK' ? 0 : prev.darkGauge
      };
    });
  };
  
  // 메모라이즈 처리 함수
  const handleMemorize = () => {
    setLocalCharacter(prev => {
      // 이전 상태 저장
      const prevState = prev.currentState;
      let nextState: 'LIGHT' | 'DARK';
      
      // 다음 상태 결정
      if (prevState === 'LIGHT') {
        nextState = 'DARK';
      } else if (prevState === 'DARK') {
        nextState = 'LIGHT';
      } else {
        // 이퀼 상태에서는 다음 상태의 반대
        nextState = prev.nextState === 'LIGHT' ? 'DARK' : 'LIGHT';
      }
      
      // 게이지 초기화
      return {
        ...prev,
        currentState: 'EQUILIBRIUM',
        nextState,
        lightGauge: 0,
        darkGauge: 0,
        isInEquilibriumDelay: false,
        equilibriumEndTime: gameTime + 17000 // 메모라이즈는 벞지 효과 받지 않음
      };
    });
    
    // 이퀼 버프 추가
    const equilibriumBuff: Buff = {
      ...buffs.EQUILIBRIUM,
      isActive: true,
      startTime: gameTime,
      endTime: gameTime + 17000,
      serverLagApplicable: true
    };
    
    applyBuff('EQUILIBRIUM', equilibriumBuff);
    
    // 메모라이즈 사용 불가 설정
    setLocalSimulation(prev => ({
      ...prev,
      memorizeAvailable: false
    }));
    
    // 상태 변경 이벤트 발생
    dispatch(addStateChange({
      time: gameTime,
      state: 'EQUILIBRIUM'
    }));
  };
  
  // 버프 적용 함수
  const applyBuff = (buffId: string, customBuff?: Buff) => {
    if (!customBuff && !buffs[buffId]) return;
    
    const buff = customBuff || {
      ...buffs[buffId],
      isActive: true,
      startTime: gameTime,
      endTime: gameTime + buffs[buffId].duration * (1 + localCharacter.buffDuration / 100)
    };
    
    setLocalSimulation(prev => {
      // 기존 버프 찾기
      const existingIndex = prev.activeBuffs.findIndex(b => b.id === buffId);
      let updatedBuffs = [...prev.activeBuffs];
      
      if (existingIndex >= 0) {
        // 기존 버프 업데이트
        updatedBuffs[existingIndex] = buff;
      } else {
        // 새 버프 추가
        updatedBuffs.push(buff);
        
        // 버프 추가 이벤트 발생
        dispatch(addBuffEvent({
          time: gameTime,
          buffId,
          action: 'APPLIED'
        }));
      }
      
      return {
        ...prev,
        activeBuffs: updatedBuffs
      };
    });
  };
  
  // 버프 제거 함수
  const removeBuff = (buffId: string) => {
    setLocalSimulation(prev => ({
      ...prev,
      activeBuffs: prev.activeBuffs.filter(b => b.id !== buffId)
    }));
    
    // 버프 제거 이벤트 발생
    dispatch(addBuffEvent({
      time: gameTime,
      buffId,
      action: 'EXPIRED'
    }));
  };
  
  // 스킬 특수 효과 처리 함수
  const processSpecialEffects = (skill: Skill) => {
    if (!skill.special) return;
    
    // 다른 스킬의 쿨타임 감소 효과
    if (skill.special.reduceOtherCooldown) {
      const { skillId, amount, condition } = skill.special.reduceOtherCooldown;
      
      // 조건 확인
      if (!condition || condition === 'ALWAYS' ||
          (condition === 'EQUILIBRIUM' && localCharacter.currentState === 'EQUILIBRIUM')) {
          
        // 특정 스킬의 쿨타임 감소
        if (skillId && localSimulation.cooldowns[skillId]) {
          setLocalSimulation(prev => ({
            ...prev,
            cooldowns: {
              ...prev.cooldowns,
              [skillId]: Math.max(0, prev.cooldowns[skillId] - (amount || 0))
            }
          }));
        } else if (!skillId) {
          // 빛과 어둠의 세례 쿨타임 감소 (이퀼 스킬 사용 시)
          if (localCharacter.currentState === 'EQUILIBRIUM' &&
              localSimulation.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS']) {
            setLocalSimulation(prev => ({
              ...prev,
              cooldowns: {
                ...prev.cooldowns,
                'BAPTISM_OF_LIGHT_AND_DARKNESS': Math.max(
                  0,
                  prev.cooldowns['BAPTISM_OF_LIGHT_AND_DARKNESS'] - 2000 // 2초 감소
                )
              }
            }));
          }
        }
      }
    }
    
    // 이퀼 지속시간 연장 효과
    if (skill.special.extendEquilibriumDuration && 
        localCharacter.currentState === 'EQUILIBRIUM' &&
        localCharacter.equilibriumEndTime) {
      const extension = skill.special.extendEquilibriumDuration;
      
      setLocalCharacter(prev => ({
        ...prev,
        equilibriumEndTime: (prev.equilibriumEndTime || 0) + extension
      }));
      
      // 이퀼 버프 지속시간도 업데이트
      setLocalSimulation(prev => {
        const equilibriumBuff = prev.activeBuffs.find(b => b.id === 'EQUILIBRIUM');
        if (equilibriumBuff && equilibriumBuff.endTime) {
          const updatedBuff = {
            ...equilibriumBuff,
            endTime: equilibriumBuff.endTime + extension
          };
          
          return {
            ...prev,
            activeBuffs: prev.activeBuffs.map(b => 
              b.id === 'EQUILIBRIUM' ? updatedBuff : b
            )
          };
        }
        return prev;
      });
    }
  };
  
  // 데미지 계산 함수
  const calculateDamage = (skill: Skill): number => {
    // 기본 데미지 계산
    let damage = skill.damage * skill.hitCount * skill.maxTargets;
    
    // 일부 스킬은 한 적당 한 번만 적용
    if (localSimulation.applyOneHitPerTarget && skill.id === 'ABSOLUTE_KILL') {
      damage = skill.damage * skill.hitCount;
    }
    
    // 캐릭터 상태에 따른 데미지 보정
    if (localCharacter.currentState === 'EQUILIBRIUM') {
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
      if ((localCharacter.currentState === 'LIGHT' && skill.element === 'LIGHT') ||
          (localCharacter.currentState === 'DARK' && skill.element === 'DARK')) {
        damage *= 1.5; // 속성 일치 시 1.5배 데미지
      }
    }
    
    // 버프 효과 적용
    for (const buff of localSimulation.activeBuffs) {
      if (buff.effects.damageIncrease) {
        damage *= (1 + buff.effects.damageIncrease / 100);
      }
      if (buff.effects.finalDamageIncrease) {
        damage *= (1 + buff.effects.finalDamageIncrease / 100);
      }
    }
    
    // 보스 데미지 보정
    if (localSimulation.simulateBossOnly) {
      damage *= (1 + localCharacter.bossDamage / 100);
    }
    
    // 크리티컬 확률 및 데미지 보정
    const critRate = Math.min(100, localCharacter.critRate + (skill.addCritRate || 0));
    if (Math.random() * 100 < critRate) {
      damage *= (1 + localCharacter.critDamage / 100);
    }
    
    // 재사용 확률 적용
    if (skill.cooldown > 0 && Math.random() * 100 < localCharacter.cooldownResetChance) {
      setLocalSimulation(prev => ({
        ...prev,
        cooldowns: {
          ...prev.cooldowns,
          [skill.id]: 0
        }
      }));
    }
    
    // 총 데미지 누적
    setLocalSimulation(prev => ({
      ...prev,
      totalDamage: prev.totalDamage + damage
    }));
    
    return damage;
  };
  
  // 키 바인딩 업데이트 함수
  const updateKeyBinding = (skillId: string, newKey: string) => {
    setKeyBindings(prev => 
      prev.map(kb => 
        kb.skillId === skillId 
          ? { ...kb, key: newKey.toLowerCase(), displayKey: newKey.toUpperCase() } 
          : kb
      )
    );
  };
  
  // DPS 계산
  const calculateDPS = (): number => {
    if (gameTime <= 0) return 0;
    return localSimulation.totalDamage / (gameTime / 1000);
  };
  
  return (
    <div className="practice-mode">
      <div className="practice-header">
        <h2>실전 연습 모드</h2>
        <div className="practice-controls">
          {!isRunning ? (
            <button className="start-button" onClick={startPractice}>
              시작
            </button>
          ) : (
            <button className="stop-button" onClick={stopPractice}>
              중지
            </button>
          )}
          <button className="reset-button" onClick={resetPractice}>
            초기화
          </button>
        </div>
        <div className="practice-info">
          <div>게임 시간: {formatTimeWithMs(gameTime)}</div>
          <div>총 데미지: {localSimulation.totalDamage.toLocaleString()}</div>
          <div>DPS: {calculateDPS().toLocaleString()}</div>
        </div>
      </div>
      
      <div className="practice-layout">
        <div className="state-viewer-container">
          <div className="practice-state-viewer">
            <div className="state-info">
              <div className="current-state">
                <span>상태: </span>
                <span className={`state-label ${localCharacter.currentState.toLowerCase()}`}>
                  {localCharacter.currentState === 'LIGHT' ? '빛' :
                    localCharacter.currentState === 'DARK' ? '어둠' : '이퀼리브리엄'}
                </span>
                
                {localCharacter.currentState === 'EQUILIBRIUM' && (
                  <span className="equilibrium-time">
                    {localCharacter.equilibriumEndTime 
                      ? formatTime(localCharacter.equilibriumEndTime - gameTime) + ' 남음' 
                      : ''}
                  </span>
                )}
              </div>
              
              <div className="gauge-container">
                <div className="light-gauge">
                  <span>빛 게이지:</span>
                  <div className="gauge-bar">
                  <div
                      className="gauge-fill light"
                      style={{ width: `${(localCharacter.lightGauge / 10000) * 100}%` }}
                    ></div>
                  </div>
                  <span>{localCharacter.lightGauge} / 10000</span>
                </div>
                
                <div className="dark-gauge">
                  <span>어둠 게이지:</span>
                  <div className="gauge-bar">
                    <div
                      className="gauge-fill dark"
                      style={{ width: `${(localCharacter.darkGauge / 10000) * 100}%` }}
                    ></div>
                  </div>
                  <span>{localCharacter.darkGauge} / 10000</span>
                </div>
              </div>
            </div>
            
            <div className="damage-info">
              <div>총 데미지: {localSimulation.totalDamage.toLocaleString()}</div>
              <div>DPS: {calculateDPS().toLocaleString()}</div>
            </div>
            
            <div className="continuous-info">
              <div>
                컨티뉴어스 링:
                <span className={localCharacter.isContinuousActive ? 'active' : 'inactive'}>
                  {localCharacter.isContinuousActive ? '활성' : '비활성'}
                </span>
              </div>
            </div>
            
            <div className="active-buffs">
              <h3>활성 버프</h3>
              <ul>
                {localSimulation.activeBuffs.map(buff => (
                  <li key={buff.id}>
                    {buff.name}
                    {buff.endTime && (
                      <span> ({formatTime(buff.endTime - gameTime)} 남음)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="skill-bar-container">
          <SkillBar 
            skills={Object.values(skills).filter(s => s.type !== 'SUMMON')}
            cooldowns={localSimulation.cooldowns}
            keyBindings={keyBindings}
            character={localCharacter}
            onSkillUse={useSkill}
            gameTime={gameTime}
          />
        </div>
      </div>
      
      <div className="key-binding-panel-container">
        <KeyBindingPanel 
          keyBindings={keyBindings}
          onUpdateBinding={updateKeyBinding}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
};

export default PracticeMode;