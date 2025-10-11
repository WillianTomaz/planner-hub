import React, { useState } from 'react';
import { MenuDrawer } from './MenuDrawer';
import { usePlannerData } from '../hooks/usePlannerData';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { data, exportData } = usePlannerData(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleSave = () => {
    exportData(); 
  };
  const handleExport = () => {
    exportData();
  };
  
  const appConfig = data?.appConfig[0];
  const saveStatus = appConfig?.saveStatus || 'Saved';
  const lastSaveTime = appConfig?.lastSaveTimestamp ? new Date(appConfig.lastSaveTimestamp).toLocaleTimeString() : 'N/A';

  // Function for navigation
  const handleNavigation = (pathId: string) => {
    // 1. Construct the path (e.g. 'annotations' -> '/annotations')
    const path = `/${pathId}`;
    // 2. Browse
    navigate(path);
  };
  // Function that handles the menu item click event
  const handleMenuItemClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: string) => {
    // Prevents event propagation to avoid flickering behavior
    e.preventDefault();
    e.stopPropagation();

    // Fixes a special case: 'index' must be '/' (dashboard)
    const finalItemId = itemId === 'index' ? '' : itemId;

    handleNavigation(finalItemId);
  }
  
  return (
    <div className="planner-layout">
      <header className="planner-header">
        <button className="modern-menu-toggle" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
          <FontAwesomeIcon icon={faBars} size="xl" />
        </button>

        <div className="app-title-container"> 
            <a style={{ cursor: 'pointer' }}
              key={'dashboard'}
              onClick={(e) => handleMenuItemClick(e, '/')} >
                <h1 className="app-title">
                  {data?.menuConfig.menuTitle || "Planner HUB"}
                </h1>
            </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="save-status-container">
            <span className={`save-status ${saveStatus === 'Not Saved' ? 'status-not-saved' : 'status-saved'}`}>
              {saveStatus}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
              Last Sync: <br />
              {lastSaveTime}
            </span>
          </div>
          
          <button className="modern-save-button" onClick={handleSave} aria-label="Save">
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