// src/components/Results/SkillBreakdown.tsx
import React, { useState } from 'react';

interface SkillUsage {
  skillId: string;
  skillName: string;
  count: number;
  totalDamage: number;
  percentage: number;
}

interface SkillBreakdownProps {
  skillUsage: SkillUsage[];
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({
  skillUsage
}) => {
  const [sortBy, setSortBy] = useState<'damage' | 'count' | 'percentage'>('damage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSkillColor = (skillId: string) => {
    const colors: Record<string, string> = {
      'absolute_kill': '#ef4444',
      'nova': '#3b82f6',
      'reflection': '#f59e0b',
      'baptism': '#10b981',
      'apocalypse': '#8b5cf6',
      'punishing': '#f97316',
      'door_of_truth': '#06b6d4',
    };
    return colors[skillId] || '#6b7280';
  };

  const sortedSkills = [...skillUsage].sort((a, b) => {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    switch (sortBy) {
      case 'damage':
        return (a.totalDamage - b.totalDamage) * multiplier;
      case 'count':
        return (a.count - b.count) * multiplier;
      case 'percentage':
        return (a.percentage - b.percentage) * multiplier;
      default:
        return 0;
    }
  });

  const handleSort = (field: 'damage' | 'count' | 'percentage') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="skill-breakdown">
      <div className="breakdown-header">
        <h3>스킬 분석</h3>
        <div className="sort-controls">
          <span className="sort-label">정렬:</span>
          <button 
            className={`sort-button ${sortBy === 'damage' ? 'active' : ''}`}
            onClick={() => handleSort('damage')}
          >
            데미지 {sortBy === 'damage' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            className={`sort-button ${sortBy === 'count' ? 'active' : ''}`}
            onClick={() => handleSort('count')}
          >
            횟수 {sortBy === 'count' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            className={`sort-button ${sortBy === 'percentage' ? 'active' : ''}`}
            onClick={() => handleSort('percentage')}
          >
            비율 {sortBy === 'percentage' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      <div className="breakdown-content">
        <div className="skills-chart">
          {sortedSkills.map((skill, index) => (
            <div key={skill.skillId} className="skill-bar-item">
              <div className="skill-info">
                <div className="skill-rank">#{index + 1}</div>
                <div className="skill-details">
                  <div className="skill-name">{skill.skillName}</div>
                  <div className="skill-stats">
                    <span className="skill-count">{skill.count}회</span>
                    <span className="skill-damage">{formatNumber(skill.totalDamage)}</span>
                    <span className="skill-percentage">{skill.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="skill-bar">
                <div 
                  className="skill-bar-fill"
                  style={{ 
                    width: `${skill.percentage}%`,
                    backgroundColor: getSkillColor(skill.skillId)
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="breakdown-table">
          <table>
            <thead>
              <tr>
                <th>순위</th>
                <th>스킬명</th>
                <th 
                  className={`sortable ${sortBy === 'count' ? 'active' : ''}`}
                  onClick={() => handleSort('count')}
                >
                  사용 횟수 {sortBy === 'count' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className={`sortable ${sortBy === 'damage' ? 'active' : ''}`}
                  onClick={() => handleSort('damage')}
                >
                  총 데미지 {sortBy === 'damage' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className={`sortable ${sortBy === 'percentage' ? 'active' : ''}`}
                  onClick={() => handleSort('percentage')}
                >
                  데미지 비율 {sortBy === 'percentage' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSkills.map((skill, index) => (
                <tr key={skill.skillId}>
                  <td className="rank-cell">#{index + 1}</td>
                  <td className="skill-cell">
                    <div className="skill-color-indicator" 
                         style={{ backgroundColor: getSkillColor(skill.skillId) }} />
                    {skill.skillName}
                  </td>
                  <td className="number-cell">{skill.count.toLocaleString()}</td>
                  <td className="number-cell">{formatNumber(skill.totalDamage)}</td>
                  <td className="percentage-cell">{skill.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};