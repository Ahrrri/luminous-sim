// src/components/Settings/CompactSkillInfoPanel.tsx
import React, { useState, useMemo } from 'react';
import { LUMINOUS_SKILLS } from '../../data/skills';
import { SkillIcon } from '../common/SkillIcon';
import { useECS } from '../../hooks/useECS';
import { 
  StatsComponent, 
  TimeComponent, 
  DamageComponent,
  StateComponent,
  GaugeComponent,
  SkillComponent,
  BuffComponent,
  ActionDelayComponent,
  LearnedSkillsComponent,
  EnemyStatsComponent
} from '../../ecs/components';
import { DamageSystem } from '../../ecs/systems/DamageSystem';
import type { CharacterStats, BossStats, SkillEnhancement } from '../../data/types/characterTypes';
import type { SkillData, LuminousState } from '../../data/types/skillTypes';
import './CompactSkillInfoPanel.css';

interface CompactSkillInfoPanelProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  skillEnhancements: SkillEnhancement[];
  onSkillEnhancementChange: (enhancements: SkillEnhancement[]) => void;
}

interface DynamicSkillVariant {
  state: LuminousState;
  stateName: string;
  hasData: boolean;
  finalDamage: number;
  totalDamage: number;
  hitCount: number;
  calculationSteps: any[];
  damageInfo?: any;
}

