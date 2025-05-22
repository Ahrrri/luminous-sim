// src/components/Settings/SettingsPanel.tsx
import React from 'react';
import { CharacterSettings } from './CharacterSettings';
import { SimulationSettings } from './SimulationSettings';
import './SettingsPanel.css';

export const SettingsPanel: React.FC = () => {
  return (
    <div className="settings-panel">
      <div className="settings-grid">
        <CharacterSettings />
        <SimulationSettings />
      </div>
    </div>
  );
};