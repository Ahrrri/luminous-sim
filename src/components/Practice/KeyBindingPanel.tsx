// src/components/Practice/KeyBindingPanel.tsx
import React, { useState } from 'react';
import { skills } from '../../models/skills';
import './practice.css';

interface KeyBinding {
  skillId: string;
  key: string;
  displayKey: string;
}

interface KeyBindingPanelProps {
  keyBindings: KeyBinding[];
  onUpdateBinding: (skillId: string, newKey: string) => void;
  isRunning: boolean;
}

const KeyBindingPanel: React.FC<KeyBindingPanelProps> = ({
  keyBindings,
  onUpdateBinding,
  isRunning
}) => {
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  
  // 스킬별로 그룹화
  const groupedBindings = {
    light: keyBindings.filter(kb => {
      const skill = skills[kb.skillId];
      return skill && skill.element === 'LIGHT' && skill.type === 'ATTACK';
    }),
    dark: keyBindings.filter(kb => {
      const skill = skills[kb.skillId];
      return skill && skill.element === 'DARK' && skill.type === 'ATTACK';
    }),
    equilibrium: keyBindings.filter(kb => {
      const skill = skills[kb.skillId];
      return skill && (skill.element === 'EQUILIBRIUM' || skill.isEquilibriumOnly);
    }),
    buff: keyBindings.filter(kb => {
      const skill = skills[kb.skillId];
      return skill && skill.type === 'BUFF';
    })
  };
  
  // 키 바인딩 편집 모드 시작
  const startEditing = (skillId: string) => {
    if (isRunning) return; // 연습 중에는 편집 금지
    setEditingSkillId(skillId);
  };
  
  // 키 입력 핸들러
  const handleKeyDown = (e: React.KeyboardEvent, skillId: string) => {
    e.preventDefault();
    
    // ESC 키는 편집 취소
    if (e.key === 'Escape') {
      setEditingSkillId(null);
      return;
    }
    
    // 유효한 키 입력만 처리
    if (e.key.length === 1 || ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) {
      onUpdateBinding(skillId, e.key);
      setEditingSkillId(null);
    }
  };
  
  // 키 바인딩 충돌 체크
  const hasConflict = (skillId: string): boolean => {
    const binding = keyBindings.find(kb => kb.skillId === skillId);
    if (!binding) return false;
    
    return keyBindings.some(kb => kb.skillId !== skillId && kb.key === binding.key);
  };
  
  // 단일 키 바인딩 표시 컴포넌트
  const BindingItem = ({ binding }: { binding: KeyBinding }) => {
    const skill = skills[binding.skillId];
    const isEditing = editingSkillId === binding.skillId;
    const conflict = hasConflict(binding.skillId);
    
    return (
      <div className={`binding-item ${conflict ? 'conflict' : ''}`}>
        <div className="binding-skill">{skill?.name || binding.skillId}</div>
        <div 
          className={`binding-key ${isEditing ? 'editing' : ''}`}
          onClick={() => startEditing(binding.skillId)}
          onKeyDown={(e) => isEditing && handleKeyDown(e, binding.skillId)}
          tabIndex={isEditing ? 0 : -1}
        >
          {isEditing ? '입력 대기 중...' : binding.displayKey}
        </div>
      </div>
    );
  };
  
  return (
    <div className="key-binding-panel">
      <h3>키 바인딩 설정</h3>
      {isRunning && (
        <div className="binding-warning">
          연습 모드 실행 중에는 키 바인딩을 변경할 수 없습니다.
        </div>
      )}
      
      <div className="binding-groups">
        <div className="binding-group">
          <h4>빛 스킬</h4>
          {groupedBindings.light.map(binding => (
            <BindingItem key={binding.skillId} binding={binding} />
          ))}
        </div>
        
        <div className="binding-group">
          <h4>어둠 스킬</h4>
          {groupedBindings.dark.map(binding => (
            <BindingItem key={binding.skillId} binding={binding} />
          ))}
        </div>
        
        <div className="binding-group">
          <h4>이퀼 스킬</h4>
          {groupedBindings.equilibrium.map(binding => (
            <BindingItem key={binding.skillId} binding={binding} />
          ))}
        </div>
        
        <div className="binding-group">
          <h4>버프 스킬</h4>
          {groupedBindings.buff.map(binding => (
            <BindingItem key={binding.skillId} binding={binding} />
          ))}
        </div>
      </div>
      
      <div className="binding-help">
        <p>스킬 단축키를 변경하려면 키 항목을 클릭한 후 원하는 키를 누르세요.</p>
        <p>색상이 변경된 항목은 다른 스킬과 키 바인딩이 충돌하는 것입니다.</p>
      </div>
    </div>
  );
};

export default KeyBindingPanel;