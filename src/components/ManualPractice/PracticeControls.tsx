// src/components/ManualPractice/PracticeControls.tsx
import React from 'react';

interface PracticeControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const PracticeControls: React.FC<PracticeControlsProps> = ({
  isRunning,
  onStart,
  onPause,
  onReset
}) => {
  return (
    <div className="practice-controls">
      <div className="control-buttons">
        {!isRunning ? (
          <button className="control-button start" onClick={onStart}>
            <span className="button-icon">▶️</span>
            시작
          </button>
        ) : (
          <button className="control-button pause" onClick={onPause}>
            <span className="button-icon">⏸️</span>
            일시정지
          </button>
        )}
        
        <button className="control-button reset" onClick={onReset}>
          <span className="button-icon">🔄</span>
          초기화
        </button>
      </div>
      
      <div className="practice-status">
        <span className={`status-indicator ${isRunning ? 'running' : 'stopped'}`}>
          {isRunning ? '실행 중' : '대기 중'}
        </span>
      </div>
    </div>
  );
};