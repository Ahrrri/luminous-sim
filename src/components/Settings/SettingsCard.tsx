// src/components/Settings/SettingsCard.tsx
import React from 'react';

interface SettingsCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  icon,
  children
}) => {
  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <span className="settings-card-icon">{icon}</span>
        <h2 className="settings-card-title">{title}</h2>
      </div>
      <div className="settings-card-content">
        {children}
      </div>
    </div>
  );
};