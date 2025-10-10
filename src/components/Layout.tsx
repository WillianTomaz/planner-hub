// src/components/Layout.tsx
import React, { useState } from 'react';
import { MenuDrawer } from './MenuDrawer';
import { usePlannerData } from '../hooks/usePlannerData';
// NOVO: Importa o ícone para uso no React
import plannerhubIcon from '../assets/plannerhub-icon.png'; 

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // exportData is needed here
  const { data, exportData } = usePlannerData(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // CORREÇÃO: Chama exportData para salvar no LocalStorage E realizar o download
  const handleSave = () => {
    exportData(); 
  };

  const handleExport = () => {
    exportData();
  };
  
  const appConfig = data?.appConfig[0];
  const saveStatus = appConfig?.saveStatus || 'Saved';
  const lastSaveTime = appConfig?.lastSaveTimestamp ? new Date(appConfig.lastSaveTimestamp).toLocaleTimeString() : 'N/A';


  return (
    <div className="planner-layout">
        
      {/* HEADER: Botão de Menu, Título, Status e Botão SAVE */}
      <header className="planner-header">
        {/* Modern Hamburger Menu Button */}
        <button 
            className="menu-toggle modern-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
        >
          <svg viewBox="0 0 32 32">
            <rect y="7" width="32" height="3" rx="1.5" fill="#fff"/>
            <rect y="15" width="32" height="3" rx="1.5" fill="#fff"/>
            <rect y="23" width="32" height="3" rx="1.5" fill="#fff"/>
          </svg>
        </button>
        
        {/* NOVO: Div para o Título e Ícone */}
        <div className="app-title-container"> 
            <img src={plannerhubIcon} alt="Planner Hub Icon" className="app-icon" />
            <div className="app-title">
                {data?.menuConfig.menuTitle || "Planner HUB"}
            </div>
        </div>
        
        {/* Status e Botão SAVE */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="save-status-container">
            <span className={`save-status ${saveStatus === 'Not Saved' ? 'status-not-saved' : 'status-saved'}`}>
              {saveStatus}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
              Last Sync: {lastSaveTime}
            </span>
          </div>
          
          <button className="save-button modern-save-button" onClick={handleSave} aria-label="Save">
            SAVE
          </button>
        </div>
      </header>
      
      <div className="content-wrapper">
          
        <MenuDrawer 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          onExport={handleExport}
        />

        <main className="planner-content">
            <div className="page-container">
                {children}
            </div>
        </main>

      </div>
    </div>
  );
};