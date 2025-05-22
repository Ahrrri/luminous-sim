// src/components/Settings/SkillEnhancementSettings.tsx
import React from 'react';
import { SettingsCard } from './SettingsCard';
import { InputField } from './InputField';
import { LUMINOUS_SKILLS, getSkillsByCategory } from '../../data/skills';
import type { SkillEnhancement } from '../../data/types/characterTypes';

interface SkillEnhancementSettingsProps {
  skillEnhancements: SkillEnhancement[];
  onSkillEnhancementChange: (enhancements: SkillEnhancement[]) => void;
}

export const SkillEnhancementSettings: React.FC<SkillEnhancementSettingsProps> = ({
  skillEnhancements,
  onSkillEnhancementChange
}) => {

  const getSkillEnhancement = (skillId: string): SkillEnhancement => {
    return skillEnhancements.find(e => e.skillId === skillId) || {
      skillId,
      fifthLevel: 0,
      sixthLevel: 0
    };
  };

  const updateSkillEnhancement = (skillId: string, field: 'fifthLevel' | 'sixthLevel', value: number) => {
    const updatedEnhancements = skillEnhancements.filter(e => e.skillId !== skillId);
    const currentEnhancement = getSkillEnhancement(skillId);
    
    updatedEnhancements.push({
      ...currentEnhancement,
      [field]: value
    });
    
    onSkillEnhancementChange(updatedEnhancements);
  };

  const setAllFifthLevel = (level: number) => {
    const updatedEnhancements = LUMINOUS_SKILLS.map(skill => ({
      skillId: skill.id,
      fifthLevel: level,
      sixthLevel: getSkillEnhancement(skill.id).sixthLevel
    }));
    onSkillEnhancementChange(updatedEnhancements);
  };

  const setAllSixthLevel = (level: number) => {
    const updatedEnhancements = LUMINOUS_SKILLS.map(skill => ({
      skillId: skill.id,
      fifthLevel: getSkillEnhancement(skill.id).fifthLevel,
      sixthLevel: level
    }));
    onSkillEnhancementChange(updatedEnhancements);
  };

  const resetAllEnhancements = () => {
    onSkillEnhancementChange([]);
  };

  const skillCategories = [
    { name: '빛 스킬', skills: getSkillsByCategory('light'), color: '#ffc107' },
    { name: '어둠 스킬', skills: getSkillsByCategory('dark'), color: '#7e57c2' },
    { name: '이퀼리브리엄 스킬', skills: getSkillsByCategory('equilibrium'), color: '#42a5f5' },
    { name: '버프/기타 스킬', skills: getSkillsByCategory('buff'), color: '#10b981' },
  ];

  return (
    <SettingsCard title="스킬별 강화 설정" icon="⚡">
      <div className="settings-section">
        <h3>일괄 설정</h3>
        <div className="bulk-controls">
          <div className="bulk-group">
            <span className="bulk-label">5차 강화 일괄:</span>
            <div className="bulk-buttons">
              <button className="bulk-button" onClick={() => setAllFifthLevel(0)}>0레벨</button>
              <button className="bulk-button" onClick={() => setAllFifthLevel(30)}>30레벨</button>
              <button className="bulk-button" onClick={() => setAllFifthLevel(60)}>60레벨</button>
            </div>
          </div>
          <div className="bulk-group">
            <span className="bulk-label">6차 강화 일괄:</span>
            <div className="bulk-buttons">
              <button className="bulk-button" onClick={() => setAllSixthLevel(0)}>0레벨</button>
              <button className="bulk-button" onClick={() => setAllSixthLevel(15)}>15레벨</button>
              <button className="bulk-button" onClick={() => setAllSixthLevel(30)}>30레벨</button>
            </div>
          </div>
        </div>
      </div>

      {skillCategories.map(category => (
        <div key={category.name} className="settings-section">
          <h3 style={{ borderLeftColor: category.color }}>
            {category.name}
          </h3>
          <div className="skill-enhancement-grid">
            {category.skills.map(skill => {
              const enhancement = getSkillEnhancement(skill.id);
              return (
                <div key={skill.id} className="skill-enhancement-item">
                  <div className="skill-info">
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                  <div className="enhancement-controls">
                    <InputField
                      label="5차"
                      value={enhancement.fifthLevel}
                      onChange={(value) => updateSkillEnhancement(skill.id, 'fifthLevel', value)}
                      min={0}
                      max={60}
                    />
                    <InputField
                      label="6차"
                      value={enhancement.sixthLevel}
                      onChange={(value) => updateSkillEnhancement(skill.id, 'sixthLevel', value)}
                      min={0}
                      max={30}
                    />
                  </div>
                  <div className="enhancement-effect">
                    <span className="effect-text">
                      +{((enhancement.fifthLevel * 2) + (enhancement.sixthLevel * 3)).toFixed(0)}% 데미지
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="settings-actions">
        <button className="reset-button" onClick={resetAllEnhancements}>
          모든 강화 초기화
        </button>
      </div>
    </SettingsCard>
  );
};