// src/App.tsx 수정
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CharacterSettings from './components/Settings/CharacterSettings';
import SimulationSettings from './components/Settings/SimulationSettings';
import SimulationControls from './components/Simulator/SimulationControls';
import StateViewer from './components/Simulator/StateViewer';
import DamageChart from './components/Results/DamageChart';
import SkillBreakdown from './components/Results/SkillBreakdown';
import VerticalTimelineChart from './components/Results/VerticalTimelineChart'; // 추가
import type { RootState } from './store';
import { addDamageSnapshot, addBuffEvent, addStateChange } from './store/slices/resultsSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const simulation = useSelector((state: RootState) => state.simulation);
  const [activeTab, setActiveTab] = useState<'settings' | 'simulator' | 'results'>('simulator');

  // 이벤트 핸들러 함수 수정
  const handleDamage = (damage: number, skill: string, time: number) => {
    try {
      dispatch(addDamageSnapshot({
        damage,
        skill,
        time,
        state: simulation.characterState
      }));
    } catch (error) {
      console.error("데미지 처리 중 오류:", error);
    }
  };

  const handleStateChange = (state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM', time: number) => {
    try {
      dispatch(addStateChange({ time, state }));
    } catch (error) {
      console.error("상태 변경 처리 중 오류:", error);
    }
  };

  const handleBuffChange = (buffId: string, action: 'APPLIED' | 'EXPIRED', time: number) => {
    try {
      dispatch(addBuffEvent({ time, buffId, action }));
    } catch (error) {
      console.error("버프 변경 처리 중 오류:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>엄</h1>
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
                  onDamage={handleDamage}
                  onStateChange={handleStateChange}
                  onBuffChange={handleBuffChange}
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
            <VerticalTimelineChart />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;