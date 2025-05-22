// src/components/ManualPractice/SkillBar.tsx - 실제 버전
import React from 'react';

interface SkillData {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  maxCooldown: number;
  keyBinding: string;
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'NONE';
  disabled: boolean;
}

interface SkillBarProps {
  skills: SkillData[];
  onSkillUse: (skillId: string) => void;
  isRunning: boolean;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  onSkillUse,
  isRunning
}) => {
  const groupedSkills = {
    light: skills.filter(skill => skill.element === 'LIGHT'),
    dark: skills.filter(skill => skill.element === 'DARK'),
    equilibrium: skills.filter(skill => skill.element === 'EQUILIBRIUM'),
    buff: skills.filter(skill => skill.element === 'NONE'),
  };

  const formatCooldown = (cooldown: number) => {
    if (cooldown <= 0) return '';
    if (cooldown < 10) return cooldown.toFixed(1);
    return Math.ceil(cooldown).toString();
  };

  // 스킬 아이콘 이미지 URL 생성
  const getSkillIconUrl = (skillId: string): string => {
    return `/skill-icons/${skillId.toLowerCase()}.png`;
  };

  const SkillIcon: React.FC<{ skill: SkillData }> = ({ skill }) => {
    const canUse = !skill.disabled && skill.cooldown <= 0 && isRunning;
    const elementClass = skill.element === 'NONE' ? 'buff' : skill.element.toLowerCase();
    
    return (
      <div 
        className={`skill-icon ${elementClass} ${canUse ? 'usable' : 'disabled'}`}
        onClick={() => canUse && onSkillUse(skill.id)}
        title={`${skill.name} (${skill.keyBinding})`}
      >
        <div className="skill-icon-content">
          {/* 스킬 아이콘 - 이미지 우선, 실패시 이모지 */}
          <img 
            src={getSkillIconUrl(skill.id)} 
            alt={skill.name}
            className="skill-image"
            onError={(e) => {
              // 이미지 로드 실패시 이모지로 대체
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.skill-emoji-fallback')) {
                const fallback = document.createElement('span');
                fallback.className = 'skill-emoji-fallback';
                fallback.textContent = skill.icon;
                parent.insertBefore(fallback, target);
              }
            }}
          />
          
          <div className="skill-name">{skill.name}</div>
        </div>
        
        {/* 키 바인딩 표시 */}
        <div className="key-binding">{skill.keyBinding}</div>
        
        {/* 쿨다운 오버레이 */}
        {skill.cooldown > 0 && (
          <div className="cooldown-overlay">
            <div 
              className="cooldown-fill"
              style={{ 
                height: `${(skill.cooldown / skill.maxCooldown) * 100}%` 
              }}
            />
            <div className="cooldown-text">
              {formatCooldown(skill.cooldown)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="skill-bar">
      <h3>스킬</h3>
      
      <div className="skill-groups">
        {groupedSkills.light.length > 0 && (
          <div className="skill-group">
            <h4 className="group-title light">빛 스킬</h4>
            <div className="skill-icons">
              {groupedSkills.light.map(skill => (
                <SkillIcon key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {groupedSkills.dark.length > 0 && (
          <div className="skill-group">
            <h4 className="group-title dark">어둠 스킬</h4>
            <div className="skill-icons">
              {groupedSkills.dark.map(skill => (
                <SkillIcon key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {groupedSkills.equilibrium.length > 0 && (
          <div className="skill-group">
            <h4 className="group-title equilibrium">이퀼리브리엄 스킬</h4>
            <div className="skill-icons">
              {groupedSkills.equilibrium.map(skill => (
                <SkillIcon key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {groupedSkills.buff.length > 0 && (
          <div className="skill-group">
            <h4 className="group-title buff">버프 스킬</h4>
            <div className="skill-icons">
              {groupedSkills.buff.map(skill => (
                <SkillIcon key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};