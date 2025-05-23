// src/components/Settings/EnhancedSkillInfoPanel.tsx
import React from 'react';
import { LUMINOUS_SKILLS } from '../../data/skills';
import { ENHANCEMENT_DATA } from '../../data/enhancements/enhancementData';
import { PREDEFINED_PATTERNS } from '../../data/enhancements/enhancementPatterns';
import type { CharacterStats, BossStats, SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData } from '../../data/types/skillTypes';

interface EnhancedSkillInfoPanelProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  skillEnhancements: SkillEnhancement[];
  onSkillEnhancementChange: (enhancements: SkillEnhancement[]) => void;
}

export const EnhancedSkillInfoPanel: React.FC<EnhancedSkillInfoPanelProps> = ({
  bossStats,
  skillEnhancements,
  onSkillEnhancementChange
}) => {
  
  // 스킬별 강화 정보 가져오기
  const getSkillEnhancement = (skillId: string): SkillEnhancement => {
    return skillEnhancements.find(e => e.skillId === skillId) || {
      skillId,
      fifthLevel: 0,
      sixthLevel: 0
    };
  };

  // 강화 레벨 업데이트
  const updateSkillEnhancement = (skillId: string, field: 'fifthLevel' | 'sixthLevel', value: number) => {
    const updatedEnhancements = skillEnhancements.filter(e => e.skillId !== skillId);
    const currentEnhancement = getSkillEnhancement(skillId);
    
    const newEnhancement = {
      ...currentEnhancement,
      [field]: value
    };
    
    updatedEnhancements.push(newEnhancement);
    
    // 종속 스킬 처리 (이터널/엔드리스)
    if (field === 'sixthLevel') {
      if (skillId === 'reflection') {
        // 라이트 리플렉션VI → 엔드리스 다크니스VI
        const endlessEnhancement = getSkillEnhancement('endless_darkness');
        updatedEnhancements.push({
          ...endlessEnhancement,
          sixthLevel: value
        });
      } else if (skillId === 'apocalypse') {
        // 아포칼립스VI → 이터널 라이트니스VI
        const eternalEnhancement = getSkillEnhancement('eternal_lightness');
        updatedEnhancements.push({
          ...eternalEnhancement,
          sixthLevel: value
        });
      }
    }
    
    onSkillEnhancementChange(updatedEnhancements);
  };

  // 강화된 스킬 데미지 계산
  const calculateEnhancedDamage = (skill: SkillData, damageType?: string): {
    baseDamage: number;
    enhancedDamage: number;
    fifthMultiplier: number;
    sixthBonus: number;
  } => {
    const enhancement = getSkillEnhancement(skill.id);
    const enhancementData = ENHANCEMENT_DATA[skill.id];
    
    // 기본 퍼뎀 결정
    let baseDamage = skill.damage || 0;
    if (damageType === 'sunfire' && skill.damageSunfire) baseDamage = skill.damageSunfire;
    else if (damageType === 'eclipse' && skill.damageEclipse) baseDamage = skill.damageEclipse;
    else if (damageType === 'equilibrium' && skill.damageEquilibrium) baseDamage = skill.damageEquilibrium;
    
    let fifthMultiplier = 1;
    let sixthBonus = 0;
    
    // 5차 강화 효과
    if (enhancementData?.fifth && enhancement.fifthLevel > 0) {
      fifthMultiplier = 1 + (enhancement.fifthLevel * enhancementData.fifth.rate);
    }
    
    // 6차 강화 효과
    if (enhancementData?.sixth && enhancement.sixthLevel > 0) {
      if (enhancementData.sixth.type === 'skill_data_override' && enhancementData.sixth.overrides?.damage) {
        const overrideConfig = enhancementData.sixth.overrides.damage;
        if (overrideConfig.base !== undefined && overrideConfig.increment !== undefined) {
          baseDamage = Math.floor(overrideConfig.base + (enhancement.sixthLevel * overrideConfig.increment));
        }
      } else if (enhancementData.sixth.pattern && enhancementData.sixth.type === 'damage_multiplier') {
        const levels = PREDEFINED_PATTERNS[enhancementData.sixth.pattern as keyof typeof PREDEFINED_PATTERNS];
        if (levels) {
          sixthBonus = levels[enhancement.sixthLevel] || 0;
        }
      }
    }
    
    const enhancedDamage = Math.floor(baseDamage * fifthMultiplier * (1 + sixthBonus / 100));
    
    return {
      baseDamage,
      enhancedDamage,
      fifthMultiplier,
      sixthBonus
    };
  };

  // 최종 데미지 증가량 계산 (빛과 어둠의 세례 등)
  const getFinalDamageIncrease = (skillId: string): number => {
    const enhancement = getSkillEnhancement(skillId);
    const enhancementData = ENHANCEMENT_DATA[skillId];
    
    if (enhancementData?.sixth?.type === 'final_damage' && enhancement.sixthLevel > 0) {
      if (enhancementData.sixth.pattern) {
        const levels = PREDEFINED_PATTERNS[enhancementData.sixth.pattern as keyof typeof PREDEFINED_PATTERNS];
        return levels[enhancement.sixthLevel] || 0;
      }
    }
    return 0;
  };

  // 스킬 상세 정보 렌더링
  const renderSkillDetails = (skill: SkillData) => {
    const enhancement = getSkillEnhancement(skill.id);
    const enhancementData = ENHANCEMENT_DATA[skill.id];
    
    // 종속 스킬인지 확인
    const isDependentSkill = enhancementData?.sixth?.dependsOn;
    const parentSkill = isDependentSkill ? LUMINOUS_SKILLS.find(s => s.id === enhancementData.sixth!.dependsOn) : null;
    
    // 다양한 상태별 데미지 계산
    const damageVariants = [];
    
    if (skill.damage && skill.damage > 0) {
      const calc = calculateEnhancedDamage(skill);
      damageVariants.push({ 
        label: '기본', 
        ...calc,
        hitCount: skill.hitCount || 1
      });
    }
    
    if (skill.damageSunfire) {
      const calc = calculateEnhancedDamage(skill, 'sunfire');
      damageVariants.push({ 
        label: '선파이어', 
        ...calc,
        hitCount: skill.hitCountSunfire || skill.hitCount || 1
      });
    }
    
    if (skill.damageEclipse) {
      const calc = calculateEnhancedDamage(skill, 'eclipse');
      damageVariants.push({ 
        label: '이클립스', 
        ...calc,
        hitCount: skill.hitCountEclipse || skill.hitCount || 1
      });
    }
    
    if (skill.damageEquilibrium) {
      const calc = calculateEnhancedDamage(skill, 'equilibrium');
      damageVariants.push({ 
        label: '이퀼리브리엄', 
        ...calc,
        hitCount: skill.hitCountEquilibrium || skill.hitCount || 1
      });
    }

    const finalDamageIncrease = getFinalDamageIncrease(skill.id);

    return (
      <div key={skill.id} className="enhanced-skill-item">
        <div className="skill-header">
          <div className="skill-basic-info">
            <span className="skill-icon-large">{skill.icon}</span>
            <div className="skill-title-info">
              <span className="skill-name">{skill.name}</span>
              {skill.isEquilibriumSkill && (
                <span className="equilibrium-badge">이퀼 스킬</span>
              )}
              {isDependentSkill && parentSkill && (
                <span className="dependent-badge">
                  {parentSkill.name}VI 연동
                </span>
              )}
            </div>
          </div>
          
          <div className="skill-enhancement-controls">
            {enhancementData?.fifth && (
              <div className="enhancement-input">
                <label>5차</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={enhancement.fifthLevel}
                  onChange={(e) => updateSkillEnhancement(skill.id, 'fifthLevel', Number(e.target.value))}
                  disabled={!enhancementData.fifth}
                />
              </div>
            )}
            
            {enhancementData?.sixth && (
              <div className="enhancement-input">
                <label>6차</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={enhancement.sixthLevel}
                  onChange={(e) => updateSkillEnhancement(skill.id, 'sixthLevel', Number(e.target.value))}
                  disabled={!!isDependentSkill}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="skill-details-grid">
          <div className="skill-stats-section">
            <h4>스킬 정보</h4>
            
            {damageVariants.map((variant, index) => (
              <div key={index} className="damage-variant">
                <div className="variant-header">{variant.label}</div>
                <div className="damage-calculation">
                  <div className="damage-line">
                    <span className="label">기본 퍼뎀:</span>
                    <span className="value">{variant.baseDamage}%</span>
                  </div>
                  {variant.fifthMultiplier > 1 && (
                    <div className="damage-line enhancement">
                      <span className="label">5차 강화:</span>
                      <span className="value">×{variant.fifthMultiplier.toFixed(2)}</span>
                    </div>
                  )}
                  {variant.sixthBonus > 0 && (
                    <div className="damage-line enhancement">
                      <span className="label">6차 강화:</span>
                      <span className="value">+{variant.sixthBonus}%</span>
                    </div>
                  )}
                  <div className="damage-line total">
                    <span className="label">최종 퍼뎀:</span>
                    <span className="value">{variant.enhancedDamage}%</span>
                  </div>
                  <div className="damage-line">
                    <span className="label">타격 수:</span>
                    <span className="value">{variant.hitCount}타</span>
                  </div>
                </div>
              </div>
            ))}
            
            {finalDamageIncrease > 0 && (
              <div className="final-damage-bonus">
                <div className="bonus-header">6차 강화 효과</div>
                <div className="bonus-value">최종 데미지 +{finalDamageIncrease}%</div>
              </div>
            )}
            
            <div className="basic-stats">
              <div className="stat-row">
                <span className="stat-label">최대 대상:</span>
                <span className="stat-value">{skill.maxTargets}마리</span>
              </div>
              
              {skill.cooldown > 0 && (
                <div className="stat-row">
                  <span className="stat-label">쿨타임:</span>
                  <span className="stat-value">{(skill.cooldown / 1000).toFixed(1)}초</span>
                </div>
              )}
              
              {skill.gaugeCharge > 0 && (
                <div className="stat-row">
                  <span className="stat-label">게이지 충전:</span>
                  <span className="stat-value">{skill.gaugeCharge}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-skill-info-panel">
      <div className="panel-header">
        <h2>스킬 정보 & 강화</h2>
        <div className="boss-info">
          <span>보스 Lv.{bossStats.level}</span>
          <span>방어율 {bossStats.defenseRate}%</span>
          <span>속성 저항 {bossStats.elementalResist}%</span>
        </div>
      </div>

      <div className="all-skills-list">
        {LUMINOUS_SKILLS.map(skill => renderSkillDetails(skill))}
      </div>
    </div>
  );
};