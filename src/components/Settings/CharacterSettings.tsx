// src/components/Settings/CharacterSettings.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { updateCharacter, resetToDefault } from '../../store/slices/characterSlice';
import './settings.css';

const CharacterSettings: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const simulation = useSelector((state: RootState) => state.simulation);
  
  // 캐릭터 속성 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // 숫자 필드와 문자열 필드 구분
    const newValue = type === 'number' ? Number(value) : value;
    
    dispatch(updateCharacter({ [name]: newValue }));
  };
  
  // 기본값으로 초기화
  const handleReset = () => {
    dispatch(resetToDefault());
  };
  
  return (
    <div className="character-settings">
      <h2>캐릭터 설정</h2>
      
      <div className="settings-form">
        <h3>기본 스펙</h3>
        <div className="form-group">
          <label htmlFor="int">INT:</label>
          <input 
            type="number" 
            id="int" 
            name="int" 
            value={character.int} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="luk">LUK:</label>
          <input 
            type="number" 
            id="luk" 
            name="luk" 
            value={character.luk} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="magicAttack">마력:</label>
          <input 
            type="number" 
            id="magicAttack" 
            name="magicAttack" 
            value={character.magicAttack} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bossDamage">보스 데미지 %:</label>
          <input 
            type="number" 
            id="bossDamage" 
            name="bossDamage" 
            value={character.bossDamage} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="critDamage">크리 데미지 %:</label>
          <input 
            type="number" 
            id="critDamage" 
            name="critDamage" 
            value={character.critDamage} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="critRate">크리 확률 %:</label>
          <input 
            type="number" 
            id="critRate" 
            name="critRate" 
            value={character.critRate} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
            max="100"
          />
        </div>
        
        <h3>강화 및 특수 세팅</h3>
        <div className="form-group">
          <label htmlFor="fifthEnhancement">5차 강화 %:</label>
          <input 
            type="number" 
            id="fifthEnhancement" 
            name="fifthEnhancement" 
            value={character.fifthEnhancement} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
            max="60"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="sixthEnhancement">6차 강화 %:</label>
          <input 
            type="number" 
            id="sixthEnhancement" 
            name="sixthEnhancement" 
            value={character.sixthEnhancement} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
            max="30"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="merLevel">메르세데스 레벨:</label>
          <select 
            id="merLevel" 
            name="merLevel" 
            value={character.merLevel} 
            onChange={handleChange}
            disabled={simulation.isRunning}
          >
            <option value="0">레벨 70 미만 (0%)</option>
            <option value="2">레벨 70 (2%)</option>
            <option value="3">레벨 120 (3%)</option>
            <option value="4">레벨 160 (4%)</option>
            <option value="5">레벨 200 (5%)</option>
            <option value="6">레벨 210 (6%)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="buffDuration">버프 지속시간 증가 %:</label>
          <input 
            type="number" 
            id="buffDuration" 
            name="buffDuration" 
            value={character.buffDuration} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cooldownReduction">재사용 대기시간 감소 (초):</label>
          <input 
            type="number" 
            id="cooldownReduction" 
            name="cooldownReduction" 
            value={character.cooldownReduction} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
            max="10"
            step="0.5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="continuousLevel">컨티뉴어스 링 레벨:</label>
          <input 
            type="number" 
            id="continuousLevel" 
            name="continuousLevel" 
            value={character.continuousLevel} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
            max="30"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cooldownResetChance">재사용 확률 %:</label>
          <input 
            type="number" 
            id="cooldownResetChance" 
            name="cooldownResetChance" 
            value={character.cooldownResetChance} 
            onChange={handleChange}
            disabled={simulation.isRunning}
            min="0"
            max="100"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="equilibriumMode">이퀼 유예 모드:</label>
          <select 
            id="equilibriumMode" 
            name="equilibriumMode" 
            value={character.equilibriumMode} 
            onChange={handleChange}
            disabled={simulation.isRunning}
          >
            <option value="AUTO">자동</option>
            <option value="MANUAL">수동</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            onClick={handleReset}
            disabled={simulation.isRunning}
          >
            기본값으로 초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSettings;