// src/components/Settings/CharacterSettings.tsx
import React, { useState } from 'react';
import { SettingsCard } from './SettingsCard';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import type { CharacterStats, BossStats } from '../../data/types/characterTypes';

interface CharacterSettingsProps {
  characterStats: CharacterStats;
  bossStats: BossStats;
  onCharacterStatsChange: (stats: CharacterStats) => void;
  onBossStatsChange: (stats: BossStats) => void;
}

export const CharacterSettings: React.FC<CharacterSettingsProps> = ({
  characterStats,
  bossStats,
  onCharacterStatsChange,
  onBossStatsChange
}) => {

  const updateCharacterStat = (key: keyof CharacterStats, value: number | string) => {
    onCharacterStatsChange({ ...characterStats, [key]: value });
  };

  const updateBossStat = (key: keyof BossStats, value: number) => {
    onBossStatsChange({ ...bossStats, [key]: value });
  };

  const resetCharacterToDefault = () => {
    onCharacterStatsChange({
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
  };

  const resetBossToDefault = () => {
    onBossStatsChange({
      level: 255,
      defenseRate: 30,
      elementalResist: 50
    });
  };

  return (
    <div className="-character-settings">
      <SettingsCard title="캐릭터 기본 스펙" icon="👤">
        <div className="settings-section">
          <h3>기본 스탯</h3>
          <div className="settings-row">
            <InputField
              label="INT"
              value={characterStats.int}
              onChange={(value) => updateCharacterStat('int', value)}
              min={0}
            />
            <InputField
              label="LUK"
              value={characterStats.luk}
              onChange={(value) => updateCharacterStat('luk', value)}
              min={0}
            />
          </div>
          <div className="settings-row">
            <InputField
              label="마력"
              value={characterStats.magicAttack}
              onChange={(value) => updateCharacterStat('magicAttack', value)}
              min={0}
            />
            <InputField
              label="무기 상수"
              value={characterStats.weaponConstant}
              onChange={(value) => updateCharacterStat('weaponConstant', value)}
              min={0}
              step={0.1}
            />
          </div>
          <div className="settings-row">
            <InputField
              label="숙련도 %"
              value={characterStats.mastery}
              onChange={(value) => updateCharacterStat('mastery', value)}
              min={0}
              max={100}
            />
            <SelectField
              label="공격속도"
              value={characterStats.attackSpeed}
              onChange={(value) => updateCharacterStat('attackSpeed', value)}
              options={[
                { value: 0, label: '기본 (0단계)' },
                { value: 1, label: '빠름 (1단계)' },
                { value: 2, label: '더 빠름 (2단계)' }
              ]}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>데미지 스펙</h3>
          <div className="settings-row">
            <InputField
              label="데미지 %"
              value={characterStats.damagePercent}
              onChange={(value) => updateCharacterStat('damagePercent', value)}
              min={0}
            />
            <InputField
              label="보스 데미지 %"
              value={characterStats.bossDamage}
              onChange={(value) => updateCharacterStat('bossDamage', value)}
              min={0}
            />
          </div>
          <div className="settings-row">
            <InputField
              label="크리 확률 %"
              value={characterStats.critRate}
              onChange={(value) => updateCharacterStat('critRate', value)}
              min={0}
              max={100}
            />
            <InputField
              label="크리 데미지 %"
              value={characterStats.critDamage}
              onChange={(value) => updateCharacterStat('critDamage', value)}
              min={0}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>무시 관련</h3>
          <div className="settings-row">
            <InputField
              label="방어율 무시 %"
              value={characterStats.ignoreDefense}
              onChange={(value) => updateCharacterStat('ignoreDefense', value)}
              min={0}
              max={100}
            />
            <InputField
              label="속성 내성 무시 %"
              value={characterStats.ignoreElementalResist}
              onChange={(value) => updateCharacterStat('ignoreElementalResist', value)}
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>시스템 설정</h3>
          <div className="settings-row">
            <SelectField
              label="메르세데스 레벨"
              value={characterStats.merLevel}
              onChange={(value) => updateCharacterStat('merLevel', value)}
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
              value={characterStats.buffDuration}
              onChange={(value) => updateCharacterStat('buffDuration', value)}
              min={0}
            />
          </div>
          <div className="settings-row">
            <InputField
              label="재사용 감소 (초)"
              value={characterStats.cooldownReduction}
              onChange={(value) => updateCharacterStat('cooldownReduction', value)}
              min={0}
              max={10}
              step={0.5}
            />
            <InputField
              label="컨티 레벨"
              value={characterStats.continuousLevel}
              onChange={(value) => updateCharacterStat('continuousLevel', value)}
              min={0}
              max={30}
            />
          </div>
          <div className="settings-row">
            <InputField
              label="재사용 확률 %"
              value={characterStats.cooldownResetChance}
              onChange={(value) => updateCharacterStat('cooldownResetChance', value)}
              min={0}
              max={100}
            />
            <SelectField
              label="이퀼 유예 모드"
              value={characterStats.equilibriumMode}
              onChange={(value) => updateCharacterStat('equilibriumMode', value)}
              options={[
                { value: 'AUTO', label: '자동' },
                { value: 'MANUAL', label: '수동' }
              ]}
            />
          </div>
        </div>

        <div className="settings-actions">
          <button className="reset-button" onClick={resetCharacterToDefault}>
            캐릭터 기본값 초기화
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="보스 정보" icon="👹">
        <div className="settings-section">
          <h3>보스 스펙</h3>
          <div className="settings-row">
            <InputField
              label="보스 레벨"
              value={bossStats.level}
              onChange={(value) => updateBossStat('level', value)}
              min={1}
              max={300}
            />
            <InputField
              label="보스 방어율 %"
              value={bossStats.defenseRate}
              onChange={(value) => updateBossStat('defenseRate', value)}
              min={0}
              max={100}
            />
          </div>
          <div className="settings-row">
            <InputField
              label="속성 저항 %"
              value={bossStats.elementalResist}
              onChange={(value) => updateBossStat('elementalResist', value)}
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="settings-actions">
          <button className="reset-button" onClick={resetBossToDefault}>
            보스 기본값 초기화
          </button>
        </div>
      </SettingsCard>
    </div>
  );
};