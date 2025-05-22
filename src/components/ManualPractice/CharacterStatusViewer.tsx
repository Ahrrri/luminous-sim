// src/components/ManualPractice/CharacterStatusViewer.tsx
import React from 'react';

interface MockCharacterState {
  currentState: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
  lightGauge: number;
  darkGauge: number;
  totalDamage: number;
  activeBuffs: string[];
  equilibriumTimeLeft?: number;
}

interface CharacterStatusViewerProps {
  character: MockCharacterState;
}

export const CharacterStatusViewer: React.FC<CharacterStatusViewerProps> = ({
  character
}) => {
  const formatNumber = (num: number) => num.toLocaleString();
  
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'LIGHT': return '빛';
      case 'DARK': return '어둠';
      case 'EQUILIBRIUM': return '이퀼리브리엄';
      default: return state;
    }
  };

  return (
    <div className="character-status-viewer">
      <h3>캐릭터 상태</h3>
      
      <div className="current-state">
        <div className="state-info">
          <span className="state-label">현재 상태:</span>
          <span className={`state-value state-${character.currentState.toLowerCase()}`}>
            {getStateLabel(character.currentState)}
          </span>
          {character.equilibriumTimeLeft && (
            <span className="equilibrium-timer">
              ({character.equilibriumTimeLeft.toFixed(1)}초 남음)
            </span>
          )}
        </div>
      </div>

      <div className="gauge-container">
        <div className="gauge-item light-gauge">
          <div className="gauge-label">빛 게이지</div>
          <div className="gauge-bar">
            <div 
              className="gauge-fill light"
              style={{ width: `${(character.lightGauge / 10000) * 100}%` }}
            />
          </div>
          <div className="gauge-value">{character.lightGauge} / 10000</div>
        </div>

        <div className="gauge-item dark-gauge">
          <div className="gauge-label">어둠 게이지</div>
          <div className="gauge-bar">
            <div 
              className="gauge-fill dark"
              style={{ width: `${(character.darkGauge / 10000) * 100}%` }}
            />
          </div>
          <div className="gauge-value">{character.darkGauge} / 10000</div>
        </div>
      </div>

      <div className="damage-info">
        <div className="damage-label">총 데미지</div>
        <div className="damage-value">{formatNumber(character.totalDamage)}</div>
      </div>

      <div className="active-buffs">
        <div className="buffs-label">활성 버프</div>
        <div className="buffs-list">
          {character.activeBuffs.length > 0 ? (
            character.activeBuffs.map((buff, index) => (
              <span key={index} className="buff-chip">
                {buff}
              </span>
            ))
          ) : (
            <span className="no-buffs">없음</span>
          )}
        </div>
      </div>
    </div>
  );
};