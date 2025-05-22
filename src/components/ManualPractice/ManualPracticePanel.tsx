// src/components/ManualPractice/ManualPracticePanel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PracticeControls } from './PracticeControls';
import { CharacterStatusViewer } from './CharacterStatusViewer';
import { SkillBar } from './SkillBar';
import { KeyBindingPanel } from './KeyBindingPanel';
import { useLuminousCharacter } from '../../hooks/useLuminousCharacter';
import { useSkillActions } from '../../hooks/useSkillActions';
import { useECS } from '../../hooks/useECS';
import { useECSEvents } from '../../hooks/useECSEvents';
import { LUMINOUS_SKILLS, getDefaultKeyBindings } from '../../data/skills';
import type { StateComponent } from '../../ecs/components/StateComponent';
import type { GaugeComponent } from '../../ecs/components/GaugeComponent';
import type { SkillComponent } from '../../ecs/components/SkillComponent';
import type { DamageComponent } from '../../ecs/components/DamageComponent';
import type { TimeComponent } from '../../ecs/components/TimeComponent';
import type { BuffComponent } from '../../ecs/components/BuffComponent';
import './ManualPracticePanel.css';

// 키 바인딩 타입
interface KeyBinding {
  skillId: string;
  key: string;
  displayKey: string;
}

// React에서 관리할 캐릭터 상태 (ECS 상태 미러링)
interface CharacterDisplayState {
  currentTime: number;
  currentState: string;
  lightGauge: number;
  darkGauge: number;
  maxGauge: number;
  totalDamage: number;
  equilibriumEndTime?: number;
  activeBuffs: string[];
  skillCooldowns: Map<string, number>;
}

// 스킬 정의 데이터 - 중앙화된 데이터 사용
const SKILLS = LUMINOUS_SKILLS;

