// src/components/Results/DamageChart.tsx
import React from 'react';

interface DamageSnapshot {
  time: number;
  damage: number;
  skill: string;
  cumulativeDamage: number;
}

interface DamageChartProps {
  damageTimeline: DamageSnapshot[];
  totalDamage: number;
  duration: number;
}

export const DamageChart: React.FC<DamageChartProps> = ({
  damageTimeline,
  totalDamage,
  duration
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 차트 데이터 처리 (1초마다 샘플링)
  const chartData = damageTimeline
    .filter((_, index) => index % 30 === 0) // 30틱마다 = 약 1초마다
    .map(snapshot => ({
      time: snapshot.time,
      damage: snapshot.cumulativeDamage,
      dps: snapshot.cumulativeDamage / (snapshot.time / 1000)
    }));

  const maxDamage = Math.max(...chartData.map(d => d.damage));
  const maxDPS = Math.max(...chartData.map(d => d.dps));
  const avgDPS = totalDamage / (duration / 1000);

  // SVG 차트 생성
  const chartWidth = 800;
  const chartHeight = 300;
  const margin = { top: 20, right: 60, bottom: 40, left: 80 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xScale = (time: number) => (time / duration) * innerWidth;
  const yScale = (damage: number) => innerHeight - (damage / maxDamage) * innerHeight;
  const dpsScale = (dps: number) => innerHeight - (dps / maxDPS) * innerHeight;

  // 누적 데미지 라인 생성
  const damageLine = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.time)} ${yScale(d.damage)}`)
    .join(' ');

  // DPS 라인 생성
  const dpsLine = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.time)} ${dpsScale(d.dps)}`)
    .join(' ');

  return (
    <div className="damage-chart">
      <div className="chart-header">
        <h3>데미지 차트</h3>
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">총 데미지:</span>
            <span className="stat-value">{formatNumber(totalDamage)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">평균 DPS:</span>
            <span className="stat-value">{formatNumber(avgDPS)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">최대 DPS:</span>
            <span className="stat-value">{formatNumber(maxDPS)}</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight} className="damage-chart-svg">
          {/* 배경 그리드 */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width={innerWidth} height={innerHeight} transform={`translate(${margin.left},${margin.top})`} fill="url(#grid)" />

          {/* X축 */}
          <g transform={`translate(${margin.left},${margin.top + innerHeight})`}>
            <line x1="0" y1="0" x2={innerWidth} y2="0" stroke="#6b7280" strokeWidth="2"/>
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <g key={ratio} transform={`translate(${ratio * innerWidth},0)`}>
                <line y1="0" y2="6" stroke="#6b7280" strokeWidth="1"/>
                <text y="20" textAnchor="middle" className="axis-label">
                  {formatTime(ratio * duration)}
                </text>
              </g>
            ))}
          </g>

          {/* Y축 (데미지) */}
          <g transform={`translate(${margin.left},${margin.top})`}>
            <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="#6b7280" strokeWidth="2"/>
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <g key={ratio} transform={`translate(0,${(1 - ratio) * innerHeight})`}>
                <line x1="-6" y1="0" x2="0" y2="0" stroke="#6b7280" strokeWidth="1"/>
                <text x="-10" y="4" textAnchor="end" className="axis-label">
                  {formatNumber(ratio * maxDamage)}
                </text>
              </g>
            ))}
          </g>

          {/* Y축 (DPS) - 오른쪽 */}
          <g transform={`translate(${margin.left + innerWidth},${margin.top})`}>
            <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="#6b7280" strokeWidth="2"/>
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <g key={ratio} transform={`translate(0,${(1 - ratio) * innerHeight})`}>
                <line x1="0" y1="0" x2="6" y2="0" stroke="#6b7280" strokeWidth="1"/>
                <text x="10" y="4" textAnchor="start" className="axis-label">
                  {formatNumber(ratio * maxDPS)}
                </text>
              </g>
            ))}
          </g>

          {/* 데미지 라인 */}
          <g transform={`translate(${margin.left},${margin.top})`}>
            <path
              d={damageLine}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              className="damage-line"
            />
          </g>

          {/* DPS 라인 */}
          <g transform={`translate(${margin.left},${margin.top})`}>
            <path
              d={dpsLine}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              className="dps-line"
              strokeDasharray="5,5"
            />
          </g>

          {/* 범례 */}
          <g transform={`translate(${margin.left + 20},${margin.top + 20})`}>
            <rect width="120" height="50" fill="white" fillOpacity="0.9" stroke="#d1d5db" rx="4"/>
            <g transform="translate(10,15)">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#3b82f6" strokeWidth="3"/>
              <text x="25" y="4" className="legend-text">누적 데미지</text>
            </g>
            <g transform="translate(10,35)">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5"/>
              <text x="25" y="4" className="legend-text">DPS</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};