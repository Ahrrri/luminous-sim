// src/components/Simulator/StateViewer.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatNumber, formatTime } from '../../utils/helpers';

const StateViewer: React.FC = () => {
  const character = useSelector((state: RootState) => state.character);
  const simulation = useSelector((state: RootState) => state.simulation);
  
  // 게이지 퍼센트 계산
  const lightGaugePercent = (character.lightGauge / 10000) * 100;
  const darkGaugePercent = (character.darkGauge / 10000) * 100;
  
  // 이퀼 남은 시간 계산
  const remainingEquilibriumTime = character.equilibriumEndTime 
    ? Math.max(0, character.equilibriumEndTime - simulation.currentTime)
    : 0;
  
  return (
    <div className="state-viewer">
      <h2>현재 상태</h2>
      
      <div className="state-info">
        <div className="current-state">
          <span>상태: </span>
          <span className={`state-label ${character.currentState.toLowerCase()}`}>
            {character.currentState === 'LIGHT' ? '빛' : 
             character.currentState === 'DARK' ? '어둠' : '이퀼리브리엄'}
          </span>
          
          {character.currentState === 'EQUILIBRIUM' && (
            <span className="equilibrium-time">
              {formatTime(remainingEquilibriumTime)} 남음
            </span>
          )}
        </div>
        
        <div className="gauge-container">
          <div className="light-gauge">
            <span>빛 게이지:</span>
            <div className="gauge-bar">
              <div 
                className="gauge-fill light"
                style={{ width: `${lightGaugePercent}%` }}
              ></div>
            </div>
            <span>{character.lightGauge} / 10000</span>
          </div>
          
          <div className="dark-gauge">
            <span>어둠 게이지:</span>
            <div className="gauge-bar">
              <div 
                className="gauge-fill dark"
                style={{ width: `${darkGaugePercent}%` }}
              ></div>
            </div>
            <span>{character.darkGauge} / 10000</span>
          </div>
        </div>
      </div>
      
      <div className="damage-info">
        <div>총 데미지: {formatNumber(simulation.totalDamage)}</div>
        <div>DPS: {formatNumber(simulation.totalDamage / (simulation.currentTime / 1000))}</div>
        <div>경과 시간: {formatTime(simulation.currentTime)}</div>
      </div>
      
      <div className="continuous-info">
        <div>
          컨티뉴어스 링: 
          <span className={character.isContinuousActive ? 'active' : 'inactive'}>
            {character.isContinuousActive ? '활성' : '비활성'}
          </span>
        </div>
      </div>
      
      <div className="active-buffs">
        <h3>활성 버프</h3>
        <ul>
          {simulation.activeBuffs.map(buff => (
            <li key={buff.id}>
              {buff.name}
              {buff.endTime && (
                <span> ({formatTime(Math.max(0, buff.endTime - simulation.currentTime))} 남음)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StateViewer;