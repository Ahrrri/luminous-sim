// src/components/ManualPractice/SkillBar.tsx
import React from 'react';

interface MockSkill {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  maxCooldown: number;
  keyBinding: string;
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'BUFF';
  disabled: boolean;
}

interface SkillBarProps {
  skills: MockSkill[];
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
    buff: skills.filter(skill => skill.element === 'BUFF'),
  };

  const formatCooldown = (cooldown: number) => {
    if (cooldown <= 0) return '';
    if (cooldown < 10) return cooldown.toFixed(1);
    return Math.ceil(cooldown).toString();
  };

  const SkillIcon: React.FC<{ skill: MockSkill }> = ({ skill }) => {
    const canUse = !skill.disabled && skill.cooldown <= 0 && isRunning;
    
    return (
      <div 
        className={`skill-icon ${skill.element.toLowerCase()} ${canUse ? 'usable' : 'disabled'}`}
        onClick={() => canUse && onSkillUse(skill.id)}
        title={skill.name}
      >
        <div className="skill-icon-content">
          <span className="skill-emoji">{skill.icon}</span>
          <div className="skill-name">{skill.name}</div>
          <div className="key-binding">{skill.keyBinding}</div>
        </div>
        
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
        <div className="skill-group">
          <h4 className="group-title light">빛 스킬</h4>
          <div className="skill-icons">
            {groupedSkills.light.map(skill => (
              <SkillIcon key={skill.id} skill={skill} />
            ))}
          </div>
        </div>

        <div className="skill-group">
          <h4 className="group-title dark">어둠 스킬</h4>
          <div className="skill-icons">
            {groupedSkills.dark.map(skill => (
              <SkillIcon key={skill.id} skill={skill} />
            ))}
          </div>
        </div>

        <div className="skill-group">
          <h4 className="group-title equilibrium">이퀼리브리엄 스킬</h4>
          <div className="skill-icons">
            {groupedSkills.equilibrium.map(skill => (
              <SkillIcon key={skill.id} skill={skill} />
            ))}
          </div>
        </div>

        <div className="skill-group">
          <h4 className="group-title buff">버프 스킬</h4>
          <div className="skill-icons">
            {groupedSkills.buff.map(skill => (
              <SkillIcon key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};