export const ManualPracticePanel: React.FC = () => {
  // ECS 훅들 사용
  const { world, step } = useECS();
  const character = useLuminousCharacter();
  const { useSkill } = useSkillActions(character?.entity || null);

  // React에서 관리하는 디스플레이 상태
  const [displayState, setDisplayState] = useState<CharacterDisplayState>({
    currentTime: 0,
    currentState: 'LIGHT',
    lightGauge: 0,
    darkGauge: 0,
    maxGauge: 10000,
    totalDamage: 0,
    activeBuffs: [],
    skillCooldowns: new Map(),
  });

  // 로컬 상태
  const [isRunning, setIsRunning] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const [keyBindings, setKeyBindings] = useState(getDefaultKeyBindings());

  // ECS에서 React 상태로 동기화하는 함수
  const syncECSToReact = useCallback(() => {
    if (!character?.entity) return;

    const timeComp = world.getComponent<TimeComponent>(character.entity, 'time');
    const stateComp = world.getComponent<StateComponent>(character.entity, 'state');
    const gaugeComp = world.getComponent<GaugeComponent>(character.entity, 'gauge');
    const damageComp = world.getComponent<DamageComponent>(character.entity, 'damage');
    const buffComp = world.getComponent<BuffComponent>(character.entity, 'buff');
    const skillComp = world.getComponent<SkillComponent>(character.entity, 'skill');

    if (!timeComp || !stateComp || !gaugeComp || !damageComp) return;

    // 스킬 쿨다운 맵 생성
    const cooldowns = new Map<string, number>();
    SKILLS.forEach(skill => {
      const skillData = skillComp?.getSkill(skill.id);
      if (skillData) {
        cooldowns.set(skill.id, skillData.cooldown);
      }
    });

    setDisplayState({
      currentTime: timeComp.currentTime,
      currentState: stateComp.currentState,
      lightGauge: gaugeComp.lightGauge,
      darkGauge: gaugeComp.darkGauge,
      maxGauge: gaugeComp.maxGauge,
      totalDamage: damageComp.totalDamage,
      equilibriumEndTime: stateComp.equilibriumEndTime,
      activeBuffs: buffComp?.getAllBuffs().map(buff => buff.name) || [],
      skillCooldowns: cooldowns,
    });
  }, [world, character?.entity]);

  // 실시간 게임 루프 - React가 시간 제어
  useEffect(() => {
    if (!isRunning) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // 누적 시간 계산
      accumulatedTimeRef.current += deltaTime;

      // 10ms마다 ECS 업데이트
      while (accumulatedTimeRef.current >= 10) {
        step(10); // 고정 10ms 타임스텝
        accumulatedTimeRef.current -= 10;
      }

      // ECS 상태를 React로 동기화
      syncECSToReact();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    accumulatedTimeRef.current = 0;
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isRunning, step, syncECSToReact]);

  // ECS 이벤트 리스너들
  useECSEvents('damage:dealt', useCallback((_eventType, _entity, data) => {
    console.log('💥 데미지 발생:', data);
  }, []));

  useECSEvents('state:entered_equilibrium', useCallback((_eventType, _entity, _data) => {
    console.log('⚖️ 이퀼리브리엄 진입');
  }, []));

  useECSEvents('gauge:charged', useCallback((_eventType, _entity, data) => {
    console.log('⚡ 게이지 충전:', data);
  }, []));

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!isRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyCombo = e.key.toLowerCase();
      const binding = keyBindings.find(kb => kb.key === keyCombo);

      if (binding) {
        const skillDef = SKILLS.find(s => s.id === binding.skillId);
        if (skillDef) {
          useSkill(skillDef);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, keyBindings, useSkill]);

  // 컨트롤 핸들러들
  const handleStart = () => {
    setIsRunning(true);
    console.log('🎮 연습 모드 시작');
  };

  const handlePause = () => {
    setIsRunning(false);
    console.log('⏸️ 연습 모드 일시정지');
  };

  const handleReset = () => {
    setIsRunning(false);
    
    // ECS 상태 초기화
    if (character?.entity) {
      const timeComp = world.getComponent<TimeComponent>(character.entity, 'time');
      const damageComp = world.getComponent<DamageComponent>(character.entity, 'damage');
      const gaugeComp = world.getComponent<GaugeComponent>(character.entity, 'gauge');
      
      if (timeComp) {
        timeComp.currentTime = 0;
        timeComp.deltaTime = 0;
      }
      if (damageComp) {
        damageComp.reset();
      }
      if (gaugeComp) {
        gaugeComp.resetLightGauge();
        gaugeComp.resetDarkGauge();
      }
      
      // React 상태도 동기화
      syncECSToReact();
    }
    
    console.log('🔄 연습 모드 초기화');
  };

  const handleSkillUse = (skillId: string) => {
    if (!isRunning) return;
    const skillDef = SKILLS.find(s => s.id === skillId);
    if (skillDef) {
      useSkill(skillDef);
    }
  };

  const updateKeyBinding = (skillId: string, newKey: string) => {
    setKeyBindings(prev =>
      prev.map(kb =>
        kb.skillId === skillId
          ? { ...kb, key: newKey, displayKey: newKey.toUpperCase() }
          : kb
      )
    );
  };

  // 로딩 체크
  if (!character) {
    return <div>🔄 캐릭터 로딩 중...</div>;
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'LIGHT': return '빛';
      case 'DARK': return '어둠';
      case 'EQUILIBRIUM': return '이퀼리브리엄';
      default: return state;
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  // 이퀼리브리엄 남은 시간 계산
  const equilibriumTimeLeft = displayState.equilibriumEndTime ? 
    Math.max(0, displayState.equilibriumEndTime - displayState.currentTime) / 1000 : undefined;

  return (
    <div className="manual-practice-panel" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>🎮 Manual Practice</h1>
        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
          시간: {formatTime(displayState.currentTime)}
        </div>
      </div>

      <PracticeControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />

      <div className="practice-content">
        {/* 인라인 캐릭터 상태 표시 */}
        <div className="character-status-viewer">
          <h3>캐릭터 상태</h3>
          
          <div className="current-state">
            <div className="state-info">
              <span className="state-label">현재 상태:</span>
              <span className={`state-value state-${displayState.currentState.toLowerCase()}`}>
                {getStateLabel(displayState.currentState)}
              </span>
              {equilibriumTimeLeft && (
                <span className="equilibrium-timer">
                  ({equilibriumTimeLeft.toFixed(1)}초 남음)
                </span>
              )}
            </div>
          </div>

          <div className="gauge-container">
            <div className="gauge-item light-gauge">
              <div className="gauge-label">빛 게이지</div>
              <div className="gauge-bar">
                <div 
                  className="gauge-fill light"
                  style={{ width: `${(displayState.lightGauge / displayState.maxGauge) * 100}%` }}
                />
              </div>
              <div className="gauge-value">{displayState.lightGauge} / {displayState.maxGauge}</div>
            </div>

            <div className="gauge-item dark-gauge">
              <div className="gauge-label">어둠 게이지</div>
              <div className="gauge-bar">
                <div 
                  className="gauge-fill dark"
                  style={{ width: `${(displayState.darkGauge / displayState.maxGauge) * 100}%` }}
                />
              </div>
              <div className="gauge-value">{displayState.darkGauge} / {displayState.maxGauge}</div>
            </div>
          </div>

          <div className="damage-info">
            <div className="damage-label">총 데미지</div>
            <div className="damage-value">{formatNumber(displayState.totalDamage)}</div>
          </div>

          <div className="active-buffs">
            <div className="buffs-label">활성 버프</div>
            <div className="buffs-list">
              {displayState.activeBuffs.length > 0 ? (
                displayState.activeBuffs.map((buff, index) => (
                  <span key={index} className="buff-chip">
                    {buff}
                  </span>
                ))
              ) : (
                <span className="no-buffs">없음</span>
              )}
            </div>
          </div>
        </div>

        <SkillBar
          skills={SKILLS.map(skill => ({
            id: skill.id,
            name: skill.name,
            icon: skill.icon,
            cooldown: (displayState.skillCooldowns.get(skill.id) || 0) / 1000,
            maxCooldown: skill.cooldown / 1000,
            keyBinding: keyBindings.find(kb => kb.skillId === skill.id)?.displayKey || '',
            element: skill.element,
            disabled: (displayState.skillCooldowns.get(skill.id) || 0) > 0
          }))}
          onSkillUse={handleSkillUse}
          isRunning={isRunning}
        />

        <KeyBindingPanel
          skills={SKILLS.map(skill => ({
            id: skill.id,
            name: skill.name,
            keyBinding: keyBindings.find(kb => kb.skillId === skill.id)?.displayKey || '',
            element: skill.element
          }))}
          onUpdateBinding={updateKeyBinding}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
};