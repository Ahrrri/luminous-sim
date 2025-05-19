// src/App.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CharacterSettings from './components/Settings/CharacterSettings';
import SimulationSettings from './components/Settings/SimulationSettings';
import SimulationControls from './components/Simulator/SimulationControls';
import StateViewer from './components/Simulator/StateViewer';
import DamageChart from './components/Results/DamageChart';
import SkillBreakdown from './components/Results/SkillBreakdown';
import type { RootState } from './store';
import { addDamageSnapshot, addBuffEvent, addStateChange } from './store/slices/resultsSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const simulation = useSelector((state: RootState) => state.simulation);
  const [activeTab, setActiveTab] = useState<'settings' | 'simulator' | 'results'>('simulator');

  return (
    <div className="App">
      <header className="App-header">
        <h1>루미너스 DPS 시뮬레이터</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            설정
          </button>
          <button 
            className={activeTab === 'simulator' ? 'active' : ''} 
            onClick={() => setActiveTab('simulator')}
          >
            시뮬레이터
          </button>
          <button 
            className={activeTab === 'results' ? 'active' : ''} 
            onClick={() => setActiveTab('results')}
          >
            결과 분석
          </button>
        </div>
      </header>
      
      <div className="content">
        {activeTab === 'settings' && (
          <div className="settings-panel">
            <CharacterSettings />
            <SimulationSettings />
          </div>
        )}
        
        {activeTab === 'simulator' && (
          <div className="simulator-panel">
            <div className="simulator-layout">
              <div className="simulator-controls-container">
                <SimulationControls 
                  onDamage={(damage, skill, time) => 
                    dispatch(addDamageSnapshot({ damage, skill, time, state: simulation.characterState }))
                  }
                  onStateChange={(state, time) => 
                    dispatch(addStateChange({ time, state }))
                  }
                  onBuffChange={(buffId, action, time) => 
                    dispatch(addBuffEvent({ time, buffId, action }))
                  }
                />
              </div>
              <div className="state-viewer-container">
                <StateViewer />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'results' && (
          <div className="results-panel">
            <DamageChart />
            <SkillBreakdown />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;