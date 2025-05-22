// src/components/ManualPractice/KeyBindingPanel.tsx
import React, { useState } from 'react';

interface MockSkill {
  id: string;
  name: string;
  keyBinding: string;
  element: 'LIGHT' | 'DARK' | 'EQUILIBRIUM' | 'BUFF';
}

interface KeyBindingPanelProps {
  skills: MockSkill[];
  onUpdateBinding: (skillId: string, newKey: string) => void;
  isRunning: boolean;
}

export const KeyBindingPanel: React.FC<KeyBindingPanelProps> = ({
  skills,
  onUpdateBinding,
  isRunning
}) => {
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const handleKeyCapture = (e: React.KeyboardEvent, skillId: string) => {
    e.preventDefault();
    
    if (e.key === 'Escape') {
      setEditingSkill(null);
      return;
    }

    const key = e.key.toUpperCase();
    onUpdateBinding(skillId, key);
    setEditingSkill(null);
  };

  const getConflicts = (key: string, excludeSkillId: string) => {
    return skills.filter(skill => 
      skill.keyBinding === key && skill.id !== excludeSkillId
    );
  };

  const groupedSkills = {
    light: skills.filter(skill => skill.element === 'LIGHT'),
    dark: skills.filter(skill => skill.element === 'DARK'),
    equilibrium: skills.filter(skill => skill.element === 'EQUILIBRIUM'),
    buff: skills.filter(skill => skill.element === 'BUFF'),
  };

  return (
    <div className="key-binding-panel">
      <div className="panel-header">
        <h3>키 바인딩 설정</h3>
        <button 
          className="toggle-button"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? '접기' : '펼치기'}
        </button>
      </div>

      {showPanel && (
        <div className="binding-content">
          {isRunning && (
            <div className="warning-message">
              연습 실행 중에는 키 바인딩을 변경할 수 없습니다.
            </div>
          )}

          <div className="binding-groups">
            {Object.entries(groupedSkills).map(([groupName, groupSkills]) => (
              <div key={groupName} className="binding-group">
                <h4 className={`group-title ${groupName}`}>
                  {groupName === 'light' && '빛 스킬'}
                  {groupName === 'dark' && '어둠 스킬'}
                  {groupName === 'equilibrium' && '이퀼리브리엄 스킬'}
                  {groupName === 'buff' && '버프 스킬'}
                </h4>
                
                {groupSkills.map(skill => {
                  const conflicts = getConflicts(skill.keyBinding, skill.id);
                  const hasConflict = conflicts.length > 0;
                  const isEditing = editingSkill === skill.id;
                  
                  return (
                    <div 
                      key={skill.id} 
                      className={`binding-item ${hasConflict ? 'conflict' : ''}`}
                    >
                      <span className="skill-name">{skill.name}</span>
                      <div 
                        className={`key-display ${isEditing ? 'editing' : ''}`}
                        onClick={() => !isRunning && setEditingSkill(skill.id)}
                        onKeyDown={(e) => isEditing && handleKeyCapture(e, skill.id)}
                        tabIndex={isEditing ? 0 : -1}
                      >
                        {isEditing ? '키를 누르세요...' : skill.keyBinding}
                      </div>
                      {hasConflict && (
                        <span className="conflict-warning">
                          충돌: {conflicts.map(c => c.name).join(', ')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="binding-help">
            <p>• 키를 변경하려면 해당 키 영역을 클릭한 후 원하는 키를 누르세요</p>
            <p>• ESC 키를 누르면 편집을 취소합니다</p>
            <p>• 빨간색으로 표시된 항목은 다른 스킬과 키가 충돌합니다</p>
          </div>
        </div>
      )}
    </div>
  );
};