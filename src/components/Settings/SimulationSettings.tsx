// src/components/Settings/SimulationSettings.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { resetSimulation } from '../../store/slices/simulationSlice';

// 일단 간단한 설정만 포함
const SimulationSettings: React.FC = () => {
  const dispatch = useDispatch();
  const simulation = useSelector((state: RootState) => state.simulation);
  
  const handleReset = () => {
    dispatch(resetSimulation());
  };
  
  return (
    <div className="simulation-settings">
      <h2>시뮬레이션 환경 설정</h2>
      
      <div className="settings-form">
        <h3>서버렉 시뮬레이션</h3>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={simulation.serverLagEnabled}
              disabled={simulation.isRunning}
              // 실제 애플리케이션에서는 여기에 이벤트 핸들러 추가
            />
            서버렉 시뮬레이션 활성화
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="serverLagProbability">서버렉 발생 확률:</label>
          <input 
            type="range" 
            id="serverLagProbability" 
            min="0" 
            max="1" 
            step="0.1" 
            value={simulation.serverLagProbability}
            disabled={simulation.isRunning || !simulation.serverLagEnabled}
            // 실제 애플리케이션에서는 여기에 이벤트 핸들러 추가
          />
          <span>{(simulation.serverLagProbability * 100).toFixed(0)}%</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="serverLagDuration">서버렉 최대 지속시간 (ms):</label>
          <input 
            type="number" 
            id="serverLagDuration" 
            min="0" 
            max="5000" 
            step="100" 
            value={simulation.serverLagDuration}
            disabled={simulation.isRunning || !simulation.serverLagEnabled}
            // 실제 애플리케이션에서는 여기에 이벤트 핸들러 추가
          />
        </div>
        
        <h3>기타 설정</h3>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={simulation.applyOneHitPerTarget}
              disabled={simulation.isRunning}
              // 실제 애플리케이션에서는 여기에 이벤트 핸들러 추가
            />
            한 적당 최대 한 번 충돌 적용
          </label>
        </div>
        
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={simulation.simulateBossOnly}
              disabled={simulation.isRunning}
              // 실제 애플리케이션에서는 여기에 이벤트 핸들러 추가
            />
            보스 전투만 시뮬레이션
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            onClick={handleReset}
            disabled={simulation.isRunning}
          >
            기본값으로 초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationSettings;