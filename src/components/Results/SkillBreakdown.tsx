// src/components/Results/SkillBreakdown.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { formatNumber } from '../../utils/helpers';
import { skills } from '../../models/skills';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './results.css';

interface SkillSummary {
  skillId: string;
  skillName: string;
  count: number;
  totalDamage: number;
  percentage: number;
  color: string;
}

const SkillBreakdown: React.FC = () => {
  const { damageTimeline, totalDamage } = useSelector((state: RootState) => state.results);
  
  // 스킬별 데이터 집계
  const skillData = damageTimeline.reduce((acc: Record<string, SkillSummary>, snapshot) => {
    if (!acc[snapshot.skill]) {
      const skill = skills[snapshot.skill];
      const skillName = skill ? skill.name : snapshot.skill;
      
      acc[snapshot.skill] = {
        skillId: snapshot.skill,
        skillName,
        count: 0,
        totalDamage: 0,
        percentage: 0,
        color: getSkillColor(snapshot.skill),
      };
    }
    
    acc[snapshot.skill].count += 1;
    acc[snapshot.skill].totalDamage += snapshot.damage;
    
    return acc;
  }, {});
  
  // 데미지 비율 계산
  Object.values(skillData).forEach(skill => {
    skill.percentage = (skill.totalDamage / totalDamage) * 100;
  });
  
  // 데미지 내림차순 정렬
  const sortedSkillData = Object.values(skillData).sort((a, b) => b.totalDamage - a.totalDamage);
  
  // 차트 데이터가 없을 때 처리
  if (sortedSkillData.length === 0) {
    return (
      <div className="skill-breakdown">
        <h2>스킬 분석</h2>
        <p>시뮬레이션을 실행하여 데이터를 생성하세요.</p>
      </div>
    );
  }

  return (
    <div className="skill-breakdown">
      <h2>스킬 분석</h2>
      
      <div className="chart-container" style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedSkillData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 120,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <YAxis 
              type="category"
              dataKey="skillName"
              width={100}
            />
            <Tooltip 
              formatter={(value: number) => formatNumber(value)}
              labelFormatter={(skillName) => `스킬: ${skillName}`}
            />
            <Legend />
            <Bar 
              dataKey="totalDamage" 
              name="총 데미지" 
              fill="#8884d8"
            >
              {sortedSkillData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="skill-table">
        <h3>상세 스킬 정보</h3>
        <table>
          <thead>
            <tr>
              <th>스킬</th>
              <th>사용 횟수</th>
              <th>총 데미지</th>
              <th>데미지 비율</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkillData.map((skill) => (
              <tr key={skill.skillId}>
                <td>{skill.skillName}</td>
                <td>{skill.count}</td>
                <td>{formatNumber(skill.totalDamage)}</td>
                <td>{skill.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 스킬별 색상 지정 함수
function getSkillColor(skillId: string): string {
  const colors: Record<string, string> = {
    'ABSOLUTE_KILL': '#FF5252', // 빨강
    'REFLECTION': '#FFEB3B', // 노랑
    'APOCALYPSE': '#7E57C2', // 보라
    'TWILIGHT_NOVA': '#42A5F5', // 파랑
    'BAPTISM_OF_LIGHT_AND_DARKNESS': '#66BB6A', // 초록
    'PUNISHING_RESONATOR': '#FF7043', // 주황
    'DOOR_OF_TRUTH': '#26C6DA', // 청록
    'ETERNAL_LIGHTNESS': '#FFC107', // 금색
    'ENDLESS_DARKNESS': '#9C27B0', // 진한 보라
    'HARMONIC_PARADOX': '#3F51B5', // 인디고
  };
  
  return colors[skillId] || '#888888'; // 기본 회색
}

export default SkillBreakdown;