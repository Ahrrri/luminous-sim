// src/components/Layout/Layout.tsx
import React from 'react';
import './Layout.css';

type TabType = 'settings' | 'auto' | 'manual' | 'results';

interface LayoutProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
    activeTab,
    onTabChange,
    children
}) => {
    // src/components/Layout/Layout.tsx 일부 수정
    const tabs = [
        { id: 'settings' as const, label: '설정', icon: '⚙️' },
        { id: 'auto' as const, label: 'Auto', icon: '🤖' },
        { id: 'manual' as const, label: 'Manual', icon: '🎮' },
        { id: 'results' as const, label: '결과', icon: '📊' }
    ];

    return (
        <div className="layout">
            <header className="layout-header">
                <h1 className="layout-title">
                    <span className="title-icon">✨</span>
                    엄
                </h1>

                <nav className="layout-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <main className="layout-content">
                {children}
            </main>
        </div>
    );
};