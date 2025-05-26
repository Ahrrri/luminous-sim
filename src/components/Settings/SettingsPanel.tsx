// src/components/Settings/SettingsPanel.tsx
import React, { useState } from 'react';
import { CharacterSettings } from './CharacterSettings';
import { SimulationSettings } from './SimulationSettings';
import { LUMINOUS_SKILLS } from '../../data/skills';
import type { CharacterStats, BossStats, SkillEnhancement, GameSettings } from '../../data/types/characterTypes';
import { CompactSkillInfoPanel } from './CompactSkillInfoPanel';
import './SettingsPanel.css';

export const SettingsPanel: React.FC = () => {
  // 기본값들
  const [characterStats, setCharacterStats] = useState<CharacterStats>({
    int: 10000,
    luk: 1000,
    magicAttack: 2000,
    damagePercent: 0,
    bossDamage: 300,
    critRate: 100,
    critDamage: 85,
    ignoreDefense: 85,
    ignoreElementalResist: 0,
    weaponConstant: 1.2,
    mastery: 95,
    attackSpeed: 0,
    merLevel: 5,
    buffDuration: 50,
    cooldownReduction: 4,
    cooldownResetChance: 20,
    continuousLevel: 30,
    equilibriumMode: 'AUTO'
  });

  const [bossStats, setBossStats] = useState<BossStats>({
    level: 255,
    defenseRate: 30,
    elementalResist: 50
  });

  const [skillEnhancements, setSkillEnhancements] = useState<SkillEnhancement[]>([
    // 기본값: 모든 스킬 5차 60레벨, 6차 30레벨
    ...LUMINOUS_SKILLS.map(skill => ({
      skillId: skill.id,
      fifthLevel: 60,
      sixthLevel: 30
    }))
  ]);

  // 전체 설정 저장/불러오기 기능
  const exportSettings = () => {
    const settings: GameSettings = {
      character: characterStats,
      boss: bossStats,
      skillEnhancements,
      simulation: {
        serverLagEnabled: true,
        serverLagProbability: 30,
        serverLagDuration: 1000,
        applyOneHitPerTarget: true,
        simulateBossOnly: true
      }
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'luminous_settings.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings: GameSettings = JSON.parse(e.target?.result as string);
        setCharacterStats(settings.character);
        setBossStats(settings.boss);
        setSkillEnhancements(settings.skillEnhancements);
        console.log('설정을 성공적으로 불러왔습니다.');
      } catch (error) {
        console.error('설정 파일 불러오기 실패:', error);
        alert('설정 파일을 불러오는데 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h1>⚙️ 캐릭터 설정</h1>
        <div className="settings-actions">
          <button className="export-button" onClick={exportSettings}>
            📤 설정 내보내기
          </button>
          <label className="import-button">
            📥 설정 불러오기
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-left">
          <CharacterSettings
            characterStats={characterStats}
            bossStats={bossStats}
            onCharacterStatsChange={setCharacterStats}
            onBossStatsChange={setBossStats}
          />

          <SimulationSettings />
        </div>

        <div className="settings-right">
          <CompactSkillInfoPanel
            characterStats={characterStats}
            bossStats={bossStats}
            skillEnhancements={skillEnhancements}
            onSkillEnhancementChange={setSkillEnhancements}
          />
        </div>
      </div>
    </div>
  );
};