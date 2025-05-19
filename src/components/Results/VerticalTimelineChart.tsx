// src/components/Results/VerticalTimelineChart.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatNumber, formatTime } from '../../utils/helpers';
import { skills } from '../../models/skills';
import './verticalTimeline.css';

const VerticalTimelineChart: React.FC = () => {
  const { damageTimeline, buffsTimeline, stateTimeline } = useSelector((state: RootState) => state.results);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // 컨테이너 크기 감지
  useEffect(() => {
    const updateHeight = () => {
      const parent = timelineRef.current?.parentElement;
      if (parent) {
        // 헤더와 컨트롤 영역의 높이를 고려하여 컨테이너 높이 계산
        const headerHeight =
          parent.querySelector('.timeline-header')?.clientHeight || 0;
        const controlsHeight =
          parent.querySelector('.timeline-controls')?.clientHeight || 0;
        const totalHeight = parent.clientHeight;

        // 컨테이너 높이 설정 (여백 고려)
        setContainerHeight(totalHeight - headerHeight - controlsHeight - 30);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // 데이터가 없는 경우 처리
  if (damageTimeline.length === 0) {
    return (
      <div className="vertical-timeline">
        <div className="timeline-header">
          <h2>상세 타임라인</h2>
          <p>시뮬레이션을 실행하여 데이터를 생성하세요.</p>
        </div>
      </div>
    );
  }

  // 데미지 타임라인 데이터 처리
  const processedTimeline = damageTimeline.map((event, index) => {
    // 누적 데미지 계산
    const cumulativeDamage = damageTimeline
      .slice(0, index + 1)
      .reduce((sum, evt) => sum + evt.damage, 0);

    // 스킬 정보 가져오기
    const skillInfo = skills[event.skill] || { name: event.skill, delay: 600, type: 'ATTACK' };

    // 해당 시점에 활성화된 버프 찾기
    const activeBuffs = buffsTimeline
      .filter(buff =>
        buff.action === 'APPLIED' &&
        buff.time <= event.time &&
        !buffsTimeline.some(expiry =>
          expiry.buffId === buff.buffId &&
          expiry.action === 'EXPIRED' &&
          expiry.time > buff.time &&
          expiry.time <= event.time
        )
      )
      .map(buff => buff.buffId);

    // 상태 정보 찾기
    const currentState = stateTimeline
      .filter(state => state.time <= event.time)
      .sort((a, b) => b.time - a.time)[0]?.state || 'LIGHT';

    return {
      ...event,
      cumulativeDamage,
      skillInfo,
      activeBuffs,
      currentState
    };
  });

  // 소환 스킬 데이터 처리
  const summonSkills = processedTimeline
    .filter(event => event.skillInfo.type === 'SUMMON')
    .map(event => ({
      ...event,
      // 소환물 지속시간 추정 (실제로는 각 스킬의 지속시간 데이터가 필요)
      duration: event.skillInfo.id === 'DOOR_OF_TRUTH' ? 40000 :
        event.skillInfo.id === 'PUNISHING_RESONATOR' ? 6000 : 30000
    }));

  // 줌 레벨 변경 핸들러
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  // 스크롤 처리
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      setScrollPosition(timelineRef.current.scrollTop);
    }
  };

  // 스킬 블록 높이 계산 함수
  const calculateBlockHeight = (delay: number) => {
    // 최소 높이 설정
    const minHeight = 30;
    // 딜레이에 비례하는 높이 (딜레이 값은 ms 단위)
    const delayBasedHeight = (delay / 1000) * 50 * zoomLevel;

    return Math.max(minHeight, delayBasedHeight);
  };

  // 시간 위치 계산 함수
  const calculateTimePosition = (time: number) => {
    return time * 0.1 * zoomLevel;
  };

  // 현재 보이는 영역의 시간 범위 계산
  const visibleTimeRange = timelineRef.current ? {
    start: scrollPosition / (0.1 * zoomLevel),
    end: (scrollPosition + timelineRef.current.clientHeight) / (0.1 * zoomLevel)
  } : { start: 0, end: 0 };

  return (
    <div className="vertical-timeline">
      <div className="timeline-header">
        <h2>상세 타임라인</h2>
      </div>

      <div className="timeline-controls">
        <div className="zoom-control">
          <label htmlFor="zoom-slider">확대/축소:</label>
          <input
            id="zoom-slider"
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={handleZoomChange}
          />
          <span>{zoomLevel.toFixed(1)}x</span>
        </div>

        <div className="timeline-info">
          <span>
            {visibleTimeRange.start > 0 ?
              `현재 보는 구간: ${formatTime(visibleTimeRange.start)} - ${formatTime(visibleTimeRange.end)}` :
              '스크롤하여 타임라인을 탐색하세요'}
          </span>
        </div>
      </div>

      <div
        className="timeline-container"
        ref={timelineRef}
        onScroll={handleScroll}
        style={{ height: `${containerHeight}px` }}
      >
        <div
          className="timeline-content"
          style={{
            height: `${calculateTimePosition(processedTimeline[processedTimeline.length - 1].time + 5000)}px`
          }}
        >
          {/* 상태 배경 표시 */}
          {stateTimeline.map((stateChange, index) => {
            const nextStateChange = stateTimeline[index + 1];
            const endTime = nextStateChange ? nextStateChange.time : processedTimeline[processedTimeline.length - 1].time + 5000;
            const duration = endTime - stateChange.time;

            return (
              <div
                key={`state-${index}`}
                className={`state-background state-${stateChange.state.toLowerCase()}`}
                style={{
                  top: `${calculateTimePosition(stateChange.time)}px`,
                  height: `${calculateTimePosition(duration)}px`
                }}
              >
                <div className="state-label">
                  {stateChange.state === 'LIGHT' ? '빛' :
                    stateChange.state === 'DARK' ? '어둠' : '이퀼리브리엄'}
                </div>
              </div>
            );
          })}

          {/* 소환 스킬 지속 시간 표시 */}
          {summonSkills.map((summon, index) => (
            <div
              key={`summon-${index}`}
              className="summon-duration"
              style={{
                top: `${calculateTimePosition(summon.time)}px`,
                height: `${calculateTimePosition(summon.duration)}px`,
                left: '110px'
              }}
              onMouseEnter={() => setHoveredSkill(summon.skill)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="summon-line"></div>
              <div className="summon-label">
                {summon.skillInfo.name} 지속 중
              </div>
            </div>
          ))}

          {/* 스킬 블록 표시 */}
          {processedTimeline.map((event, index) => {
            const blockHeight = calculateBlockHeight(event.skillInfo.delay);
            const isSummon = event.skillInfo.type === 'SUMMON';

            return (
              <div
                key={`skill-${index}`}
                className={`skill-block ${isSummon ? 'summon-skill' : ''} ${hoveredSkill === event.skill ? 'hovered' : ''}`}
                style={{
                  top: `${calculateTimePosition(event.time)}px`,
                  height: `${blockHeight}px`
                }}
                onMouseEnter={() => setHoveredSkill(event.skill)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <div className="skill-info">
                  <div className="skill-name">{event.skillInfo.name}</div>
                  <div className="skill-damage">데미지: {formatNumber(event.damage)}</div>
                </div>

                <div className="skill-details">
                  <div className="cumulative-damage">누적: {formatNumber(event.cumulativeDamage)}</div>
                  <div className="active-buffs">
                    {event.activeBuffs.map((buffId, i) => (
                      <div key={`buff-${index}-${i}`} className="buff-icon" title={buffId}>
                        {buffId.substring(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 시간 표시 마커 - 30초 간격 */}
          {Array.from({ length: Math.ceil(processedTimeline[processedTimeline.length - 1].time / 30000) }).map((_, index) => {
            const timePoint = index * 30000;
            return (
              <div
                key={`time-marker-${index}`}
                className="time-marker"
                style={{
                  top: `${calculateTimePosition(timePoint)}px`
                }}
              >
                <div className="time-marker-line"></div>
                <div className="time-marker-label">{formatTime(timePoint)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 스킬 상세 정보 툴팁 */}
      {hoveredSkill && (
        <div className="skill-tooltip">
          <h3>{skills[hoveredSkill]?.name || hoveredSkill}</h3>
          <p>타입: {skills[hoveredSkill]?.type || 'ATTACK'}</p>
          <p>데미지: {skills[hoveredSkill]?.damage || 0}%</p>
          <p>타수: {skills[hoveredSkill]?.hitCount || 1}</p>
          <p>최대 타겟: {skills[hoveredSkill]?.maxTargets || 1}</p>
        </div>
      )}
    </div>
  );
};

export default VerticalTimelineChart;