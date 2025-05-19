// src/App.tsx
import React from 'react';
import CharacterSettings from './components/Settings/CharacterSettings';
import SimulationSettings from './components/Settings/SimulationSettings';
import SimulationControls from './components/Simulator/SimulationControls';
import StateViewer from './components/Simulator/StateViewer';
import DamageChart from './components/Results/DamageChart';
import SkillBreakdown from './components/Results/SkillBreakdown';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>루미너스 DPS 시뮬레이터</h1>
      </header>
      
      <div className="content">
        <div className="settings-panel">
          <CharacterSettings />
          <SimulationSettings />
        </div>
        
        <div className="simulator-panel">
          <SimulationControls />
          <StateViewer />
        </div>
        
        <div className="results-panel">
          <DamageChart />
          <SkillBreakdown />
        </div>
      </div>
    </div>
  );
}

export default App;