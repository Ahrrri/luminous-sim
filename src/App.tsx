// src/App.tsx
import { useState } from 'react';
import { ECSProvider } from './hooks/ECSProvider';
import { Layout } from './components/Layout/Layout';
import { EnhancedSettingsPanel } from './components/Settings/EnhancedSettingsPanel';
import { AutoSimulationPanel } from './components/AutoSimulation/AutoSimulationPanel';
import { ManualPracticePanel } from './components/ManualPractice/ManualPracticePanel';
import { ResultsPanel } from './components/Results/ResultsPanel';
import './App.css';

type TabType = 'settings' | 'auto' | 'manual' | 'results';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('manual'); // manual부터 시작해서 테스트

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <EnhancedSettingsPanel />;
      case 'auto':
        return <AutoSimulationPanel />;
      case 'manual':
        return <ManualPracticePanel />;
      case 'results':
        return <ResultsPanel />;
      default:
        return <ManualPracticePanel />;
    }
  };

  return (
    <div className="app">
      <ECSProvider>
        <Layout
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {renderContent()}
        </Layout>
      </ECSProvider>
    </div>
  );
}

export default App;