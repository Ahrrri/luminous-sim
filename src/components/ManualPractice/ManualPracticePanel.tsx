// src/components/ManualPractice/ManualPracticePanel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PracticeControls } from './PracticeControls';
import { CharacterStatusViewer } from './CharacterStatusViewer';
import { SkillBar } from './SkillBar';
import { KeyBindingPanel } from './KeyBindingPanel';
import { useLuminousCharacter } from '../../hooks/useLuminousCharacter';
import { useSkillActions } from '../../hooks/useSkillActions';
import type { SkillDefinition } from '../../hooks/useSkillActions';
import { useECSEvents } from '../../hooks/useECSEvents';
import { useComponent } from '../../hooks/useComponent';
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

// 스킬 정의 데이터
const SKILLS: SkillDefinition[] = [
  { id: 'reflection', name: '라이트 리플렉션', icon: '☀️', element: 'LIGHT', damage: 810, hitCount: 4, maxTargets: 8, gaugeCharge: 451, cooldown: 0 },
  { id: 'apocalypse', name: '아포칼립스', icon: '🌙', element: 'DARK', damage: 768, hitCount: 7, maxTargets: 8, gaugeCharge: 470, cooldown: 0 },
  { id: 'absolute_kill', name: '앱솔루트 킬', icon: '⚡', element: 'EQUILIBRIUM', damage: 695, hitCount: 7, maxTargets: 3, gaugeCharge: 0, cooldown: 10000 },
  { id: 'door_of_truth', name: '진리의 문', icon: '🚪', element: 'EQUILIBRIUM', damage: 990, hitCount: 10, maxTargets: 12, gaugeCharge: 0, cooldown: 0 },
  { id: 'baptism', name: '빛과 어둠의 세례', icon: '✨', element: 'EQUILIBRIUM', damage: 660, hitCount: 7, maxTargets: 1, gaugeCharge: 0, cooldown: 30000 },
  { id: 'nova', name: '트와일라잇 노바', icon: '💥', element: 'NONE', damage: 1630, hitCount: 7, maxTargets: 8, gaugeCharge: 300, cooldown: 15000 },
  { id: 'punishing', name: '퍼니싱 리소네이터', icon: '🎵', element: 'NONE', damage: 1100, hitCount: 6, maxTargets: 10, gaugeCharge: 0, cooldown: 30000 },
  { id: 'heroic_oath', name: '히어로즈 오쓰', icon: '🛡️', element: 'NONE', damage: 0, hitCount: 0, maxTargets: 0, gaugeCharge: 0, cooldown: 120000 },
];

export const ManualPracticePanel: React.FC = () => {
  // ECS 훅들 사용
  const character = useLuminousCharacter();
  const { useSkill } = useSkillActions(character?.entity || null);

  // 컴포넌트들 개별 접근
  const stateComp = useComponent<StateComponent>(character?.entity || null, 'state');
  const gaugeComp = useComponent<GaugeComponent>(character?.entity || null, 'gauge');
  const skillComp = useComponent<SkillComponent>(character?.entity || null, 'skill');
  const damageComp = useComponent<DamageComponent>(character?.entity || null, 'damage');
  const timeComp = useComponent<TimeComponent>(character?.entity || null, 'time');
  const buffComp = useComponent<BuffComponent>(character?.entity || null, 'buff');

  // 로컬 상태
  const [isRunning, setIsRunning] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const [keyBindings, setKeyBindings] = useState<KeyBinding[]>([
    { skillId: 'reflection', key: 'q', displayKey: 'Q' },
    { skillId: 'apocalypse', key: 'w', displayKey: 'W' },
    { skillId: 'absolute_kill', key: 'e', displayKey: 'E' },
    { skillId: 'door_of_truth', key: 'r', displayKey: 'R' },
    { skillId: 'baptism', key: 'a', displayKey: 'A' },
    { skillId: 'nova', key: 's', displayKey: 'S' },
    { skillId: 'punishing', key: 'd', displayKey: 'D' },
    { skillId: 'heroic_oath', key: 'z', displayKey: 'Z' },
  ]);

  // 게임 루프 - 연습 모드 실행 중에만 시간 진행
  useEffect(() => {
    if (!isRunning || !timeComp) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // 30ms마다 시간 업데이트
      if (deltaTime >= 30) {
        timeComp.update(timeComp.currentTime + 30);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isRunning, timeComp]);

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
    if (timeComp) {
      timeComp.update(0);
    }
    if (damageComp) {
      damageComp.reset();
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
  if (!character || !stateComp || !gaugeComp || !timeComp) {
    return <div>🔄 캐릭터 로딩 중...</div>;
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <div className="manual-practice-panel" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>🎮 Manual Practice</h1>
        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
          시간: {formatTime(timeComp.currentTime)}
        </div>
      </div>

      <PracticeControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />

      <div className="practice-content">
        <CharacterStatusViewer entity={character.entity} />

        <SkillBar
          skills={SKILLS.map(skill => ({
            id: skill.id,
            name: skill.name,
            icon: skill.icon,
            cooldown: (skillComp?.getSkill(skill.id)?.cooldown || 0) / 1000,
            maxCooldown: skill.cooldown / 1000,
            keyBinding: keyBindings.find(kb => kb.skillId === skill.id)?.displayKey || '',
            element: skill.element,
            disabled: !skillComp?.isSkillAvailable(skill.id) || false
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