// src/components/Settings/CompactSkillInfoPanel.tsx
import React, { useState } from 'react';
import { LUMINOUS_SKILLS } from '../../data/skills';
import { ENHANCEMENT_DATA } from '../../data/enhancements/enhancementData';
import { SkillIcon } from '../common/SkillIcon';
import type { CharacterStats, BossStats, SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData } from '../../data/types/skillTypes';

interface CompactSkillInfoPanelProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  skillEnhancements: SkillEnhancement[];
  onSkillEnhancementChange: (enhancements: SkillEnhancement[]) => void;
}

// TooltipData 제거 - 사용하지 않음

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

  const updateSkillEnhancement = (skillId: string, field: 'fifthLevel' | 'sixthLevel', value: number) => {
    // 1. 현재 스킬과 종속될 스킬들의 ID를 미리 수집
    const skillsToUpdate = [skillId];
    
    if (field === 'sixthLevel') {
      Object.entries(ENHANCEMENT_DATA).forEach(([dependentSkillId, data]) => {
        if (data.dependsOn === skillId) {
          skillsToUpdate.push(dependentSkillId);
        }
      });
    }
    
    // 2. 업데이트할 모든 스킬들을 제거
    const updatedEnhancements = skillEnhancements.filter(e => !skillsToUpdate.includes(e.skillId));
    
    // 3. 현재 스킬 업데이트
    const currentEnhancement = getSkillEnhancement(skillId);
    updatedEnhancements.push({
      ...currentEnhancement,
      [field]: value
    });
    
    // 4. 종속 스킬들 업데이트
    if (field === 'sixthLevel') {
      Object.entries(ENHANCEMENT_DATA).forEach(([dependentSkillId, data]) => {
        if (data.dependsOn === skillId) {
          const dependentEnhancement = getSkillEnhancement(dependentSkillId);
          updatedEnhancements.push({
            ...dependentEnhancement,
            sixthLevel: value
          });
        }
      });
    }
    
    onSkillEnhancementChange(updatedEnhancements);
  };

  // 강화된 스킬 데미지 계산
  const calculateEnhancedDamage = (skill: SkillData): {
    baseDamage: number;
    enhancedDamage: number;
    fifthMultiplier: number;
    sixthBonus: number;
    affectedByOthers: number;
  } => {
    const enhancement = getSkillEnhancement(skill.id);
    const enhancementData = ENHANCEMENT_DATA[skill.id];
    
    let baseDamage = skill.damage || 0;
    let fifthMultiplier = 1;
    let sixthBonus = 0;
    let affectedByOthers = 0;
    
    // 5차 강화 효과 - 배열에서 직접 가져오기
    if (enhancementData?.fifth && enhancement.fifthLevel > 0 && skill.canEnhanceFifth !== false) {
      const fifthData = enhancementData.fifth[enhancement.fifthLevel];
      if (fifthData) {
        fifthMultiplier = fifthData / 100; // 120 → 1.2
      }
    }
    
    // 6차 강화 효과 - 타입 안전하게 처리
    if (enhancementData?.sixth && enhancement.sixthLevel > 0 && skill.canEnhanceSixth !== false) {
      const sixthData = enhancementData.sixth;
      
      // 스킬 데이터 오버라이드 타입인 경우
      if (typeof sixthData === 'object' && !Array.isArray(sixthData) && 'damage' in sixthData) {
        const damageArray = sixthData.damage;
        if (Array.isArray(damageArray)) {
          const overrideDamage = damageArray[enhancement.sixthLevel];
          if (overrideDamage !== null && overrideDamage !== undefined) {
            baseDamage = overrideDamage;
          }
        }
      }
      
      // 최종 데미지 증가가 배열로 있는 경우 (세례, 퍼니싱 등)
      if (Array.isArray(sixthData) && sixthData[enhancement.sixthLevel] !== undefined) {
        sixthBonus = sixthData[enhancement.sixthLevel];
      }
    }
    
    // 다른 스킬의 영향 계산 (affectsOtherSkills)
    Object.entries(ENHANCEMENT_DATA).forEach(([sourceSkillId, sourceData]) => {
      const sourceEnhancement = getSkillEnhancement(sourceSkillId);
      if (sourceEnhancement.sixthLevel > 0 && sourceData.sixth) {
        const sixthData = sourceData.sixth;
        
        // affectsOtherSkills가 있는지 타입 안전하게 확인
        if (typeof sixthData === 'object' && !Array.isArray(sixthData) && 'affectsOtherSkills' in sixthData) {
          const affects = sixthData.affectsOtherSkills;
          if (affects && affects[skill.id]) {
            const skillEffect = affects[skill.id];
            if (skillEffect.damageIncrease && Array.isArray(skillEffect.damageIncrease)) {
              const increase = skillEffect.damageIncrease[sourceEnhancement.sixthLevel];
              if (increase !== null && increase !== undefined) {
                affectedByOthers += increase;
              }
            }
          }
        }
      }
    });
    
    const enhancedDamage = Math.floor(baseDamage * fifthMultiplier * (1 + sixthBonus / 100) * (1 + affectedByOthers / 100));
    
    return {
      baseDamage,
      enhancedDamage,
      fifthMultiplier,
      sixthBonus,
      affectedByOthers
    };
  };

  // 최종 데미지 증가량 계산
  const getFinalDamageIncrease = (skillId: string): number => {
    const skill = LUMINOUS_SKILLS.find(s => s.id === skillId);
    if (!skill || skill.canEnhanceSixth === false) return 0;

    const enhancement = getSkillEnhancement(skillId);
    const enhancementData = ENHANCEMENT_DATA[skillId];
    
    // 6차 강화가 배열 형태로 최종 데미지를 제공하는 경우
    if (enhancementData?.sixth && Array.isArray(enhancementData.sixth) && enhancement.sixthLevel > 0) {
      return enhancementData.sixth[enhancement.sixthLevel] || 0;
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
    return !!enhancementData?.dependsOn;
  };

  // 강화 가능 여부 확인
  const canEnhanceLevel = (skill: SkillData, level: 'fifth' | 'sixth'): boolean => {
    if (level === 'fifth') {
      return skill.canEnhanceFifth !== false;
    } else {
      return skill.canEnhanceSixth !== false;
    }
  };

  // 표시할 강화 레벨 결정 (강화 불가능하면 '-' 표시)
  const getDisplayLevel = (skill: SkillData, enhancement: SkillEnhancement, level: 'fifth' | 'sixth'): string => {
    if (!canEnhanceLevel(skill, level)) {
      return '-';
    }
    return level === 'fifth' ? enhancement.fifthLevel.toString() : enhancement.sixthLevel.toString();
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
                  <span className={`fifth-level ${!canEnhanceLevel(skill, 'fifth') ? 'disabled' : ''}`}>
                    {getDisplayLevel(skill, enhancement, 'fifth')}
                  </span>
                  <span className={`sixth-level ${!canEnhanceLevel(skill, 'sixth') ? 'disabled' : ''}`}>
                    {getDisplayLevel(skill, enhancement, 'sixth')}
                  </span>
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
                        disabled={!canEnhanceLevel(skill, 'fifth')}
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
                        disabled={!canEnhanceLevel(skill, 'sixth') || isDependent}
                      />
                    </div>
                    {!canEnhanceLevel(skill, 'fifth') && !canEnhanceLevel(skill, 'sixth') && (
                      <div className="no-enhancement-note">
                        ⚠️ 강화 불가능한 스킬
                      </div>
                    )}
                    {isDependent && canEnhanceLevel(skill, 'sixth') && (
                      <div className="dependent-note">
                        🔗 다른 스킬에 종속됨
                      </div>
                    )}
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
              {!canEnhanceLevel(selectedSkill, 'fifth') && !canEnhanceLevel(selectedSkill, 'sixth') && (
                <span className="no-enhancement-badge">강화 불가</span>
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
                        {calc.enhancedDamage !== calc.baseDamage && (canEnhanceLevel(selectedSkill, 'fifth') || canEnhanceLevel(selectedSkill, 'sixth')) && (
                          <div className="detail-item">
                            <span className="detail-label">강화 퍼뎀:</span>
                            <span className="detail-value enhanced">{calc.enhancedDamage}%</span>
                          </div>
                        )}
                        {calc.affectedByOthers > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">타 스킬 영향:</span>
                            <span className="detail-value enhanced">+{calc.affectedByOthers}%</span>
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
                const canFifth = canEnhanceLevel(selectedSkill, 'fifth');
                const canSixth = canEnhanceLevel(selectedSkill, 'sixth');
                
                if (!canFifth && !canSixth) {
                  return (
                    <div className="no-enhancement-info">
                      <div className="no-enhancement-message">
                        ⚠️ 이 스킬은 강화가 불가능합니다.
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="enhancement-grid">
                    {canFifth && (
                      <div className="enhancement-item">
                        <span className="enhancement-type">5차 강화:</span>
                        <span className="enhancement-value fifth">{enhancement.fifthLevel}레벨</span>
                      </div>
                    )}
                    {canSixth && (
                      <div className="enhancement-item">
                        <span className="enhancement-type">6차 강화:</span>
                        <span className="enhancement-value sixth">{enhancement.sixthLevel}레벨</span>
                      </div>
                    )}
                    {finalDamage > 0 && (
                      <div className="enhancement-item final">
                        <span className="enhancement-type">최종 데미지:</span>
                        <span className="enhancement-value final">+{finalDamage}%</span>
                      </div>
                    )}
                    {isDependentSkill(selectedSkill.id) && (
                      <div className="dependent-info">
                        <span className="dependent-note">
                          🔗 이 스킬의 6차 강화는 다른 스킬을 따라갑니다.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {(canEnhanceLevel(selectedSkill, 'fifth') || canEnhanceLevel(selectedSkill, 'sixth')) && (
                <div className="enhancement-edit-hint">
                  💡 더블클릭으로 강화 레벨 수정
                </div>
              )}
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
                      disabled={!canEnhanceLevel(editingSkillData, 'fifth')}
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
                      disabled={!canEnhanceLevel(editingSkillData, 'sixth') || isDependent}
                    />
                  </div>
                  {!canEnhanceLevel(editingSkillData, 'fifth') && !canEnhanceLevel(editingSkillData, 'sixth') && (
                    <div className="no-enhancement-note">
                      ⚠️ 강화 불가능한 스킬
                    </div>
                  )}
                  {isDependent && canEnhanceLevel(editingSkillData, 'sixth') && (
                    <div className="dependent-note">
                      🔗 다른 스킬에 종속됨
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