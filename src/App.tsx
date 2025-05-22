// src/App.tsx 수정
import React, { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { AutoSimulationPanel } from './components/AutoSimulation/AutoSimulationPanel';
import { ManualPracticePanel } from './components/ManualPractice/ManualPracticePanel';
import { ResultsPanel } from './components/Results/ResultsPanel';
import './App.css';

type TabType = 'settings' | 'auto' | 'manual' | 'results';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('auto');

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsPanel />;
      case 'auto':
        return <AutoSimulationPanel />;
      case 'manual':
        return <ManualPracticePanel />;
      case 'results':
        return <ResultsPanel />;
      default:
        return <AutoSimulationPanel />;
    }
  };

  return (
    <div className="app">
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;