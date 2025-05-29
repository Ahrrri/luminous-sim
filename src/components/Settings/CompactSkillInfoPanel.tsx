// src/components/Settings/CompactSkillInfoPanel.tsx
import React, { useState, useMemo } from 'react';
import { LUMINOUS_SKILLS } from '../../data/skills';
import { ENHANCEMENT_DATA } from '../../data/enhancements/enhancementData';
import { SkillIcon } from '../common/SkillIcon';
import { useECS } from '../../hooks/useECS';
import { 
  StatsComponent, 
  EnhancementComponent, 
  TimeComponent, 
  DamageComponent,
  StateComponent,
  GaugeComponent,
  SkillComponent,
  BuffComponent,
  ActionDelayComponent
} from '../../ecs/components';
import { DamageSystem } from '../../ecs/systems/DamageSystem';
import type { CharacterStats, BossStats, SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData } from '../../data/types/skillTypes';
import type { EnhancementSettings } from '../../data/enhancements/types';
import './CompactSkillInfoPanel.css';

interface CompactSkillInfoPanelProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  skillEnhancements: SkillEnhancement[];
  onSkillEnhancementChange: (enhancements: SkillEnhancement[]) => void;
}

export const CompactSkillInfoPanel: React.FC<CompactSkillInfoPanelProps> = ({
  characterStats,
  bossStats,
  skillEnhancements,
  onSkillEnhancementChange
}) => {
  const { world } = useECS();
  const [selectedSkill, setSelectedSkill] = useState<SkillData>(LUMINOUS_SKILLS[0]);
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
    const skillsToUpdate = [skillId];
    
    if (field === 'sixthLevel') {
      Object.entries(ENHANCEMENT_DATA).forEach(([dependentSkillId, data]) => {
        if (data.dependsOn === skillId) {
          skillsToUpdate.push(dependentSkillId);
        }
      });
    }
    
    const updatedEnhancements = skillEnhancements.filter(e => !skillsToUpdate.includes(e.skillId));
    
    const currentEnhancement = getSkillEnhancement(skillId);
    updatedEnhancements.push({
      ...currentEnhancement,
      [field]: value
    });
    
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

  // Mock Entity를 사용한 실제 ECS 계산
  const calculateWithECS = useMemo(() => {
    if (!selectedSkill.damage) {
      return {
        hasData: false,
        finalDamage: 0,
        totalDamage: 0,
        hitCount: 1,
        calculationSteps: []
      };
    }

    // 1. 임시 Entity 생성
    const mockEntity = world.createEntity();
    
    try {
      // 2. Enhancement Settings 변환
      const enhancementSettings: EnhancementSettings = {};
      skillEnhancements.forEach(e => {
        enhancementSettings[e.skillId] = {
          fifthLevel: e.fifthLevel,
          sixthLevel: e.sixthLevel
        };
      });

      // 3. 필요한 컴포넌트들 추가
      const mockStats = new StatsComponent(characterStats);
      const mockEnhancement = new EnhancementComponent(enhancementSettings);
      const mockTime = new TimeComponent();
      const mockDamage = new DamageComponent();
      const mockState = new StateComponent('LIGHT'); // 기본 빛 상태
      const mockGauge = new GaugeComponent();
      const mockBuff = new BuffComponent();
      const mockActionDelay = new ActionDelayComponent();
      
      // ECS 스킬 데이터 변환
      const ecsSkillData = {
        id: selectedSkill.id,
        name: selectedSkill.name,
        cooldown: 0,
        maxCooldown: selectedSkill.cooldown,
        isAvailable: true
      };
      const mockSkill = new SkillComponent([ecsSkillData], characterStats);

      world.addComponent(mockEntity, mockStats);
      world.addComponent(mockEntity, mockEnhancement);
      world.addComponent(mockEntity, mockTime);
      world.addComponent(mockEntity, mockDamage);
      world.addComponent(mockEntity, mockState);
      world.addComponent(mockEntity, mockGauge);
      world.addComponent(mockEntity, mockBuff);
      world.addComponent(mockEntity, mockActionDelay);
      world.addComponent(mockEntity, mockSkill);

      // 4. 강화된 스킬 데이터 가져오기
      const enhancedSkillData = mockEnhancement.getEnhancedSkillData(selectedSkill);
      const appliedEnhancement = mockEnhancement.getAppliedEnhancement(selectedSkill.id);
      
      // 5. 실제 ECS 시스템으로 데미지 계산
      const damageSystem = world.getSystem<DamageSystem>('DamageSystem');
      let totalDamage = 0;
      
      if (damageSystem) {
        totalDamage = damageSystem.calculateAndApplyDamage(
          mockEntity,
          selectedSkill.id,
          enhancedSkillData.damage || 0,
          enhancedSkillData.hitCount || 1,
          enhancedSkillData.maxTargets,
        );
      }

      // 6. 계산 단계 분석
      const calculationSteps = [];
      
      // 기본 퍼뎀
      calculationSteps.push({
        label: '기본 퍼뎀',
        value: `${selectedSkill.damage}%`,
        type: 'base'
      });

      // 6차 Override 확인
      if (appliedEnhancement?.overriddenSkillData?.damage) {
        calculationSteps.push({
          label: '6차 Override',
          value: `${appliedEnhancement.overriddenSkillData.damage}%`,
          note: '(기본값 대체)',
          type: 'override'
        });
      }

      // 5차 강화
      if (appliedEnhancement && appliedEnhancement.fifthMultiplier !== 1) {
        const afterFifth = Math.floor((appliedEnhancement.overriddenSkillData?.damage || selectedSkill.damage || 0) * appliedEnhancement.fifthMultiplier);
        calculationSteps.push({
          label: '5차 강화',
          value: `×${appliedEnhancement.fifthMultiplier.toFixed(1)}`,
          note: `= ${afterFifth}%`,
          type: 'fifth'
        });
      }

      // 다른 스킬 영향 (affectsOtherSkills)
      const otherSkillBonus = mockEnhancement.getAffectedSkillBonus(selectedSkill.id);
      if (otherSkillBonus > 0) {
        calculationSteps.push({
          label: '타 스킬 영향',
          value: `+${otherSkillBonus}%`,
          type: 'other'
        });
      }

      // 최종 데미지 보너스
      const finalDamageBonus = mockEnhancement.getFinalDamageIncrease(selectedSkill.id);
      if (finalDamageBonus > 0) {
        calculationSteps.push({
          label: '최종 데미지',
          value: `+${finalDamageBonus}%`,
          type: 'final'
        });
      }

      return {
        hasData: true,
        finalDamage: enhancedSkillData.damage || 0,
        totalDamage,
        hitCount: enhancedSkillData.hitCount || 1,
        calculationSteps,
        appliedEnhancement
      };

    } finally {
      // 7. 임시 Entity 정리 (중요!)
      world.destroyEntity(mockEntity);
    }
  }, [selectedSkill, skillEnhancements, characterStats, world]);

  const isDependentSkill = (skillId: string): boolean => {
    const enhancementData = ENHANCEMENT_DATA[skillId];
    return !!enhancementData?.dependsOn;
  };

  const canEnhanceLevel = (skill: SkillData, level: 'fifth' | 'sixth'): boolean => {
    if (level === 'fifth') {
      return skill.canEnhanceFifth !== false;
    } else {
      return skill.canEnhanceSixth !== false;
    }
  };

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

      {/* 컴팩트한 스킬 그리드 */}
      <div className="compact-skills-grid">
        {LUMINOUS_SKILLS.map(skill => {
          const enhancement = getSkillEnhancement(skill.id);
          const isSelected = selectedSkill.id === skill.id;
          const isDependent = isDependentSkill(skill.id);
          
          return (
            <div
              key={skill.id}
              className={`compact-skill-card ${skill.element.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedSkill(skill)}
              onDoubleClick={() => setEditingSkill(skill.id)}
            >
              <SkillIcon skill={skill} size="medium" />
              <div className="skill-levels">
                <span className={`level-badge fifth ${!canEnhanceLevel(skill, 'fifth') ? 'disabled' : ''}`}>
                  {getDisplayLevel(skill, enhancement, 'fifth')}
                </span>
                <span className={`level-badge sixth ${!canEnhanceLevel(skill, 'sixth') ? 'disabled' : ''}`}>
                  {getDisplayLevel(skill, enhancement, 'sixth')}
                </span>
              </div>
              {isDependent && <div className="dependent-icon">🔗</div>}
            </div>
          );
        })}
      </div>

      {/* 선택된 스킬의 상세 계산 (ECS 기반) */}
      <div className="skill-calculation-panel">
        <div className="calc-header">
          <SkillIcon skill={selectedSkill} size="medium" />
          <div className="skill-title">
            <h3>{selectedSkill.name}</h3>
            <div className="skill-badges">
              <span className={`element-badge ${selectedSkill.element.toLowerCase()}`}>
                {selectedSkill.element === 'LIGHT' ? '빛' : 
                 selectedSkill.element === 'DARK' ? '어둠' : 
                 selectedSkill.element === 'EQUILIBRIUM' ? '이퀼' : '무속성'}
              </span>
              {selectedSkill.isEquilibriumSkill && <span className="eq-badge">이퀼 스킬</span>}
            </div>
          </div>
          <div className="enhancement-controls">
            {canEnhanceLevel(selectedSkill, 'fifth') && (
              <div className="control-group">
                <label>5차</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={getSkillEnhancement(selectedSkill.id).fifthLevel}
                  onChange={(e) => updateSkillEnhancement(selectedSkill.id, 'fifthLevel', Number(e.target.value))}
                />
              </div>
            )}
            {canEnhanceLevel(selectedSkill, 'sixth') && (
              <div className="control-group">
                <label>6차</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={getSkillEnhancement(selectedSkill.id).sixthLevel}
                  onChange={(e) => updateSkillEnhancement(selectedSkill.id, 'sixthLevel', Number(e.target.value))}
                  disabled={isDependentSkill(selectedSkill.id)}
                />
              </div>
            )}
          </div>
        </div>

        {calculateWithECS.hasData ? (
          <div className="damage-calculation">
            <div className="calc-steps">
              {calculateWithECS.calculationSteps.map((step, index) => (
                <div key={index} className={`calc-step ${step.type}`}>
                  <span className="step-label">{step.label}:</span>
                  <span className="step-value">{step.value}</span>
                  {step.note && <span className="step-note">{step.note}</span>}
                </div>
              ))}
            </div>
            
            <div className="calc-result">
              <div className="result-row">
                <span className="result-label">최종 퍼뎀:</span>
                <span className="result-value primary">{calculateWithECS.finalDamage}%</span>
              </div>
              {calculateWithECS.hitCount > 1 && (
                <div className="result-row">
                  <span className="result-label">총 데미지:</span>
                  <span className="result-value secondary">
                    {calculateWithECS.finalDamage}% × {calculateWithECS.hitCount}타 = {calculateWithECS.totalDamage.toLocaleString()}%
                  </span>
                </div>
              )}
              <div className="result-row">
                <span className="result-label">ECS 계산 결과:</span>
                <span className="result-value tertiary">{calculateWithECS.totalDamage.toLocaleString()}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-damage-info">
            <p>이 스킬은 데미지가 없는 버프/유틸리티 스킬입니다.</p>
            {selectedSkill.duration && (
              <p>지속시간: {(selectedSkill.duration / 1000).toFixed(1)}초</p>
            )}
          </div>
        )}
      </div>

      {/* 편집 오버레이 - 기존과 동일 */}
      {editingSkill && (
        <div className="inline-editor-overlay">
          <div className="inline-editor">
            {/* 기존 편집 UI 유지 */}
          </div>
        </div>
      )}
    </div>
  );
};