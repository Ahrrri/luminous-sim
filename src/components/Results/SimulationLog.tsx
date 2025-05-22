// src/components/Results/SimulationLog.tsx
import React, { useState, useRef, useEffect } from 'react';

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

interface LogEntry {
  time: number;
  type: 'DAMAGE' | 'BUFF' | 'STATE';
  message: string;
  details?: string;
}

interface SimulationLogProps {
  damageTimeline: DamageSnapshot[];
  buffsTimeline: BuffEvent[];
  stateTimeline: StateEvent[];
}

export const SimulationLog: React.FC<SimulationLogProps> = ({
  damageTimeline,
  buffsTimeline,
  stateTimeline
}) => {
  const [filter, setFilter] = useState<string[]>(['DAMAGE', 'BUFF', 'STATE']);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const logContainerRef = useRef<HTMLDivElement>(null);

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

  // 모든 이벤트를 통합하여 로그 엔트리 생성
  const generateLogEntries = (): LogEntry[] => {
    const entries: LogEntry[] = [];

    // 데미지 이벤트
    damageTimeline.forEach(event => {
      entries.push({
        time: event.time,
        type: 'DAMAGE',
        message: `스킬 사용: ${event.skill}`,
        details: `데미지: ${formatNumber(event.damage)} (누적: ${formatNumber(event.cumulativeDamage)})`
      });
    });

    // 버프 이벤트
    buffsTimeline.forEach(event => {
      entries.push({
        time: event.time,
        type: 'BUFF',
        message: `버프 ${event.action === 'APPLIED' ? '적용' : '종료'}: ${event.buffId}`,
        details: `상태: ${event.action}`
      });
    });

    // 상태 변경 이벤트
    stateTimeline.forEach(event => {
      const stateName = event.state === 'LIGHT' ? '빛' : 
                       event.state === 'DARK' ? '어둠' : '이퀼리브리엄';
      entries.push({
        time: event.time,
        type: 'STATE',
        message: `상태 변경: ${stateName}`,
        details: `새로운 상태: ${event.state}`
      });
    });

    // 시간순 정렬
    return entries.sort((a, b) => a.time - b.time);
  };

  const allLogEntries = generateLogEntries();

  // 필터링 및 검색
  const filteredEntries = allLogEntries.filter(entry => {
    const matchesFilter = filter.includes(entry.type);
    const matchesSearch = searchTerm === '' || 
      entry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.details && entry.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // 필터 토글
  const toggleFilter = (type: string) => {
    setFilter(prev => 
      prev.includes(type) 
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredEntries, autoScroll]);

  return (
    <div className="simulation-log">
      <div className="log-header">
        <h3>시뮬레이션 로그</h3>
        <div className="log-stats">
          총 {allLogEntries.length}개 이벤트 / {filteredEntries.length}개 표시
        </div>
      </div>

      <div className="log-controls">
        <div className="filter-section">
          <span className="control-label">필터:</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter.includes('DAMAGE') ? 'active' : ''}`}
              onClick={() => toggleFilter('DAMAGE')}
            >
              💥 데미지
            </button>
            <button
              className={`filter-btn ${filter.includes('BUFF') ? 'active' : ''}`}
              onClick={() => toggleFilter('BUFF')}
            >
              ✨ 버프
            </button>
            <button
              className={`filter-btn ${filter.includes('STATE') ? 'active' : ''}`}
              onClick={() => toggleFilter('STATE')}
            >
              🔄 상태변화
            </button>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="auto-scroll-section">
          <label className="auto-scroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            자동 스크롤
          </label>
        </div>
      </div>

      <div className="log-container" ref={logContainerRef}>
        {filteredEntries.map((entry, index) => (
          <div key={index} className={`log-entry log-${entry.type.toLowerCase()}`}>
            <div className="log-time">{formatTime(entry.time)}</div>
            <div className="log-content">
              <div className="log-message">{entry.message}</div>
              {entry.details && (
                <div className="log-details">{entry.details}</div>
              )}
            </div>
          </div>
        ))}
        
        {filteredEntries.length === 0 && (
          <div className="log-empty">
            {searchTerm ? '검색 결과가 없습니다.' : '표시할 로그가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
};