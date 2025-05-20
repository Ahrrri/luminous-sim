// src/components/Practice/SkillBar.tsx
import React from 'react';
import { formatTime } from '../../utils/helpers';
import type { Skill } from '../../models/skills';
import type { CharacterState } from '../../models/character';
import './practice.css';

interface KeyBinding {
  skillId: string;
  key: string;
  displayKey: string;
}

interface SkillBarProps {
  skills: Skill[];
  cooldowns: Record<string, number>;
  keyBindings: KeyBinding[];
  character: CharacterState;
  onSkillUse: (skillId: string) => void;
  gameTime: number; // currentAction 대신 gameTime으로 변경
}

const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  cooldowns,
  keyBindings,
  character,
  onSkillUse,
  gameTime
}) => {
  // 스킬 사용 가능 여부 체크
  const canUseSkill = (skill: Skill): boolean => {
    // 쿨타임 체크
    if (cooldowns[skill.id] > 0) {
      return false;
    }
    
    // 이퀼 전용 스킬 체크
    if (skill.isEquilibriumOnly && character.currentState !== 'EQUILIBRIUM') {
      return false;
    }
    
    return true;
  };
  
  // 스킬 아이콘 URL 생성
  const getSkillIconUrl = (skillId: string): string => {
    // 실제 이미지 경로로 대체해야 함
    return `/skill-icons/${skillId.toLowerCase()}.png`;
  };
  
  // 쿨타임 진행률 계산 (0-1 사이 값)
  const getCooldownProgress = (skillId: string, originalCooldown: number): number => {
    if (!cooldowns[skillId] || cooldowns[skillId] <= 0) return 0;
    
    return cooldowns[skillId] / originalCooldown;
  };
  
  // 키 바인딩 표시 텍스트 가져오기
  const getKeyBindingText = (skillId: string): string => {
    const binding = keyBindings.find(kb => kb.skillId === skillId);
    return binding ? binding.displayKey : '';
  };
  
  // 스킬을 속성별로 그룹화
  const lightSkills = skills.filter(skill => skill.element === 'LIGHT' && skill.type === 'ATTACK');
  const darkSkills = skills.filter(skill => skill.element === 'DARK' && skill.type === 'ATTACK');
  const equilibriumSkills = skills.filter(skill => skill.element === 'EQUILIBRIUM' || skill.isEquilibriumOnly);
  const buffs = skills.filter(skill => skill.type === 'BUFF');

  return (
    <div className="skill-bar">
      <div className="skill-group light-skills">
        <h3>빛 스킬</h3>
        <div className="skill-icons">
          {lightSkills.map(skill => (
            <div 
              key={skill.id}
              className={`skill-icon ${canUseSkill(skill) ? '' : 'disabled'} ${skill.element.toLowerCase()}`}
              onClick={() => canUseSkill(skill) && onSkillUse(skill.id)}
            >
              <img 
                src={getSkillIconUrl(skill.id)} 
                alt={skill.name} 
                onError={(e) => {
                  // 이미지 로드 실패시 폴백 처리
                  (e.target as HTMLImageElement).src = '/skill-icons/default.png';
                }}
              />
              <div className="skill-name">{skill.name}</div>
              <div className="key-binding">{getKeyBindingText(skill.id)}</div>
              
              {cooldowns[skill.id] > 0 && (
                <div 
                  className="cooldown-overlay"
                  style={{ 
                    height: `${getCooldownProgress(skill.id, skill.cooldown) * 100}%`
                  }}
                >
                  <div className="cooldown-text">
                    {formatTime(cooldowns[skill.id])}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="skill-group dark-skills">
        <h3>어둠 스킬</h3>
        <div className="skill-icons">
          {darkSkills.map(skill => (
            <div 
              key={skill.id}
              className={`skill-icon ${canUseSkill(skill) ? '' : 'disabled'} ${skill.element.toLowerCase()}`}
              onClick={() => canUseSkill(skill) && onSkillUse(skill.id)}
            >
              <img 
                src={getSkillIconUrl(skill.id)} 
                alt={skill.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/skill-icons/default.png';
                }}
              />
              <div className="skill-name">{skill.name}</div>
              <div className="key-binding">{getKeyBindingText(skill.id)}</div>
              
              {cooldowns[skill.id] > 0 && (
                <div 
                  className="cooldown-overlay"
                  style={{ 
                    height: `${getCooldownProgress(skill.id, skill.cooldown) * 100}%`
                  }}
                >
                  <div className="cooldown-text">
                    {formatTime(cooldowns[skill.id])}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="skill-group equilibrium-skills">
        <h3>이퀼 스킬</h3>
        <div className="skill-icons">
          {equilibriumSkills.map(skill => (
            <div 
              key={skill.id}
              className={`skill-icon ${canUseSkill(skill) ? '' : 'disabled'} equilibrium`}
              onClick={() => canUseSkill(skill) && onSkillUse(skill.id)}
            >
              <img 
                src={getSkillIconUrl(skill.id)} 
                alt={skill.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/skill-icons/default.png';
                }}
              />
              <div className="skill-name">{skill.name}</div>
              <div className="key-binding">{getKeyBindingText(skill.id)}</div>
              
              {cooldowns[skill.id] > 0 && (
                <div 
                  className="cooldown-overlay"
                  style={{ 
                    height: `${getCooldownProgress(skill.id, skill.cooldown) * 100}%`
                  }}
                >
                  <div className="cooldown-text">
                    {formatTime(cooldowns[skill.id])}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="skill-group buff-skills">
        <h3>버프 스킬</h3>
        <div className="skill-icons">
          {buffs.map(skill => (
            <div 
              key={skill.id}
              className={`skill-icon ${canUseSkill(skill) ? '' : 'disabled'} buff`}
              onClick={() => canUseSkill(skill) && onSkillUse(skill.id)}
            >
              <img 
                src={getSkillIconUrl(skill.id)} 
                alt={skill.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/skill-icons/default.png';
                }}
              />
              <div className="skill-name">{skill.name}</div>
              <div className="key-binding">{getKeyBindingText(skill.id)}</div>
              
              {cooldowns[skill.id] > 0 && (
                <div 
                  className="cooldown-overlay"
                  style={{ 
                    height: `${getCooldownProgress(skill.id, skill.cooldown) * 100}%`
                  }}
                >
                  <div className="cooldown-text">
                    {formatTime(cooldowns[skill.id])}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillBar;