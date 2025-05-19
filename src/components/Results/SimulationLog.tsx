// src/components/Results/SimulationLog.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatTime, formatNumber, formatTimeWithMs } from '../../utils/helpers';
import { skills } from '../../models/skills';
import './simulationLog.css';

interface LogEvent {
  time: number;
  type: 'DAMAGE' | 'STATE' | 'BUFF';
  description: string;
  details?: string;
}

const SimulationLog: React.FC = () => {
  const { damageTimeline, stateTimeline, buffsTimeline } = useSelector((state: RootState) => state.results);
  const [filter, setFilter] = useState<string[]>(['DAMAGE', 'STATE', 'BUFF']);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 모든 이벤트를 통합하고 시간순으로 정렬
  const events: LogEvent[] = [];

  // 데미지 이벤트 추가
  damageTimeline.forEach(event => {
    const skillName = skills[event.skill]?.name || event.skill;
    events.push({
      time: event.time,
      type: 'DAMAGE',
      description: `스킬 사용: ${skillName}`,
      details: `데미지: ${formatNumber(event.damage)}`
    });
  });

  // 상태 변경 이벤트 추가
  stateTimeline.forEach(event => {
    const stateName =
      event.state === 'LIGHT' ? '빛' :
        event.state === 'DARK' ? '어둠' : '이퀼리브리엄';

    events.push({
      time: event.time,
      type: 'STATE',
      description: `상태 변경: ${stateName}`,
      details: `새 상태: ${event.state}`
    });
  });

  // 버프 이벤트 추가
  buffsTimeline.forEach(event => {
    events.push({
      time: event.time,
      type: 'BUFF',
      description: `버프 ${event.action === 'APPLIED' ? '적용' : '종료'}: ${event.buffId}`,
      details: `상태: ${event.action}`
    });
  });

  // 시간순 정렬
  events.sort((a, b) => a.time - b.time);

  // 필터링된 이벤트
  const filteredEvents = events.filter(event => filter.includes(event.type));

  // 필터 토글 핸들러
  const toggleFilter = (type: string) => {
    if (filter.includes(type)) {
      setFilter(filter.filter(t => t !== type));
    } else {
      setFilter([...filter, type]);
    }
  };

  // 자동 스크롤 효과
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredEvents, autoScroll]);

  // 데이터가 없는 경우
  if (events.length === 0) {
    return (
      <div className="simulation-log">
        <h2>시뮬레이션 로그</h2>
        <p>시뮬레이션을 실행하여 데이터를 생성하세요.</p>
      </div>
    );
  }

  return (
    <div className="simulation-log">
      <div className="log-header">
        <h2>시뮬레이션 로그</h2>
        <div className="log-controls">
          <div className="filter-buttons">
            <button
              className={filter.includes('DAMAGE') ? 'active' : ''}
              onClick={() => toggleFilter('DAMAGE')}
            >
              데미지
            </button>
            <button
              className={filter.includes('STATE') ? 'active' : ''}
              onClick={() => toggleFilter('STATE')}
            >
              상태 변화
            </button>
            <button
              className={filter.includes('BUFF') ? 'active' : ''}
              onClick={() => toggleFilter('BUFF')}
            >
              버프
            </button>
          </div>
          <label className="auto-scroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={() => setAutoScroll(!autoScroll)}
            />
            자동 스크롤
          </label>
        </div>
      </div>

      <div className="log-container" ref={logContainerRef}>
        {filteredEvents.map((event, index) => (
          <div
            key={`log-${index}`}
            className={`log-entry log-${event.type.toLowerCase()}`}
          >
            <div className="log-time">{formatTimeWithMs(event.time)}</div>
            <div className="log-content">
              <div className="log-description">{event.description}</div>
              {event.details && <div className="log-details">{event.details}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="log-summary">
        총 {events.length}개 이벤트, {filteredEvents.length}개 표시됨
      </div>
    </div>
  );
};

export default SimulationLog;