export const CompactSkillInfoPanel: React.FC<CompactSkillInfoPanelProps> = ({
  characterStats,
  bossStats,
  skillEnhancements,
  onSkillEnhancementChange
}) => {
  const { world } = useECS();
  const [selectedSkill, setSelectedSkill] = useState<SkillData>(LUMINOUS_SKILLS[0]);

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
    
    // 6차 종속 관계 처리 (이터널/엔드리스)
    if (field === 'sixthLevel') {
      if (skillId === 'apocalypse') {
        skillsToUpdate.push('eternal_lightness');
      } else if (skillId === 'reflection') {
        skillsToUpdate.push('endless_darkness');
      }
    }
    
    const updatedEnhancements = skillEnhancements.filter(e => !skillsToUpdate.includes(e.skillId));
    
    skillsToUpdate.forEach(updateSkillId => {
      const currentEnhancement = getSkillEnhancement(updateSkillId);
      updatedEnhancements.push({
        ...currentEnhancement,
        [field]: value
      });
    });
    
    onSkillEnhancementChange(updatedEnhancements);
  };

  // 스킬이 데미지 데이터를 가지고 있는지 확인
  const hasDamageData = (skill: SkillData): boolean => {
    // 일반 스킬의 damage 속성
    if (skill.damage && skill.damage > 0) return true;
    
    // 동적 스킬의 getDynamicProperties
    if (skill.isDynamic && skill.getDynamicProperties) return true;
    
    // 리버레이션 오브의 특수 속성들
    if (skill.damagePassive || skill.damageActive || skill.damageActiveImbalance) return true;
    
    return false;
  };

  // 단일 상태에 대한 ECS 계산 수행
  const calculateSingleState = (skill: SkillData, state: LuminousState): DynamicSkillVariant => {
    const stateName = state === 'LIGHT' ? '빛' : 
                     state === 'DARK' ? '어둠' : '이퀼리브리엄';

    // 임시 Entity 생성
    const mockEntity = world.createEntity();
    const targetEntity = world.createEntity();
    
    try {
      // 필요한 컴포넌트들 추가
      const mockStats = new StatsComponent(characterStats);
      const mockTime = new TimeComponent();
      const mockDamage = new DamageComponent();
      const mockState = new StateComponent(state); // 지정된 상태로 설정
      const mockGauge = new GaugeComponent();
      const mockBuff = new BuffComponent();
      const mockActionDelay = new ActionDelayComponent();
      
      // LearnedSkillsComponent 생성 및 강화 적용
      const mockLearnedSkills = new LearnedSkillsComponent();
      
      // 모든 액티브 스킬 습득
      LUMINOUS_SKILLS
        .filter(skill => skill.canDirectUse !== false && skill.category !== 'passive_enhancement')
        .forEach(skill => {
          mockLearnedSkills.learnSkill(skill.id, 1, 'active');
        });
        
      // 강화 설정 적용
      mockLearnedSkills.updateFromEnhancements(skillEnhancements);
      
      // ECS 스킬 데이터 변환
      const ecsSkillData = {
        id: skill.id,
        name: skill.name,
        cooldown: 0,
        maxCooldown: skill.cooldown,
        isAvailable: true
      };
      const mockSkill = new SkillComponent([ecsSkillData], characterStats);

      // 타겟 엔티티 설정
      const targetStats = EnemyStatsComponent.createDummy({
        level: bossStats.level,
        defenseRate: bossStats.defenseRate,
        elementalResist: bossStats.elementalResist,
        isBoss: true,
        name: '더미 보스'
      });

      world.addComponent(mockEntity, mockStats);
      world.addComponent(mockEntity, mockTime);
      world.addComponent(mockEntity, mockDamage);
      world.addComponent(mockEntity, mockState);
      world.addComponent(mockEntity, mockGauge);
      world.addComponent(mockEntity, mockBuff);
      world.addComponent(mockEntity, mockActionDelay);
      world.addComponent(mockEntity, mockSkill);
      world.addComponent(mockEntity, mockLearnedSkills);
      
      world.addComponent(targetEntity, targetStats);

      // 실제 ECS 시스템으로 데미지 정보 가져오기
      const damageSystem = world.getSystem<DamageSystem>('DamageSystem');
      
      if (damageSystem) {
        const damageInfo = damageSystem.getSkillDamageInfo(
          mockEntity,
          targetEntity,
          skill.id
        );

        // 동적 스킬의 경우 상태별 속성 확인
        let actualDamage = damageInfo.baseDamage;
        let actualHitCount = skill.hitCount || 1;

        if (skill.isDynamic && skill.getDynamicProperties) {
          const dynamicProps = skill.getDynamicProperties(state);
          actualDamage = dynamicProps.damage || actualDamage;
          actualHitCount = dynamicProps.hitCount || actualHitCount;
        }

        // 계산 단계 분석
        const calculationSteps = [];
        
        // 기본 퍼뎀
        calculationSteps.push({
          label: '기본 퍼뎀',
          value: `${actualDamage}%`,
          type: 'base'
        });

        // 강화된 퍼뎀 체크
        const enhancement = getSkillEnhancement(skill.id);
        
        // 6차 마스터리 체크
        if (enhancement.sixthLevel > 0) {
          const masterySkill = LUMINOUS_SKILLS.find(s => s.id === `${skill.id}_mastery`);
          if (masterySkill?.passiveEffects) {
            const overrideEffect = masterySkill.passiveEffects.find(e => 
              e.effectType === 'skill_override' && e.targetSkillId === skill.id
            );
            if (overrideEffect?.overrideData) {
              // 동적 스킬의 상태별 오버라이드 처리
              let overrideValue = null;
              const overrideData = overrideEffect.overrideData;
              
              if (skill.isDynamic) {
                const stateKey = `damage${state.charAt(0) + state.slice(1).toLowerCase()}`;
                if (overrideData[stateKey] && Array.isArray(overrideData[stateKey])) {
                  overrideValue = overrideData[stateKey][enhancement.sixthLevel];
                }
              } else if (overrideData.damage && Array.isArray(overrideData.damage)) {
                overrideValue = overrideData.damage[enhancement.sixthLevel];
              }
              
              if (overrideValue) {
                calculationSteps.push({
                  label: '6차 Override',
                  value: `${overrideValue}%`,
                  note: '(기본값 대체)',
                  type: 'override'
                });
                actualDamage = overrideValue;
              }
            }
          }
        }
        
        // 5차 강화
        if (enhancement.fifthLevel > 0) {
          const fifthMultiplier = mockLearnedSkills.getFifthEnhancementMultiplier(skill.id);
          if (fifthMultiplier > 1) {
            calculationSteps.push({
              label: '5차 강화',
              value: `×${fifthMultiplier.toFixed(2)}`,
              note: `Lv.${enhancement.fifthLevel}`,
              type: 'fifth'
            });
          }
        }

        // 다른 스킬 영향
        const otherSkillBonus = mockLearnedSkills.getAffectedSkillBonus(skill.id);
        if (otherSkillBonus > 0) {
          calculationSteps.push({
            label: '타 스킬 영향',
            value: `+${otherSkillBonus}%`,
            note: '(라리VI 등)',
            type: 'other'
          });
        }

        // 6차 최종 데미지
        const sixthFinalDamage = mockLearnedSkills.getSixthFinalDamageBonus(skill.id);
        if (sixthFinalDamage > 0) {
          calculationSteps.push({
            label: '6차 최종뎀',
            value: `+${sixthFinalDamage}%`,
            type: 'final'
          });
        }

        return {
          state,
          stateName,
          hasData: true,
          finalDamage: actualDamage,
          totalDamage: damageInfo.estimatedDamageRange.average,
          hitCount: actualHitCount,
          calculationSteps,
          damageInfo
        };
      }

      return {
        state,
        stateName,
        hasData: false,
        finalDamage: 0,
        totalDamage: 0,
        hitCount: 1,
        calculationSteps: []
      };

    } finally {
      // 임시 Entity 정리
      world.destroyEntity(mockEntity);
      world.destroyEntity(targetEntity);
    }
  };

  // 선택된 스킬의 모든 상태별 계산
  const skillVariants = useMemo(() => {
    if (!hasDamageData(selectedSkill)) {
      return null;
    }

    if (selectedSkill.isDynamic) {
      // 동적 스킬: 세 가지 상태 모두 계산
      return ['LIGHT', 'DARK', 'EQUILIBRIUM'].map(state => 
        calculateSingleState(selectedSkill, state as LuminousState)
      );
    } else {
      // 일반 스킬: 빛 상태로만 계산 (상태 무관)
      return [calculateSingleState(selectedSkill, 'LIGHT')];
    }
  }, [selectedSkill, skillEnhancements, characterStats, bossStats, world]);

  const isDependentSkill = (skillId: string): boolean => {
    return skillId === 'eternal_lightness' || skillId === 'endless_darkness';
  };

  const getParentSkillId = (skillId: string): string | null => {
    if (skillId === 'eternal_lightness') return 'apocalypse';
    if (skillId === 'endless_darkness') return 'reflection';
    return null;
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
    
    // 종속 스킬의 6차는 부모 스킬 레벨 표시
    if (level === 'sixth' && isDependentSkill(skill.id)) {
      const parentId = getParentSkillId(skill.id);
      if (parentId) {
        const parentEnhancement = getSkillEnhancement(parentId);
        return parentEnhancement.sixthLevel.toString();
      }
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
        {LUMINOUS_SKILLS
          .filter(skill => skill.category !== 'passive_enhancement')
          .map(skill => {
            const enhancement = getSkillEnhancement(skill.id);
            const isSelected = selectedSkill.id === skill.id;
            const isDependent = isDependentSkill(skill.id);
            
            return (
              <div
                key={skill.id}
                className={`compact-skill-card ${skill.element.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedSkill(skill)}
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

      {/* 선택된 스킬의 상세 계산 */}
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
              {selectedSkill.isDynamic && <span className="dynamic-badge">동적 스킬</span>}
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

        {skillVariants ? (
          <div className="damage-calculation">
            {skillVariants.map((variant, index) => (
              <div key={variant.state} className="state-variant">
                {selectedSkill.isDynamic && (
                  <div className="variant-header">
                    <span className={`state-badge state-${variant.state.toLowerCase()}`}>
                      {variant.stateName} 상태
                    </span>
                  </div>
                )}
                
                <div className="calc-steps">
                  {variant.calculationSteps.map((step, stepIndex) => (
                    <div key={stepIndex} className={`calc-step ${step.type}`}>
                      <span className="step-label">{step.label}:</span>
                      <span className="step-value">{step.value}</span>
                      {step.note && <span className="step-note">{step.note}</span>}
                    </div>
                  ))}
                </div>
                
                <div className="calc-result">
                  <div className="result-row">
                    <span className="result-label">최종 퍼뎀:</span>
                    <span className="result-value primary">{variant.finalDamage}%</span>
                  </div>
                  {variant.hitCount > 1 && (
                    <div className="result-row">
                      <span className="result-label">타수:</span>
                      <span className="result-value secondary">{variant.hitCount}타</span>
                    </div>
                  )}
                  {variant.damageInfo && (
                    <div className="result-row">
                      <span className="result-label">예상 데미지:</span>
                      <span className="result-value tertiary">
                        {variant.damageInfo.estimatedDamageRange.min.toLocaleString()} ~ {variant.damageInfo.estimatedDamageRange.max.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
};