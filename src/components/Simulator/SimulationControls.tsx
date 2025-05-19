// src/components/Simulator/SimulationControls.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { startSimulation, pauseSimulation, resetSimulation } from '../../store/slices/simulationSlice';
import { resetResults } from '../../store/slices/resultsSlice';
import { SimulationEngine } from '../../engine/simulator';
// import { BasicPolicy, EquilibriumPriorityPolicy, BurstCyclePolicy, ContinuousRingPolicy, RealisticPlayerPolicy } from '../../engine/policies';
import { BasicPolicy } from '../../engine/policies';

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

  // handleStart 함수 수정
  const handleStart = () => {
    console.log("시작 버튼 클릭됨");

    // 기존 결과 초기화
    dispatch(resetResults());

    // 선택된 정책 생성
    let policy;
    switch (selectedPolicy) {
      // case 'equilibrium':
      //   policy = new EquilibriumPriorityPolicy();
      //   break;
      // case 'burst':
      //   policy = new BurstCyclePolicy();
      //   break;
      // case 'continuous':
      //   policy = new ContinuousRingPolicy();
      //   break;
      // case 'realistic':
      //   policy = new RealisticPlayerPolicy();
      //   break;
      default:
        policy = new BasicPolicy();
    }
    console.log("선택된 정책:", selectedPolicy);

    try {
      // 시뮬레이션 엔진 생성
      const characterCopy = JSON.parse(JSON.stringify(character));
      const simulationCopy = JSON.parse(JSON.stringify(simulation));

      const engine = new SimulationEngine(characterCopy, simulationCopy, policy);
      console.log("엔진 생성됨");

      // 이벤트 리스너 설정
      engine.setDamageListener((damage, skill, time) => {
        onDamage(damage, skill, time);
      });

      engine.setStateChangeListener((state, time) => {
        onStateChange(state, time);
      });

      engine.setBuffChangeListener((buffId, action, time) => {
        onBuffChange(buffId, action, time);
      });

      // 진행 상황 리스너 추가
      engine.setProgressListener((progress, currentTime, totalDamage) => {
        // 진행 상황 업데이트 (선택 사항)
        console.log(`진행 상황: ${(progress * 100).toFixed(1)}%, 시간: ${currentTime / 1000}초, 데미지: ${totalDamage}`);
      });

      // 완료 리스너 추가
      engine.setCompleteListener((totalDamage, duration) => {
        console.log(`시뮬레이션 완료: 총 데미지 ${totalDamage}, 지속 시간 ${duration / 1000}초`);
        // 시뮬레이션 상태 업데이트
        dispatch(pauseSimulation());
      });

      // 엔진 저장
      setSimulationEngine(engine);

      // 시뮬레이션 상태 업데이트
      dispatch(startSimulation());

      // 시뮬레이션 시작 (지속 시간 설정)
      engine.startSimulation(duration);
      console.log(`${duration}초 시뮬레이션 시작됨`);

    } catch (error) {
      console.error("시뮬레이션 시작 오류:", error);
      // 에러 발생 시 상태 초기화
      dispatch(pauseSimulation());
    }
  };

  // handlePause 함수 수정
  const handlePause = () => {
    if (simulationEngine) {
      simulationEngine.pauseSimulation();
      dispatch(pauseSimulation());
    }
  };

  // handleResume 함수 수정
  const handleResume = () => {
    if (simulationEngine) {
      simulationEngine.resumeSimulation(duration);
      dispatch(startSimulation());
    }
  };

  // handleReset 함수 수정
  const handleReset = () => {
    if (simulationEngine) {
      simulationEngine.stopSimulation();
      simulationEngine.terminate(); // Worker 종료
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