// src/components/AutoSimulation/StrategyVisualizer.tsx
import React from 'react';
import { strategies, type StrategyType } from './StrategySelector';

interface StrategyVisualizerProps {
  selectedStrategy?: StrategyType;
}

export const StrategyVisualizer: React.FC<StrategyVisualizerProps> = ({
  selectedStrategy = 'basic'
}) => {
  const strategy = strategies.find(s => s.id === selectedStrategy);

  if (!strategy) return null;

  return (
    <div className="strategy-visualizer">
      <div className="visualizer-header">
        <h2>전략 구조</h2>
        <div className="strategy-title">
          <span className="strategy-icon-large">{strategy.icon}</span>
          <span className="strategy-name-large">{strategy.name}</span>
        </div>
      </div>

      <div className="strategy-flow">
        <div className="flow-section">
          <h3>우선순위</h3>
          <div className="priority-list">
            {strategy.priority.map((item, index) => (
              <div key={index} className="priority-item">
                <div className="priority-number">{index + 1}</div>
                <div className="priority-content">{item}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flow-section">
          <h3>판단 조건</h3>
          <div className="conditions-list">
            {strategy.conditions.map((condition, index) => (
              <div key={index} className="condition-item">
                <div className="condition-icon">⚡</div>
                <div className="condition-content">{condition}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flow-section">
          <h3>전략 흐름도</h3>
          <div className="strategy-flowchart">
            <div className="flowchart-node start">시작</div>
            <div className="flowchart-arrow">↓</div>
            <div className="flowchart-node decision">스킬 사용 가능?</div>
            <div className="flowchart-branch">
              <div className="branch-yes">
                <span className="branch-label">Yes</span>
                <div className="flowchart-arrow">↓</div>
                <div className="flowchart-node action">우선순위 스킬 사용</div>
              </div>
              <div className="branch-no">
                <span className="branch-label">No</span>
                <div className="flowchart-arrow">↓</div>
                <div className="flowchart-node action">대기</div>
              </div>
            </div>
            <div className="flowchart-arrow">↓</div>
            <div className="flowchart-node end">반복</div>
          </div>
        </div>
      </div>
    </div>
  );
};