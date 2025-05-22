// src/components/Results/ResultsPanel.tsx
import React, { useState } from 'react';
import { DamageChart } from './DamageChart';
import { SkillBreakdown } from './SkillBreakdown';
import { SimulationPlayer } from './SimulationPlayer';
import { SimulationLog } from './SimulationLog';
import './ResultsPanel.css';

// Mock 데이터 타입들
interface DamageSnapshot {
  time: number;
  damage: number;
  skill: string;
  cumulativeDamage: number;
}

interface SkillUsage {
  skillId: string;
  skillName: string;
  count: number;
  totalDamage: number;
  percentage: number;
}

interface BuffEvent {
  time: number;
  buffId: string;
  action: 'APPLIED' | 'EXPIRED';
}

interface StateEvent {
  time: number;
  state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
}

export const ResultsPanel: React.FC = () => {
  // Mock 데이터
  const [mockData] = useState({
    totalDamage: 1234567890,
    totalDPS: 12345678,
    duration: 300000, // 5분
    damageTimeline: [
      { time: 1000, damage: 15000000, skill: 'reflection', cumulativeDamage: 15000000 },
      { time: 2000, damage: 25000000, skill: 'nova', cumulativeDamage: 40000000 },
      { time: 3500, damage: 35000000, skill: 'absolute_kill', cumulativeDamage: 75000000 },
      // ... 더 많은 데이터
    ] as DamageSnapshot[],
    skillUsage: [
      { skillId: 'absolute_kill', skillName: '앱솔루트 킬', count: 45, totalDamage: 450000000, percentage: 36.5 },
      { skillId: 'nova', skillName: '트와일라잇 노바', count: 20, totalDamage: 300000000, percentage: 24.3 },
      { skillId: 'reflection', skillName: '라이트 리플렉션', count: 120, totalDamage: 180000000, percentage: 14.6 },
      { skillId: 'baptism', skillName: '빛과 어둠의 세례', count: 8, totalDamage: 160000000, percentage: 13.0 },
      { skillId: 'apocalypse', skillName: '아포칼립스', count: 85, totalDamage: 144567890, percentage: 11.6 },
    ] as SkillUsage[],
    buffsTimeline: [
      { time: 5000, buffId: '오쓰', action: 'APPLIED' as const },
      { time: 5100, buffId: '메용2', action: 'APPLIED' as const },
      { time: 65000, buffId: '오쓰', action: 'EXPIRED' as const },
      // ... 더 많은 버프 이벤트
    ] as BuffEvent[],
    stateTimeline: [
      { time: 0, state: 'LIGHT' as const },
      { time: 15000, state: 'EQUILIBRIUM' as const },
      { time: 55000, state: 'DARK' as const },
      // ... 더 많은 상태 변화
    ] as StateEvent[]
  });

  const formatNumber = (num: number) => num.toLocaleString();
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="results-panel">
      <div className="results-header">
        <h1>📊 Results Analysis</h1>
        <div className="results-summary">
          <div className="summary-item">
            <span className="summary-label">총 데미지:</span>
            <span className="summary-value damage">{formatNumber(mockData.totalDamage)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">DPS:</span>
            <span className="summary-value dps">{formatNumber(mockData.totalDPS)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">시뮬레이션 시간:</span>
            <span className="summary-value time">{formatTime(mockData.duration)}</span>
          </div>
        </div>
      </div>

      <div className="results-content">
        <div className="results-grid">
          <div className="chart-section">
            <DamageChart 
              damageTimeline={mockData.damageTimeline}
              totalDamage={mockData.totalDamage}
              duration={mockData.duration}
            />
          </div>
          
          <div className="breakdown-section">
            <SkillBreakdown skillUsage={mockData.skillUsage} />
          </div>
          
          <div className="player-section">
            <SimulationPlayer 
              damageTimeline={mockData.damageTimeline}
              buffsTimeline={mockData.buffsTimeline}
              stateTimeline={mockData.stateTimeline}
              maxTime={mockData.duration}
            />
          </div>
          
          <div className="log-section">
            <SimulationLog 
              damageTimeline={mockData.damageTimeline}
              buffsTimeline={mockData.buffsTimeline}
              stateTimeline={mockData.stateTimeline}
            />
          </div>
        </div>
      </div>
    </div>
  );
};