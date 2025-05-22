// src/components/AutoSimulation/AutoSimulationPanel.tsx
import React from 'react';
import { StrategySelector } from './StrategySelector';
import { StrategyVisualizer } from './StrategyVisualizer';
import { SimulationProgress } from './SimulationProgress';
import './AutoSimulationPanel.css';

export const AutoSimulationPanel: React.FC = () => {
  return (
    <div className="auto-simulation-panel">
      <div className="auto-simulation-layout">
        <div className="left-column">
          <StrategySelector />
        </div>
        <div className="center-column">
          <StrategyVisualizer />
        </div>
        <div className="right-column">
          <SimulationProgress />
        </div>
      </div>
    </div>
  );
};