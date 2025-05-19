// src/components/Settings/SimulationSettings.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { updateSimulation, resetSimulation } from '../../store/slices/simulationSlice';

const SimulationSettings: React.FC = () => {
  const dispatch = useDispatch();
  const simulation = useSelector((state: RootState) => state.simulation);
  
  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    dispatch(updateSimulation({ [name]: checked }));
  };
  
  // 숫자 입력 핸들러
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      dispatch(updateSimulation({ [name]: numValue }));
    }
  };
  
  // 초기화 핸들러
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
              name="serverLagEnabled"
              checked={simulation.serverLagEnabled}
              onChange={handleCheckboxChange}
              disabled={simulation.isRunning}
            />
            서버렉 시뮬레이션 활성화
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="serverLagProbability">서버렉 발생 확률:</label>
          <input 
            type="range" 
            id="serverLagProbability" 
            name="serverLagProbability"
            min="0" 
            max="1" 
            step="0.1" 
            value={simulation.serverLagProbability}
            onChange={handleNumberChange}
            disabled={simulation.isRunning || !simulation.serverLagEnabled}
          />
          <span>{(simulation.serverLagProbability * 100).toFixed(0)}%</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="serverLagDuration">서버렉 최대 지속시간 (ms):</label>
          <input 
            type="number" 
            id="serverLagDuration" 
            name="serverLagDuration"
            min="0" 
            max="5000" 
            step="100" 
            value={simulation.serverLagDuration}
            onChange={handleNumberChange}
            disabled={simulation.isRunning || !simulation.serverLagEnabled}
          />
        </div>
        
        <h3>기타 설정</h3>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              name="applyOneHitPerTarget"
              checked={simulation.applyOneHitPerTarget}
              onChange={handleCheckboxChange}
              disabled={simulation.isRunning}
            />
            한 적당 최대 한 번 충돌 적용
          </label>
        </div>
        
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              name="simulateBossOnly"
              checked={simulation.simulateBossOnly}
              onChange={handleCheckboxChange}
              disabled={simulation.isRunning}
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