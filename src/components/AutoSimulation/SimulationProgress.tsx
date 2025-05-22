// src/components/AutoSimulation/SimulationProgress.tsx
import React, { useState } from 'react';

interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentEpisode: number;
  totalEpisodes: number;
  episodeProgress: number; // 현재 에피소드 진행률 (0-100)
  totalProgress: number; // 전체 진행률 (0-100)
  estimatedTimeLeft: number; // 남은 시간 (ms)
  averageEpisodeTime: number; // 평균 에피소드 시간 (ms)
  startTime?: number;
}

export const SimulationProgress: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    currentEpisode: 0,
    totalEpisodes: 100,
    episodeProgress: 0,
    totalProgress: 0,
    estimatedTimeLeft: 0,
    averageEpisodeTime: 0
  });

  const handleStart = () => {
    setSimState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: Date.now(),
      currentEpisode: 1,
      episodeProgress: 0,
      totalProgress: 0
    }));

    // Mock 시뮬레이션 진행
    simulateProgress();
  };

  const handlePause = () => {
    setSimState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const handleStop = () => {
    setSimState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentEpisode: 0,
      episodeProgress: 0,
      totalProgress: 0,
      estimatedTimeLeft: 0
    }));
  };

  const simulateProgress = () => {
    let episode = 1;
    const totalEpisodes = simState.totalEpisodes;
    
    const episodeInterval = setInterval(() => {
      setSimState(prev => {
        if (!prev.isRunning || prev.isPaused || episode > totalEpisodes) {
          clearInterval(episodeInterval);
          return {
            ...prev,
            isRunning: episode <= totalEpisodes,
            currentEpisode: episode > totalEpisodes ? totalEpisodes : episode,
            episodeProgress: 100,
            totalProgress: 100
          };
        }

        const totalProgress = ((episode - 1) / totalEpisodes) * 100;
        const episodeProgress = Math.random() * 100; // Mock progress
        const avgTime = 2000; // 2초per 에피소드
        const estimatedTimeLeft = (totalEpisodes - episode + 1) * avgTime;

        return {
          ...prev,
          currentEpisode: episode,
          episodeProgress,
          totalProgress,
          estimatedTimeLeft,
          averageEpisodeTime: avgTime
        };
      });

      episode++;
    }, 2000); // 2초마다 새 에피소드
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (!simState.isRunning) return '대기 중';
    if (simState.isPaused) return '일시정지';
    if (simState.totalProgress >= 100) return '완료';
    return `실행 중 (${simState.currentEpisode}/${simState.totalEpisodes})`;
  };

  const getStatusColor = () => {
    if (!simState.isRunning) return '#6b7280';
    if (simState.isPaused) return '#f59e0b';
    if (simState.totalProgress >= 100) return '#10b981';
    return '#3b82f6';
  };

  return (
    <div className="simulation-progress">
      <div className="progress-header">
        <h2>시뮬레이션 진행 상황</h2>
        <div 
          className="status-indicator"
          style={{ color: getStatusColor() }}
        >
          <span className="status-dot">●</span>
          {getStatusText()}
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-label">현재 에피소드</div>
          <div className="stat-value">
            {simState.currentEpisode} / {simState.totalEpisodes}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">전체 진행률</div>
          <div className="stat-value">{simState.totalProgress.toFixed(1)}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">예상 남은 시간</div>
          <div className="stat-value">
            {simState.estimatedTimeLeft > 0 ? formatTime(simState.estimatedTimeLeft) : '--:--'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">평균 에피소드 시간</div>
          <div className="stat-value">
            {simState.averageEpisodeTime > 0 ? formatTime(simState.averageEpisodeTime) : '--:--'}
          </div>
        </div>
      </div>

      <div className="progress-bars">
        <div className="progress-item">
          <div className="progress-label">
            <span>현재 에피소드 진행률</span>
            <span>{simState.episodeProgress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill episode"
              style={{ width: `${simState.episodeProgress}%` }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-label">
            <span>전체 진행률</span>
            <span>{simState.totalProgress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill total"
              style={{ width: `${simState.totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="progress-controls">
        {!simState.isRunning ? (
          <button 
            className="control-button start"
            onClick={handleStart}
          >
            <span className="button-icon">▶️</span>
            시뮬레이션 시작
          </button>
        ) : (
          <>
            <button 
              className="control-button pause"
              onClick={handlePause}
            >
              <span className="button-icon">{simState.isPaused ? '▶️' : '⏸️'}</span>
              {simState.isPaused ? '재개' : '일시정지'}
            </button>
            <button 
              className="control-button stop"
              onClick={handleStop}
            >
              <span className="button-icon">⏹️</span>
              중지
            </button>
          </>
        )}
      </div>

      {simState.totalProgress >= 100 && (
        <div className="completion-message">
          <div className="completion-icon">🎉</div>
          <div className="completion-text">
            <h3>시뮬레이션 완료!</h3>
            <p>결과 분석 탭에서 상세 결과를 확인하세요.</p>
          </div>
          <button className="view-results-button">
            결과 보기 →
          </button>
        </div>
      )}
    </div>
  );
};