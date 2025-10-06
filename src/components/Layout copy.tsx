// src/components/Layout.tsx
import React, { useState } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import { MenuDrawer } from './MenuDrawer'; // A ser criado

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data, saveLocalState, exportData } = usePlannerData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const status = data?.appConfig[0].saveStatus || 'Saved';

  const handleSave = () => {
    if (saveLocalState()) {
      alert('Changes saved successfully!');
    }
  };

  const handleExport = () => {
    exportData();
  };

  return (
    <div className="planner-layout">
      {/* --- HEADER --- */}
      <header className="planner-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
          MENU
        </button>
        <div className="app-title">{data?.menuConfig.menuTitle || 'PLANNER HUB'}</div>
        <div className={`save-status ${status === 'Not Saved' ? 'status-not-saved' : 'status-saved'}`}>
          {status}
        </div>
        <button onClick={handleSave} className="save-button">
          SAVE
        </button>
      </header>
      
      {/* --- MENU DRAWER (Sidebar) --- */}
      <MenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onExport={handleExport} 
      />

      {/* --- MAIN CONTENT --- */}
      <main className="planner-content"> {/* Ocupa 100% do espaço */}
          <div className="page-container"> {/* Aplica max-width e margin: 0 auto */}
              {children}
          </div>
      </main>
    </div>
  );
};