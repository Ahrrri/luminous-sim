// src/components/Settings/CharacterSettings.tsx
import React, { useState } from 'react';
import { SettingsCard } from './SettingsCard';
import { InputField } from './InputField';
import { SelectField } from './SelectField';

interface CharacterStats {
  int: number;
  luk: number;
  magicAttack: number;
  bossDamage: number;
  critDamage: number;
  critRate: number;
  fifthEnhancement: number;
  sixthEnhancement: number;
  merLevel: number;
  buffDuration: number;
  cooldownReduction: number;
  continuousLevel: number;
  cooldownResetChance: number;
  equilibriumMode: 'AUTO' | 'MANUAL';
}

export const CharacterSettings: React.FC = () => {
  const [stats, setStats] = useState<CharacterStats>({
    int: 10000,
    luk: 1000,
    magicAttack: 2000,
    bossDamage: 300,
    critDamage: 85,
    critRate: 100,
    fifthEnhancement: 60,
    sixthEnhancement: 30,
    merLevel: 5,
    buffDuration: 50,
    cooldownReduction: 4,
    continuousLevel: 30,
    cooldownResetChance: 20,
    equilibriumMode: 'AUTO'
  });

  const updateStat = (key: keyof CharacterStats, value: number | string) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    setStats({
      int: 10000,
      luk: 1000,
      magicAttack: 2000,
      bossDamage: 300,
      critDamage: 85,
      critRate: 100,
      fifthEnhancement: 60,
      sixthEnhancement: 30,
      merLevel: 5,
      buffDuration: 50,
      cooldownReduction: 4,
      continuousLevel: 30,
      cooldownResetChance: 20,
      equilibriumMode: 'AUTO'
    });
  };

  return (
    <SettingsCard title="캐릭터 설정" icon="👤">
      <div className="settings-section">
        <h3>기본 스펙</h3>
        <div className="settings-row">
          <InputField
            label="INT"
            value={stats.int}
            onChange={(value) => updateStat('int', value)}
            min={0}
          />
          <InputField
            label="LUK"
            value={stats.luk}
            onChange={(value) => updateStat('luk', value)}
            min={0}
          />
        </div>
        <div className="settings-row">
          <InputField
            label="마력"
            value={stats.magicAttack}
            onChange={(value) => updateStat('magicAttack', value)}
            min={0}
          />
          <InputField
            label="보스 데미지 %"
            value={stats.bossDamage}
            onChange={(value) => updateStat('bossDamage', value)}
            min={0}
          />
        </div>
        <div className="settings-row">
          <InputField
            label="크리 확률 %"
            value={stats.critRate}
            onChange={(value) => updateStat('critRate', value)}
            min={0}
            max={100}
          />
          <InputField
            label="크리 데미지 %"
            value={stats.critDamage}
            onChange={(value) => updateStat('critDamage', value)}
            min={0}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>강화 설정</h3>
        <div className="settings-row">
          <InputField
            label="5차 강화 %"
            value={stats.fifthEnhancement}
            onChange={(value) => updateStat('fifthEnhancement', value)}
            min={0}
            max={60}
          />
          <InputField
            label="6차 강화 %"
            value={stats.sixthEnhancement}
            onChange={(value) => updateStat('sixthEnhancement', value)}
            min={0}
            max={30}
          />
        </div>
        <div className="settings-row">
          <SelectField
            label="메르세데스 레벨"
            value={stats.merLevel}
            onChange={(value) => updateStat('merLevel', value)}
            options={[
              { value: 0, label: '레벨 70 미만 (0%)' },
              { value: 2, label: '레벨 70 (2%)' },
              { value: 3, label: '레벨 120 (3%)' },
              { value: 4, label: '레벨 160 (4%)' },
              { value: 5, label: '레벨 200 (5%)' },
              { value: 6, label: '레벨 210 (6%)' }
            ]}
          />
          <InputField
            label="버프 지속시간 증가 %"
            value={stats.buffDuration}
            onChange={(value) => updateStat('buffDuration', value)}
            min={0}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>특수 설정</h3>
        <div className="settings-row">
          <InputField
            label="재사용 감소 (초)"
            value={stats.cooldownReduction}
            onChange={(value) => updateStat('cooldownReduction', value)}
            min={0}
            max={10}
            step={0.5}
          />
          <InputField
            label="컨티 레벨"
            value={stats.continuousLevel}
            onChange={(value) => updateStat('continuousLevel', value)}
            min={0}
            max={30}
          />
        </div>
        <div className="settings-row">
          <InputField
            label="재사용 확률 %"
            value={stats.cooldownResetChance}
            onChange={(value) => updateStat('cooldownResetChance', value)}
            min={0}
            max={100}
          />
          <SelectField
            label="이퀼 유예 모드"
            value={stats.equilibriumMode}
            onChange={(value) => updateStat('equilibriumMode', value)}
            options={[
              { value: 'AUTO', label: '자동' },
              { value: 'MANUAL', label: '수동' }
            ]}
          />
        </div>
      </div>

      <div className="settings-actions">
        <button className="reset-button" onClick={resetToDefault}>
          기본값으로 초기화
        </button>
      </div>
    </SettingsCard>
  );
};