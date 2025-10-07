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
        {/* Botão de Menu para mobile */}
        <button 
            className="menu-toggle" 
            onClick={() => setIsMobileMenuOpen(true)}
        >
          ☰
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
          <div className="save-status-container" style={{ textAlign: 'center',  display: 'flex', flexDirection: 'column' }}>
            <span className={`save-status ${saveStatus === 'Not Saved' ? 'status-not-saved' : 'status-saved'}`}>
              {saveStatus}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
              Last Sync: {lastSaveTime}
            </span>
          </div>
          
          <button 
            className="save-button" 
            onClick={handleSave} // Chama exportData
          >
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