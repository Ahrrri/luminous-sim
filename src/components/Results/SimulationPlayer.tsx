// src/components/Results/SimulationPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatTime, formatNumber, formatTimeWithMs } from '../../utils/helpers';
import { skills } from '../../models/skills';
import './simulationPlayer.css';

const SimulationPlayer: React.FC = () => {
  const { damageTimeline, stateTimeline, buffsTimeline } = useSelector(
    (state: RootState) => state.results
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timelineWidth, setTimelineWidth] = useState(1000);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  // 모든 이벤트 시간을 합쳐서 최대 시간 찾기
  const allEvents = [
    ...damageTimeline,
    ...stateTimeline,
    ...buffsTimeline
  ];
  const maxTime = allEvents.length > 0
    ? Math.max(...allEvents.map(event => 'time' in event ? event.time : 0))
    : 60000; // 기본값 1분

  // 타임라인 너비 업데이트
  useEffect(() => {
    const updateTimelineWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.clientWidth - 40); // 여백 고려
      }
    };

    updateTimelineWidth();
    window.addEventListener('resize', updateTimelineWidth);

    return () => {
      window.removeEventListener('resize', updateTimelineWidth);
    };
  }, []);

  // 애니메이션 프레임 핸들러
  const animationStep = (timestamp: number) => {
    if (lastFrameTimeRef.current === null) {
      lastFrameTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animationStep);
      return;
    }

    const deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    // 현재 시간 업데이트 (재생 속도 적용)
    let newTime = currentTime + deltaTime * playbackSpeed;

    // 끝에 도달하면 재생 중지
    if (newTime >= maxTime) {
      newTime = maxTime;
      setIsPlaying(false);
    }

    setCurrentTime(newTime);

    if (isPlaying && newTime < maxTime) {
      animationRef.current = requestAnimationFrame(animationStep);
    } else {
      animationRef.current = null;
    }
  };

  // 재생/일시정지 상태 변경 시 애니메이션 프레임 설정
  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animationStep);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed]);

  // 재생 컨트롤 핸들러
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackSpeed(parseFloat(e.target.value));
  };

  // 시간 위치를 픽셀로 변환
  const timeToPosition = (time: number) => {
    return (time / maxTime) * timelineWidth;
  };

  // 현재 시간까지의 이벤트 필터링
  const currentDamageEvents = damageTimeline.filter(
    event => event.time <= currentTime
  );

  const currentStateEvent = stateTimeline
    .filter(event => event.time <= currentTime)
    .sort((a, b) => b.time - a.time)[0];

  const currentBuffs = buffsTimeline
    .filter(event => event.time <= currentTime)
    .reduce((active, event) => {
      if (event.action === 'APPLIED') {
        active[event.buffId] = true;
      } else if (event.action === 'EXPIRED') {
        delete active[event.buffId];
      }
      return active;
    }, {} as Record<string, boolean>);

  // 현재 누적 데미지 계산
  const currentTotalDamage = currentDamageEvents.reduce(
    (sum, event) => sum + event.damage, 0
  );

  // 최근 스킬 목록 (최대 5개)
  const recentSkills = currentDamageEvents.slice(-5).reverse();

  return (
    <div className="simulation-player">
      <div className="player-header">
        <h2>시뮬레이션 플레이어</h2>
        <div className="player-time">
          {formatTimeWithMs(currentTime)} / {formatTimeWithMs(maxTime)}
        </div>
      </div>

      <div className="player-timeline" ref={timelineRef}>
        <div className="timeline-background">
          {/* 시간 마커 (30초 간격) */}
          {Array.from({ length: Math.ceil(maxTime / 30000) }).map((_, index) => {
            const markerTime = index * 30000;
            return (
              <div
                key={`marker-${index}`}
                className="time-marker"
                style={{ left: `${timeToPosition(markerTime)}px` }}
              >
                <div className="marker-line"></div>
                <div className="marker-label">{formatTimeWithMs(markerTime)}</div>
              </div>
            );
          })}

          {/* 상태 변화 표시 */}
          {stateTimeline.map((stateEvent, index) => {
            const nextEvent = stateTimeline[index + 1];
            const eventWidth = nextEvent
              ? timeToPosition(nextEvent.time) - timeToPosition(stateEvent.time)
              : timeToPosition(maxTime) - timeToPosition(stateEvent.time);

            return (
              <div
                key={`state-${index}`}
                className={`state-period state-${stateEvent.state.toLowerCase()}`}
                style={{
                  left: `${timeToPosition(stateEvent.time)}px`,
                  width: `${eventWidth}px`
                }}
              ></div>
            );
          })}

          {/* 버프 표시 */}
          {buffsTimeline
            .filter(event => event.action === 'APPLIED')
            .map((buffStart, index) => {
              const buffEnd = buffsTimeline.find(
                e => e.buffId === buffStart.buffId &&
                  e.action === 'EXPIRED' &&
                  e.time > buffStart.time
              );

              const endTime = buffEnd ? buffEnd.time : maxTime;
              const buffWidth = timeToPosition(endTime) - timeToPosition(buffStart.time);

              return (
                <div
                  key={`buff-${index}`}
                  className={`buff-period buff-${buffStart.buffId.toLowerCase()}`}
                  style={{
                    left: `${timeToPosition(buffStart.time)}px`,
                    width: `${buffWidth}px`,
                    top: `${20 + (index % 5) * 4}px` // 버프들을 겹치지 않게 배치
                  }}
                  title={`${buffStart.buffId}: ${formatTimeWithMs(buffStart.time)} - ${formatTimeWithMs(endTime)}`}
                ></div>
              );
            })}

          {/* 스킬 사용 표시 */}
          {damageTimeline.map((event, index) => (
            <div
              key={`skill-${index}`}
              className="skill-event"
              style={{
                left: `${timeToPosition(event.time)}px`
              }}
              title={`${skills[event.skill]?.name || event.skill}: ${formatNumber(event.damage)}`}
            ></div>
          ))}

          {/* 현재 위치 표시 */}
          <div
            className="playhead"
            style={{
              left: `${timeToPosition(currentTime)}px`
            }}
          ></div>
        </div>

        <input
          type="range"
          min="0"
          max={maxTime}
          value={currentTime}
          onChange={handleSliderChange}
          className="timeline-slider"
        />
      </div>

      <div className="player-controls">
        <button onClick={restart} className="control-button restart-button">
          처음부터
        </button>
        <button onClick={togglePlay} className="control-button play-button">
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

      <div className="player-info">
        <div className="player-status">
          <div className="current-state">
            현재 상태:
            <span className={`state-label ${currentStateEvent?.state.toLowerCase() || 'light'}`}>
              {currentStateEvent?.state === 'LIGHT' ? '빛' :
                currentStateEvent?.state === 'DARK' ? '어둠' :
                  currentStateEvent?.state === 'EQUILIBRIUM' ? '이퀼리브리엄' : '빛'}
            </span>
          </div>

          <div className="current-damage">
            누적 데미지: {formatNumber(currentTotalDamage)}
          </div>

          <div className="active-buffs">
            활성 버프:
            {Object.keys(currentBuffs).length > 0 ? (
              <div className="buff-icons">
                {Object.keys(currentBuffs).map((buffId, i) => (
                  <div key={`active-buff-${i}`} className="buff-icon" title={buffId}>
                    {buffId.substring(0, 2)}
                  </div>
                ))}
              </div>
            ) : (
              <span className="no-buffs">없음</span>
            )}
          </div>
        </div>

        <div className="recent-skills">
          <h3>최근 스킬</h3>
          <ul>
            {recentSkills.map((skill, index) => (
              <li key={`recent-${index}`}>
                <span className="skill-name">{skills[skill.skill]?.name || skill.skill}</span>
                <span className="skill-damage">{formatNumber(skill.damage)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;