// src/components/Settings/CompactSkillInfoPanel.tsx
import React, { useState } from 'react';
import { LUMINOUS_SKILLS } from '../../data/skills';
import { ENHANCEMENT_DATA } from '../../data/enhancements/enhancementData';
import { PREDEFINED_PATTERNS } from '../../data/enhancements/enhancementPatterns';
import { SkillIcon } from '../common/SkillIcon';
import type { CharacterStats, BossStats, SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData } from '../../data/types/skillTypes';

interface CompactSkillInfoPanelProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  skillEnhancements: SkillEnhancement[];
  onSkillEnhancementChange: (enhancements: SkillEnhancement[]) => void;
}

interface TooltipData {
  skill: SkillData;
  enhancement: SkillEnhancement;
  x: number;
  y: number;
}

export const CompactSkillInfoPanel: React.FC<CompactSkillInfoPanelProps> = ({
  bossStats,
  skillEnhancements,
  onSkillEnhancementChange
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillData>(LUMINOUS_SKILLS[0]); // 첫 번째 스킬을 기본 선택
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

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
  const calculateEnhancedDamage = (skill: SkillData): {
    baseDamage: number;
    enhancedDamage: number;
    fifthMultiplier: number;
    sixthBonus: number;
  } => {
    const enhancement = getSkillEnhancement(skill.id);
    const enhancementData = ENHANCEMENT_DATA[skill.id];
    
    let baseDamage = skill.damage || 0;
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

  // 최종 데미지 증가량 계산
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

  // 스킬 선택 이벤트
  const handleSkillSelect = (skill: SkillData) => {
    setSelectedSkill(skill);
    setEditingSkill(null); // 편집 모드 해제
  };

  // 편집 모드 토글 (더블클릭으로 변경)
  const handleSkillDoubleClick = (skillId: string) => {
    setEditingSkill(editingSkill === skillId ? null : skillId);
  };

  // 종속 스킬인지 확인
  const isDependentSkill = (skillId: string): boolean => {
    const enhancementData = ENHANCEMENT_DATA[skillId];
    return !!enhancementData?.sixth?.dependsOn;
  };

  return (
    <div className="compact-skill-info-panel">
      <div className="panel-header">
        <h2>스킬 강화</h2>
        <div className="boss-info">
          <span>보스 Lv.{bossStats.level}</span>
          <span>방어율 {bossStats.defenseRate}%</span>
          <span>속성 저항 {bossStats.elementalResist}%</span>
        </div>
      </div>

      {/* 스킬 그리드 */}
      <div className="skills-grid">
        {LUMINOUS_SKILLS.map(skill => {
          const enhancement = getSkillEnhancement(skill.id);
          const isEditing = editingSkill === skill.id;
          const isDependent = isDependentSkill(skill.id);
          const isSelected = selectedSkill.id === skill.id;
          
          return (
            <div key={skill.id} className="skill-card-container">
              {/* 스킬 카드 */}
              <div
                className={`skill-card ${skill.element.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSkillSelect(skill)}
                onDoubleClick={() => handleSkillDoubleClick(skill.id)}
              >
                <SkillIcon 
                  skill={skill} 
                  size="large"
                  className="skill-card-icon"
                />
                
                {/* 강화 레벨 표시 */}
                <div className="enhancement-levels">
                  <span className="fifth-level">{enhancement.fifthLevel}</span>
                  <span className="sixth-level">{enhancement.sixthLevel}</span>
                </div>

                {/* 종속 스킬 표시 */}
                {isDependent && (
                  <div className="dependent-indicator">🔗</div>
                )}
              </div>

              {/* 인라인 편집 */}
              {isEditing && (
                <div className="inline-editor">
                  <div className="editor-header">{skill.name}</div>
                  <div className="editor-controls">
                    <div className="control-row">
                      <span className="control-label">5차:</span>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={enhancement.fifthLevel}
                        onChange={(e) => updateSkillEnhancement(skill.id, 'fifthLevel', Number(e.target.value))}
                        className="level-input"
                      />
                    </div>
                    <div className="control-row">
                      <span className="control-label">6차:</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={enhancement.sixthLevel}
                        onChange={(e) => updateSkillEnhancement(skill.id, 'sixthLevel', Number(e.target.value))}
                        className="level-input"
                        disabled={isDependent}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 선택된 스킬 상세 정보 패널 */}
      <div className="skill-detail-panel">
        <div className="detail-header">
          <SkillIcon 
            skill={selectedSkill} 
            size="large" 
            className="detail-skill-icon"
          />
          <div className="detail-title-info">
            <h3 className="detail-skill-name">{selectedSkill.name}</h3>
            <div className="detail-skill-meta">
              <span className={`element-badge ${selectedSkill.element.toLowerCase()}`}>
                {selectedSkill.element === 'NONE' ? '무속성' : 
                 selectedSkill.element === 'LIGHT' ? '빛' :
                 selectedSkill.element === 'DARK' ? '어둠' : '이퀼리브리엄'}
              </span>
              <span className="category-badge">
                {selectedSkill.category === 'direct_attack' ? '직접 공격' :
                 selectedSkill.category === 'indirect_attack' ? '간접 공격' :
                 selectedSkill.category === 'summon' ? '소환' :
                 selectedSkill.category === 'active_buff' ? '액티브 버프' : '즉발형'}
              </span>
              {selectedSkill.isEquilibriumSkill && (
                <span className="equilibrium-badge">이퀼 스킬</span>
              )}
              {isDependentSkill(selectedSkill.id) && (
                <span className="dependent-badge">종속 스킬</span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h4>기본 정보</h4>
            <div className="detail-grid">
              {(() => {
                const calc = calculateEnhancedDamage(selectedSkill);
                return (
                  <>
                    {selectedSkill.damage && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">기본 퍼뎀:</span>
                          <span className="detail-value">{selectedSkill.damage}%</span>
                        </div>
                        {calc.enhancedDamage !== calc.baseDamage && (
                          <div className="detail-item">
                            <span className="detail-label">강화 퍼뎀:</span>
                            <span className="detail-value enhanced">{calc.enhancedDamage}%</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedSkill.hitCount && (
                      <div className="detail-item">
                        <span className="detail-label">타격 수:</span>
                        <span className="detail-value">{selectedSkill.hitCount}타</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <span className="detail-label">최대 대상:</span>
                      <span className="detail-value">{selectedSkill.maxTargets}마리</span>
                    </div>

                    {selectedSkill.cooldown > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">쿨타임:</span>
                        <span className="detail-value">{(selectedSkill.cooldown / 1000).toFixed(1)}초</span>
                      </div>
                    )}

                    {selectedSkill.actionDelay && (
                      <div className="detail-item">
                        <span className="detail-label">액션 딜레이:</span>
                        <span className="detail-value">{selectedSkill.actionDelay}ms</span>
                      </div>
                    )}

                    {selectedSkill.gaugeCharge > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">게이지 충전:</span>
                        <span className="detail-value">{selectedSkill.gaugeCharge}</span>
                      </div>
                    )}

                    {selectedSkill.summonDuration && (
                      <div className="detail-item">
                        <span className="detail-label">소환 지속:</span>
                        <span className="detail-value">{(selectedSkill.summonDuration / 1000).toFixed(1)}초</span>
                      </div>
                    )}

                    {selectedSkill.duration && (
                      <div className="detail-item">
                        <span className="detail-label">버프 지속:</span>
                        <span className="detail-value">{(selectedSkill.duration / 1000).toFixed(1)}초</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="detail-section">
            <h4>강화 정보</h4>
            <div className="enhancement-detail">
              {(() => {
                const enhancement = getSkillEnhancement(selectedSkill.id);
                const finalDamage = getFinalDamageIncrease(selectedSkill.id);
                
                return (
                  <div className="enhancement-grid">
                    <div className="enhancement-item">
                      <span className="enhancement-type">5차 강화:</span>
                      <span className="enhancement-value fifth">{enhancement.fifthLevel}레벨</span>
                    </div>
                    <div className="enhancement-item">
                      <span className="enhancement-type">6차 강화:</span>
                      <span className="enhancement-value sixth">{enhancement.sixthLevel}레벨</span>
                    </div>
                    {finalDamage > 0 && (
                      <div className="enhancement-item final">
                        <span className="enhancement-type">최종 데미지:</span>
                        <span className="enhancement-value final">+{finalDamage}%</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              <div className="enhancement-edit-hint">
                💡 더블클릭으로 강화 레벨 수정
              </div>
            </div>
          </div>

          {selectedSkill.description && (
            <div className="detail-section">
              <h4>스킬 설명</h4>
              <p className="skill-description">{selectedSkill.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 인라인 편집기 */}
      {editingSkill && (
        (() => {
          const editingSkillData = LUMINOUS_SKILLS.find(s => s.id === editingSkill);
          const enhancement = getSkillEnhancement(editingSkill);
          const isDependent = isDependentSkill(editingSkill);
          
          return editingSkillData ? (
            <div className="inline-editor-overlay">
              <div className="inline-editor">
                <div className="editor-header">{editingSkillData.name} 강화</div>
                <div className="editor-controls">
                  <div className="control-row">
                    <span className="control-label">5차:</span>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={enhancement.fifthLevel}
                      onChange={(e) => updateSkillEnhancement(editingSkill, 'fifthLevel', Number(e.target.value))}
                      className="level-input"
                    />
                  </div>
                  <div className="control-row">
                    <span className="control-label">6차:</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={enhancement.sixthLevel}
                      onChange={(e) => updateSkillEnhancement(editingSkill, 'sixthLevel', Number(e.target.value))}
                      className="level-input"
                      disabled={isDependent}
                    />
                  </div>
                  {isDependent && (
                    <div className="dependent-note">
                      ⚠️ 다른 스킬에 종속됨
                    </div>
                  )}
                </div>
                <div className="editor-actions">
                  <button 
                    className="close-button"
                    onClick={() => setEditingSkill(null)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          ) : null;
        })()
      )}
    </div>
  );
};