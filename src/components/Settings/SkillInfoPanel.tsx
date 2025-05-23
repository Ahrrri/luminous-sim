// src/components/Settings/SkillInfoPanel.tsx
import React from 'react';
import { LUMINOUS_SKILLS, getSkillsByCategory } from '../../data/skills';
import type { CharacterStats, BossStats, SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData } from '../../data/types/skillTypes';

interface SkillInfoPanelProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  skillEnhancements: SkillEnhancement[];
}

export const SkillInfoPanel: React.FC<SkillInfoPanelProps> = ({
  characterStats,
  bossStats,
  skillEnhancements
}) => {
  
  // 스킬별 강화 정보 가져오기
  const getSkillEnhancement = (skillId: string): SkillEnhancement => {
    return skillEnhancements.find(e => e.skillId === skillId) || {
      skillId,
      fifthLevel: 0,
      sixthLevel: 0
    };
  };

  // 스킬 퍼뎀 계산
  const calculateSkillDamage = (skill: SkillData, damageType?: string): number => {
    const enhancement = getSkillEnhancement(skill.id);
    
    // 기본 퍼뎀 결정
    let baseDamage = skill.damage;
    if (damageType === 'sunfire' && skill.damageSunfire) baseDamage = skill.damageSunfire;
    else if (damageType === 'eclipse' && skill.damageEclipse) baseDamage = skill.damageEclipse;
    else if (damageType === 'equilibrium' && skill.damageEquilibrium) baseDamage = skill.damageEquilibrium;
    
    let finalDamage = baseDamage;
    
    // 5차 강화: 레벨당 2% 증가
    finalDamage *= (1 + (enhancement.fifthLevel * 0.02));
    
    // 6차 강화: 레벨당 3% 증가
    finalDamage *= (1 + (enhancement.sixthLevel * 0.03));
    
    return Math.floor(finalDamage);
  };

  // 예상 데미지 계산 (간단 버전)
  const calculateExpectedDamage = (skill: SkillData, damageType?: string): number => {
    const skillDamage = calculateSkillDamage(skill, damageType);
    const { int, luk, magicAttack, damagePercent, bossDamage, critRate, critDamage, weaponConstant, mastery } = characterStats;
    
    // 기본 공격력 계산 (간단화된 버전)
    const statAttack = (int * 4 + luk) * 0.01;
    const weaponAttack = magicAttack;
    const totalAttack = (statAttack + weaponAttack) * weaponConstant / 100;
    
    // 데미지 계산
    let damage = totalAttack * skillDamage / 100;
    
    // 데미지% 적용
    damage *= (1 + damagePercent / 100);
    
    // 보스 데미지% 적용
    damage *= (1 + bossDamage / 100);
    
    // 숙련도 적용 (최소 데미지)
    const minDamage = damage * mastery / 100;
    const maxDamage = damage;
    const avgDamage = (minDamage + maxDamage) / 2;
    
    // 크리티컬 고려
    const critMultiplier = (1 + (critRate / 100) * (critDamage / 100));
    
    // 타수 계산
    let hitCount = skill.hitCount;
    if (damageType === 'sunfire' && skill.hitCountSunfire) hitCount = skill.hitCountSunfire;
    else if (damageType === 'eclipse' && skill.hitCountEclipse) hitCount = skill.hitCountEclipse;
    else if (damageType === 'equilibrium' && skill.hitCountEquilibrium) hitCount = skill.hitCountEquilibrium;
    
    return Math.floor(avgDamage * critMultiplier * hitCount);
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const skillCategories = [
    { name: '빛 스킬', skills: getSkillsByCategory('light'), color: '#ffc107' },
    { name: '어둠 스킬', skills: getSkillsByCategory('dark'), color: '#7e57c2' },
    { name: '이퀼리브리엄 스킬', skills: getSkillsByCategory('equilibrium'), color: '#42a5f5' },
    { name: '버프/기타 스킬', skills: getSkillsByCategory('buff'), color: '#10b981' },
  ];

  // 스킬 상세 정보 렌더링
  const renderSkillDetails = (skill: SkillData) => {
    const enhancement = getSkillEnhancement(skill.id);
    
    // 다양한 상태별 데미지 계산
    const damageVariants = [];
    
    if (skill.damage > 0) {
      damageVariants.push({ 
        label: '기본', 
        damage: calculateSkillDamage(skill),
        expectedDamage: calculateExpectedDamage(skill),
        hitCount: skill.hitCount
      });
    }
    
    if (skill.damageSunfire) {
      damageVariants.push({ 
        label: '선파이어', 
        damage: calculateSkillDamage(skill, 'sunfire'),
        expectedDamage: calculateExpectedDamage(skill, 'sunfire'),
        hitCount: skill.hitCountSunfire || skill.hitCount
      });
    }
    
    if (skill.damageEclipse) {
      damageVariants.push({ 
        label: '이클립스', 
        damage: calculateSkillDamage(skill, 'eclipse'),
        expectedDamage: calculateExpectedDamage(skill, 'eclipse'),
        hitCount: skill.hitCountEclipse || skill.hitCount
      });
    }
    
    if (skill.damageEquilibrium) {
      damageVariants.push({ 
        label: '이퀼리브리엄', 
        damage: calculateSkillDamage(skill, 'equilibrium'),
        expectedDamage: calculateExpectedDamage(skill, 'equilibrium'),
        hitCount: skill.hitCountEquilibrium || skill.hitCount
      });
    }

    return (
      <div key={skill.id} className="skill-item">
        <div className="skill-header">
          <div className="skill-basic-info">
            <span className="skill-icon">{skill.icon}</span>
            <span className="skill-name">{skill.name}</span>
            {skill.isEquilibriumSkill && (
              <span className="equilibrium-badge">이퀼 스킬</span>
            )}
          </div>
          <div className="skill-enhancement">
            <span className="enhancement-badge fifth">
              5차: {enhancement.fifthLevel}
            </span>
            <span className="enhancement-badge sixth">
              6차: {enhancement.sixthLevel}
            </span>
          </div>
        </div>
        
        <div className="skill-stats">
          {damageVariants.map((variant, index) => (
            <div key={index} className="damage-variant">
              <div className="variant-header">{variant.label}</div>
              <div className="stat-row">
                <span className="stat-label">강화 퍼뎀:</span>
                <span className="stat-value enhanced">{variant.damage}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">타격 수:</span>
                <span className="stat-value">{variant.hitCount}타</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">예상 데미지:</span>
                <span className="stat-value">{formatNumber(variant.expectedDamage)}</span>
              </div>
            </div>
          ))}
          
          <div className="stat-row">
            <span className="stat-label">최대 대상:</span>
            <span className="stat-value">{skill.maxTargets}마리</span>
          </div>
          
          {skill.gaugeCharge > 0 && (
            <div className="stat-row">
              <span className="stat-label">게이지 충전:</span>
              <span className="stat-value">
                {skill.gaugeCharge}
                {skill.gaugeChargeVI && ` (VI: ${skill.gaugeChargeVI})`}
              </span>
            </div>
          )}
          
          {skill.cooldown > 0 && (
            <div className="stat-row">
              <span className="stat-label">쿨타임:</span>
              <span className="stat-value">
                {(skill.cooldown / 1000).toFixed(1)}초
                {skill.cooldownVI && ` (VI: ${(skill.cooldownVI / 1000).toFixed(1)}초)`}
              </span>
            </div>
          )}
          
          {skill.additionalCritRate && (
            <div className="stat-row">
              <span className="stat-label">추가 크리티컬:</span>
              <span className="stat-value">{skill.additionalCritRate}%</span>
            </div>
          )}
          
          {skill.additionalIgnoreDefense && (
            <div className="stat-row">
              <span className="stat-label">추가 방무:</span>
              <span className="stat-value">
                {skill.additionalIgnoreDefense}%
                {skill.additionalIgnoreDefenseVI && ` (VI: ${skill.additionalIgnoreDefenseVI}%)`}
              </span>
            </div>
          )}
          
          {skill.duration && (
            <div className="stat-row">
              <span className="stat-label">지속시간:</span>
              <span className="stat-value">{(skill.duration / 1000).toFixed(1)}초</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="skill-info-panel">
      <div className="panel-header">
        <h2>스킬 정보</h2>
        <div className="boss-info">
          <span>보스 Lv.{bossStats.level}</span>
          <span>방어율 {bossStats.defenseRate}%</span>
          <span>속성 저항 {bossStats.elementalResist}%</span>
        </div>
      </div>

      <div className="skill-categories">
        {skillCategories.map(category => (
          <div key={category.name} className="skill-category">
            <h3 
              className="category-title"
              style={{ borderLeftColor: category.color }}
            >
              {category.name}
            </h3>
            
            <div className="skills-list">
              {category.skills.map(skill => renderSkillDetails(skill))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};