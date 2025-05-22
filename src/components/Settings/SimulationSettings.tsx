// src/components/Settings/SimulationSettings.tsx
import React, { useState } from 'react';
import { SettingsCard } from './SettingsCard';
import { InputField } from './InputField';

interface SimulationConfig {
  serverLagEnabled: boolean;
  serverLagProbability: number;
  serverLagDuration: number;
  applyOneHitPerTarget: boolean;
  simulateBossOnly: boolean;
}

export const SimulationSettings: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>({
    serverLagEnabled: true,
    serverLagProbability: 30,
    serverLagDuration: 1000,
    applyOneHitPerTarget: true,
    simulateBossOnly: true
  });

  const updateConfig = (key: keyof SimulationConfig, value: boolean | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    setConfig({
      serverLagEnabled: true,
      serverLagProbability: 30,
      serverLagDuration: 1000,
      applyOneHitPerTarget: true,
      simulateBossOnly: true
    });
  };

  return (
    <SettingsCard title="시뮬레이션 환경 설정" icon="🔧">
      <div className="settings-section">
        <h3>서버렉 시뮬레이션</h3>
        <div className="checkbox-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.serverLagEnabled}
              onChange={(e) => updateConfig('serverLagEnabled', e.target.checked)}
            />
            <span className="checkbox-text">서버렉 시뮬레이션 활성화</span>
          </label>
        </div>
        
        {config.serverLagEnabled && (
          <>
            <div className="settings-row">
              <InputField
                label="서버렉 발생 확률 %"
                value={config.serverLagProbability}
                onChange={(value) => updateConfig('serverLagProbability', value)}
                min={0}
                max={100}
              />
              <InputField
                label="서버렉 최대 지속시간 (ms)"
                value={config.serverLagDuration}
                onChange={(value) => updateConfig('serverLagDuration', value)}
                min={0}
                max={5000}
                step={100}
              />
            </div>
          </>
        )}
      </div>

      <div className="settings-section">
        <h3>기타 설정</h3>
        <div className="checkbox-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.applyOneHitPerTarget}
              onChange={(e) => updateConfig('applyOneHitPerTarget', e.target.checked)}
            />
            <span className="checkbox-text">한 적당 최대 한 번 충돌 적용</span>
          </label>
        </div>
        
        <div className="checkbox-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.simulateBossOnly}
              onChange={(e) => updateConfig('simulateBossOnly', e.target.checked)}
            />
            <span className="checkbox-text">보스 전투만 시뮬레이션</span>
          </label>
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