// src/components/Simulator/SimulationControls.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { startSimulation, pauseSimulation, resetSimulation } from '../../store/slices/simulationSlice';
import { resetResults } from '../../store/slices/resultsSlice';
import { SimulationEngine } from '../../engine/simulator';
import { BasicPolicy, EquilibriumPriorityPolicy, BurstCyclePolicy, ContinuousRingPolicy, RealisticPlayerPolicy } from '../../engine/policies';

interface SimulationControlsProps {
  onDamage: (damage: number, skill: string, time: number) => void;
  onStateChange: (state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM', time: number) => void;
  onBuffChange: (buffId: string, action: 'APPLIED' | 'EXPIRED', time: number) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  onDamage, 
  onStateChange, 
  onBuffChange 
}) => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const simulation = useSelector((state: RootState) => state.simulation);
  const [simulationEngine, setSimulationEngine] = useState<SimulationEngine | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string>('basic');
  const [duration, setDuration] = useState<number>(300); // 5분 기본값
  
  // 시뮬레이션 시작
  const handleStart = () => {
    // 기존 결과 초기화
    dispatch(resetResults());
    
    // 선택된 정책 생성
    let policy;
    switch (selectedPolicy) {
      case 'equilibrium':
        policy = new EquilibriumPriorityPolicy();
        break;
      case 'burst':
        policy = new BurstCyclePolicy();
        break;
      case 'continuous':
        policy = new ContinuousRingPolicy();
        break;
      case 'realistic':
        policy = new RealisticPlayerPolicy();
        break;
      default:
        policy = new BasicPolicy();
    }
    
    // 시뮬레이션 엔진 생성 및 이벤트 리스너 설정
    const engine = new SimulationEngine(character, simulation, policy);
    
    // 데미지 이벤트 리스너
    engine.setDamageListener((damage, skill, time) => {
      onDamage(damage, skill, time);
    });
    
    // 상태 변경 이벤트 리스너
    engine.setStateChangeListener((state, time) => {
      onStateChange(state, time);
    });
    
    // 버프 변경 이벤트 리스너
    engine.setBuffChangeListener((buffId, action, time) => {
      onBuffChange(buffId, action, time);
    });
    
    // 엔진 저장 및 시작
    setSimulationEngine(engine);
    engine.startSimulation();
    
    // 시뮬레이션 상태 업데이트
    dispatch(startSimulation());
    
    // 설정한 시간 후에 자동으로 시뮬레이션 중지
    setTimeout(() => {
      if (engine) {
        engine.pauseSimulation();
        dispatch(pauseSimulation());
      }
    }, duration * 1000);
  };
  
  // 시뮬레이션 일시정지
  const handlePause = () => {
    if (simulationEngine) {
      simulationEngine.pauseSimulation();
      dispatch(pauseSimulation());
    }
  };
  
  // 시뮬레이션 재개
  const handleResume = () => {
    if (simulationEngine) {
      simulationEngine.startSimulation();
      dispatch(startSimulation());
    }
  };
  
  // 시뮬레이션 리셋
  const handleReset = () => {
    if (simulationEngine) {
      simulationEngine.stopSimulation();
    }
    
    setSimulationEngine(null);
    dispatch(resetSimulation());
    dispatch(resetResults());
  };
  
  return (
    <div className="simulation-controls">
      <h2>시뮬레이션 설정</h2>
      
      <div className="policy-selector">
        <label htmlFor="policy-select">딜링 전략:</label>
        <select 
          id="policy-select"
          value={selectedPolicy}
          onChange={(e) => setSelectedPolicy(e.target.value)}
          disabled={simulation.isRunning}
        >
          <option value="basic">기본 전략</option>
          <option value="equilibrium">이퀼 우선 전략</option>
          <option value="burst">2분 주기 극딜 전략</option>
          <option value="continuous">컨티링 효율 전략</option>
          <option value="realistic">현실적 플레이어 시뮬레이션</option>
        </select>
      </div>
      
      <div className="control-buttons">
        {!simulation.isRunning ? (
          <button 
            className="start-button"
            onClick={handleStart}
            disabled={simulationEngine !== null && simulation.isRunning}
          >
            시작
          </button>
        ) : (
          <button 
            className="pause-button"
            onClick={handlePause}
          >
            일시정지
          </button>
        )}
        
        {simulationEngine !== null && !simulation.isRunning && (
          <button 
            className="resume-button"
            onClick={handleResume}
          >
            재개
          </button>
        )}
        
        <button 
          className="reset-button"
          onClick={handleReset}
          disabled={simulationEngine === null}
        >
          초기화
        </button>
      </div>
      
      <div className="simulation-duration">
        <label htmlFor="duration-input">시뮬레이션 시간 (초):</label>
        <input 
          id="duration-input"
          type="number" 
          min="10"
          max="600"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
          disabled={simulation.isRunning}
        />
      </div>
    </div>
  );
};

export default SimulationControls;