// src/components/AutoSimulation/StrategySelector.tsx
import React, { useState } from 'react';

export type StrategyType = 'basic' | 'equilibrium' | 'burst' | 'continuous' | 'realistic';

interface Strategy {
  id: StrategyType;
  name: string;
  description: string;
  icon: string;
  priority: string[];
  conditions: string[];
}

const strategies: Strategy[] = [
  {
    id: 'basic',
    name: '기본 전략',
    description: '쿨타임이 돌아온 스킬을 우선순위에 따라 사용',
    icon: '🎯',
    priority: ['하모닉 패러독스', '오쓰/메용2', '세례', '트노바', '퍼니싱'],
    conditions: ['쿨타임 완료', '상태별 스킬 선택']
  },
  {
    id: 'equilibrium',
    name: '이퀼 우선 전략',
    description: '이퀼리브리엄 상태를 최대한 활용하는 전략',
    icon: '⚖️',
    priority: ['이퀼 진입 우선', '앱킬 연타', '진리의 문', '고데미지 스킬'],
    conditions: ['이퀼 상태 유지', '게이지 효율 관리']
  },
  {
    id: 'burst',
    name: '2분 극딜 전략',
    description: '2분 주기 버프에 맞춘 극딜 사이클',
    icon: '💥',
    priority: ['오쓰+메용2 동시', '오브 활성화', '하모닉 패러독스', '이퀼 극딜'],
    conditions: ['2분 주기 타이밍', '극딜 윈도우 집중']
  },
  {
    id: 'continuous',
    name: '컨티링 효율 전략',
    description: '컨티뉴어스 링 활성화에 맞춘 딜링',
    icon: '🔄',
    priority: ['컨티 활성화시 고딜', '컨티 대기시 게이지 충전', '메모라이즈 활용'],
    conditions: ['컨티 사이클 추적', '상태별 차등 딜링']
  },
  {
    id: 'realistic',
    name: '현실적 플레이어',
    description: '인간 반응시간과 실수를 포함한 시뮬레이션',
    icon: '👤',
    priority: ['반응시간 지연', '스킬 큐잉', '실수 확률'],
    conditions: ['인간적 반응속도', '판단 오류 포함']
  }
];

interface StrategySelectorProps {
  selectedStrategy?: StrategyType;
  onStrategyChange?: (strategy: StrategyType) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy = 'basic',
  onStrategyChange
}) => {
  const [selected, setSelected] = useState<StrategyType>(selectedStrategy);

  const handleSelect = (strategyId: StrategyType) => {
    setSelected(strategyId);
    onStrategyChange?.(strategyId);
  };

  return (
    <div className="strategy-selector">
      <div className="selector-header">
        <h2>딜링 전략 선택</h2>
        <p>시뮬레이션에 사용할 전략을 선택하세요</p>
      </div>

      <div className="strategy-grid">
        {strategies.map(strategy => (
          <div
            key={strategy.id}
            className={`strategy-card ${selected === strategy.id ? 'selected' : ''}`}
            onClick={() => handleSelect(strategy.id)}
          >
            <div className="strategy-icon">{strategy.icon}</div>
            <div className="strategy-content">
              <h3 className="strategy-name">{strategy.name}</h3>
              <p className="strategy-description">{strategy.description}</p>
            </div>
            <div className="strategy-selection-indicator">
              {selected === strategy.id && <span className="check-mark">✓</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="simulation-settings">
        <h3>시뮬레이션 설정</h3>
        <div className="settings-row">
          <div className="setting-item">
            <label>에피소드 수</label>
            <select defaultValue="100">
              <option value="10">10회</option>
              <option value="50">50회</option>
              <option value="100">100회</option>
              <option value="500">500회</option>
              <option value="1000">1000회</option>
            </select>
          </div>
          <div className="setting-item">
            <label>에피소드 길이</label>
            <select defaultValue="300">
              <option value="60">1분</option>
              <option value="180">3분</option>
              <option value="300">5분</option>
              <option value="600">10분</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// 전략 데이터 export
export { strategies };