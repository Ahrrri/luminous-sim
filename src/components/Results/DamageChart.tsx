// src/components/Results/DamageChart.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatTime, formatNumber } from '../../utils/helpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DamageChart: React.FC = () => {
  const { damageTimeline, totalDamage, duration } = useSelector((state: RootState) => state.results);
  
  // 데이터 변환: 시간별 누적 데미지
  const cumulativeData = damageTimeline.reduce((acc: any[], snapshot, index) => {
    const prevCumulative = index > 0 ? acc[index - 1].cumulativeDamage : 0;
    const cumulativeDamage = prevCumulative + snapshot.damage;
    
    // 1초 단위로 데이터 샘플링 (30 틱 = 0.9초)
    if (index % 30 === 0 || index === damageTimeline.length - 1) {
      acc.push({
        time: snapshot.time,
        cumulativeDamage,
        dps: cumulativeDamage / (snapshot.time / 1000)
      });
    }
    
    return acc;
  }, []);
  
  // DPS 계산
  const dps = totalDamage / (duration / 1000);

  // 차트에 표시할 최대값 계산
  const maxDamage = cumulativeData.length > 0 
    ? cumulativeData[cumulativeData.length - 1].cumulativeDamage 
    : 0;
  const maxDps = cumulativeData.length > 0
    ? Math.max(...cumulativeData.map(d => d.dps))
    : 0;

  // 차트 데이터가 없을 때 처리
  if (cumulativeData.length === 0) {
    return (
      <div className="damage-chart">
        <h2>데미지 차트</h2>
        <p>시뮬레이션을 실행하여 데이터를 생성하세요.</p>
      </div>
    );
  }

  return (
    <div className="damage-chart">
      <h2>데미지 차트</h2>
      
      <div className="chart-summary">
        <div>
          <strong>총 데미지:</strong> {formatNumber(totalDamage)}
        </div>
        <div>
          <strong>DPS:</strong> {formatNumber(dps)}
        </div>
        <div>
          <strong>시뮬레이션 시간:</strong> {formatTime(duration)}
        </div>
      </div>
      
      <div className="chart-container" style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cumulativeData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tickFormatter={(time) => formatTime(time)}
              label={{ value: '시간', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              yAxisId="damage"
              orientation="left"
              domain={[0, maxDamage * 1.1]}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              label={{ value: '누적 데미지', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="dps"
              orientation="right"
              domain={[0, maxDps * 1.1]}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              label={{ value: 'DPS', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value: number) => formatNumber(value)}
              labelFormatter={(time) => `시간: ${formatTime(time as number)}`}
            />
            <Legend />
            <Line
              yAxisId="damage"
              type="monotone"
              dataKey="cumulativeDamage"
              name="누적 데미지"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="dps"
              type="monotone"
              dataKey="dps"
              name="DPS"
              stroke="#82ca9d" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DamageChart;