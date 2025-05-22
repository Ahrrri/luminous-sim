// src/components/Results/SimulationPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';

interface DamageSnapshot {
  time: number;
  damage: number;
  skill: string;
  cumulativeDamage: number;
}

interface BuffEvent {
  time: number;
  buffId: string;
  action: 'APPLIED' | 'EXPIRED';
}

interface StateEvent {
  time: number;
  state: 'LIGHT' | 'DARK' | 'EQUILIBRIUM';
}

interface SimulationPlayerProps {
  damageTimeline: DamageSnapshot[];
  buffsTimeline: BuffEvent[];
  stateTimeline: StateEvent[];
  maxTime: number;
}

export const SimulationPlayer: React.FC<SimulationPlayerProps> = ({
  damageTimeline,
  buffsTimeline,
  stateTimeline,
  maxTime
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // 현재 시간의 상태 계산
  const getCurrentState = () => {
    const currentStateEvent = stateTimeline
      .filter(event => event.time <= currentTime)
      .sort((a, b) => b.time - a.time)[0];
    return currentStateEvent?.state || 'LIGHT';
  };

  const getCurrentDamage = () => {
    const currentEvents = damageTimeline.filter(event => event.time <= currentTime);
    return currentEvents.length > 0 ? currentEvents[currentEvents.length - 1].cumulativeDamage : 0;
  };

  const getActiveBuffs = () => {
    const activeBuffs: string[] = [];
    const buffEvents = buffsTimeline.filter(event => event.time <= currentTime);
    
    // 버프 상태 계산
    const buffStatus: Record<string, boolean> = {};
    buffEvents.forEach(event => {
      if (event.action === 'APPLIED') {
        buffStatus[event.buffId] = true;
      } else if (event.action === 'EXPIRED') {
        buffStatus[event.buffId] = false;
      }
    });

    Object.entries(buffStatus).forEach(([buffId, isActive]) => {
      if (isActive) activeBuffs.push(buffId);
    });

    return activeBuffs;
  };

  const getRecentSkills = () => {
    const recentEvents = damageTimeline
      .filter(event => event.time <= currentTime && event.time >= currentTime - 10000) // 최근 10초
      .slice(-5); // 최대 5개
    return recentEvents.reverse();
  };

  // 재생/일시정지
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 처음부터 재생
  const restart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // 시간 슬라이더 변경
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  // 재생 속도 변경
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackSpeed(Number(e.target.value));
  };

  // 재생 효과
  useEffect(() => {
    if (isPlaying && currentTime < maxTime) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = prev + (100 * playbackSpeed); // 100ms씩 진행
          if (nextTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return nextTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTime, maxTime, playbackSpeed]);

  const currentState = getCurrentState();
  const currentDamage = getCurrentDamage();
  const activeBuffs = getActiveBuffs();
  const recentSkills = getRecentSkills();

  return (
    <div className="simulation-player">
      <div className="player-header">
        <h3>시뮬레이션 플레이어</h3>
        <div className="player-time">
          {formatTime(currentTime)} / {formatTime(maxTime)}
        </div>
      </div>

      <div className="player-timeline" ref={timelineRef}>
        <div className="timeline-track">
          {/* 상태 변화 표시 */}
          {stateTimeline.map((stateEvent, index) => {
            const nextEvent = stateTimeline[index + 1];
            const width = nextEvent 
              ? ((nextEvent.time - stateEvent.time) / maxTime) * 100
              : ((maxTime - stateEvent.time) / maxTime) * 100;
            
            return (
              <div
                key={index}
                className={`state-segment state-${stateEvent.state.toLowerCase()}`}
                style={{
                  left: `${(stateEvent.time / maxTime) * 100}%`,
                  width: `${width}%`
                }}
              />
            );
          })}

          {/* 버프 이벤트 표시 */}
          {buffsTimeline.filter(e => e.action === 'APPLIED').map((buffEvent, index) => (
            <div
              key={index}
              className="buff-marker"
              style={{ left: `${(buffEvent.time / maxTime) * 100}%` }}
              title={`${buffEvent.buffId} 적용 - ${formatTime(buffEvent.time)}`}
            />
          ))}

          {/* 스킬 사용 표시 */}
          {damageTimeline.filter((_, i) => i % 10 === 0).map((event, index) => (
            <div
              key={index}
              className="skill-marker"
              style={{ left: `${(event.time / maxTime) * 100}%` }}
              title={`${event.skill} - ${formatNumber(event.damage)}`}
            />
          ))}

          {/* 재생 헤드 */}
          <div
            className="playhead"
            style={{ left: `${(currentTime / maxTime) * 100}%` }}
          />
        </div>

        <input
          type="range"
          className="timeline-slider"
          min="0"
          max={maxTime}
          value={currentTime}
          onChange={handleTimeChange}
        />
      </div>

      <div className="player-controls">
        <button className="control-btn restart" onClick={restart}>
          <span>⏮️</span>
          처음부터
        </button>
        
        <button className="control-btn play-pause" onClick={togglePlay}>
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          {isPlaying ? '일시정지' : '재생'}
        </button>

        <div className="speed-control">
          <label>속도:</label>
          <select value={playbackSpeed} onChange={handleSpeedChange}>
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
            <option value="8">8x</option>
          </select>
        </div>
      </div>

      <div className="player-status">
        <div className="status-left">
          <div className="current-state">
            <span className="status-label">현재 상태:</span>
            <span className={`status-value state-${currentState.toLowerCase()}`}>
              {currentState === 'LIGHT' ? '빛' : 
               currentState === 'DARK' ? '어둠' : '이퀼리브리엄'}
            </span>
          </div>

          <div className="current-damage">
            <span className="status-label">누적 데미지:</span>
            <span className="status-value">{formatNumber(currentDamage)}</span>
          </div>

          <div className="active-buffs">
            <span className="status-label">활성 버프:</span>
            <div className="buffs-list">
              {activeBuffs.length > 0 ? (
                activeBuffs.map((buff, index) => (
                  <span key={index} className="buff-chip">{buff}</span>
                ))
              ) : (
                <span className="no-buffs">없음</span>
              )}
            </div>
          </div>
        </div>

        <div className="status-right">
          <div className="recent-skills">
            <div className="status-label">최근 스킬:</div>
            <div className="skills-list">
              {recentSkills.map((skill, index) => (
                <div key={index} className="recent-skill">
                  <span className="skill-name">{skill.skill}</span>
                  <span className="skill-damage">{formatNumber(skill.damage)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};