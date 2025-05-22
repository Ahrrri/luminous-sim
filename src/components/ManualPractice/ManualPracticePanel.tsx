// src/components/ManualPractice/ManualPracticePanel.tsx
import React, { useState } from 'react';
import { PracticeControls } from './PracticeControls';
import { CharacterStatusViewer } from './CharacterStatusViewer';
import { SkillBar } from './SkillBar';
import { KeyBindingPanel } from './KeyBindingPanel';
import './ManualPracticePanel.css';

// Mock 데이터 타입들
interface MockCharacterState {
  currentState: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
  lightGauge: number;
  darkGauge: number;
  totalDamage: number;
  activeBuffs: string[];
  equilibriumTimeLeft?: number;
}

interface MockSkill {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  maxCooldown: number;
  keyBinding: string;
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'BUFF';
  disabled: boolean;
}

export const ManualPracticePanel: React.FC = () => {
  // Mock 상태들
  const [isRunning, setIsRunning] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [character, setCharacter] = useState<MockCharacterState>({
    currentState: 'LIGHT',
    lightGauge: 3000,
    darkGauge: 7500,
    totalDamage: 1234567890,
    activeBuffs: ['오쓰', '메용2', '컨티'],
  });

  const [skills, setSkills] = useState<MockSkill[]>([
    { id: 'reflection', name: '라이트 리플렉션', icon: '☀️', cooldown: 0, maxCooldown: 0, keyBinding: 'Q', element: 'LIGHT', disabled: false },
    { id: 'apocalypse', name: '아포칼립스', icon: '🌙', cooldown: 0, maxCooldown: 0, keyBinding: 'W', element: 'DARK', disabled: false },
    { id: 'absolute_kill', name: '앱솔루트 킬', icon: '⚡', cooldown: 2.5, maxCooldown: 10, keyBinding: 'E', element: 'EQUILIBRIUM', disabled: true },
    { id: 'door_of_truth', name: '진리의 문', icon: '🚪', cooldown: 0, maxCooldown: 0, keyBinding: 'R', element: 'EQUILIBRIUM', disabled: true },
    { id: 'baptism', name: '빛과 어둠의 세례', icon: '✨', cooldown: 15.2, maxCooldown: 30, keyBinding: 'A', element: 'EQUILIBRIUM', disabled: false },
    { id: 'nova', name: '트와일라잇 노바', icon: '💥', cooldown: 0, maxCooldown: 15, keyBinding: 'S', element: 'EQUILIBRIUM', disabled: false },
    { id: 'punishing', name: '퍼니싱 리소네이터', icon: '🎵', cooldown: 8.7, maxCooldown: 30, keyBinding: 'D', element: 'EQUILIBRIUM', disabled: false },
    { id: 'heroic_oath', name: '히어로즈 오쓰', icon: '🛡️', cooldown: 0, maxCooldown: 120, keyBinding: 'Z', element: 'BUFF', disabled: false },
  ]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setGameTime(0);
  };

  const handleSkillUse = (skillId: string) => {
    if (!isRunning) return;
    console.log(`스킬 사용: ${skillId}`);
    // Mock: 스킬 쿨타임 설정
    setSkills(prev => prev.map(skill => 
      skill.id === skillId 
        ? { ...skill, cooldown: skill.maxCooldown }
        : skill
    ));
  };

  return (
    <div className="manual-practice-panel">
      <div className="practice-header">
        <h1>🎮 Manual Practice</h1>
        <div className="practice-timer">
          시간: {Math.floor(gameTime / 60000)}:{String(Math.floor((gameTime % 60000) / 1000)).padStart(2, '0')}.{String(gameTime % 1000).padStart(3, '0')}
        </div>
      </div>

      <PracticeControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />

      <div className="practice-content">
        <div className="left-panel">
          <CharacterStatusViewer character={character} />
        </div>
        
        <div className="right-panel">
          <SkillBar 
            skills={skills}
            onSkillUse={handleSkillUse}
            isRunning={isRunning}
          />
        </div>
      </div>

      <KeyBindingPanel 
        skills={skills}
        onUpdateBinding={(skillId, newKey) => {
          setSkills(prev => prev.map(skill =>
            skill.id === skillId ? { ...skill, keyBinding: newKey } : skill
          ));
        }}
        isRunning={isRunning}
      />
    </div>
  );
};