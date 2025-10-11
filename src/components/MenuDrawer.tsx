import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlannerData } from '../hooks/usePlannerData';
import plannerhubIcon from '../assets/plannerhub-favicon.png'; 

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, onExport }) => {
  const { data, resetData } = usePlannerData();
  const navigate = useNavigate();

  // Simple Function for Navigation
  const handleNavigation = (pathId: string) => {
    onClose(); // 1. Closes the menu
    
    // 2. Constructs the path (e.g., 'annotations' -> '/annotations')
    const path = `/${pathId}`;
    
    // 3. Navigate
    navigate(path); 
  };
  
  // Function that handles the menu item click event (Fixed and elegant)
  const handleMenuItemClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: string) => {
    // Prevents event propagation to avoid flickering behavior
    e.preventDefault(); 
    e.stopPropagation(); 
    
    // Fixes a special case: 'index' must be '/' (dashboard)
    const finalItemId = itemId === 'index' ? '' : itemId;

    handleNavigation(finalItemId);
  }
  
  return (
    // The outer div (overlay) closes the menu when clicking outside
    <div className={`menu-drawer ${isOpen ? 'open' : ''}`} onClick={onClose}>
      {/* The inner div prevents closing when clicking on the menu content */}
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header menu-header-icon">
            <img src={plannerhubIcon} alt="Planner Hub Icon" className="app-icon-drawer" />
        </div>
        
        {/* Close button with new style */}
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <nav className="menu-nav">
          {data?.menuConfig.menuItems
            .filter(item => item.isVisible)
            .sort((a, b) => parseInt(a.order) - parseInt(b.order))
            .map(item => (
              <a
                key={item.id}
                className="menu-item"
                onClick={(e) => handleMenuItemClick(e, item.id)} 
              >
                {item.title}
              </a>
            ))}
        </nav>

        <div className="menu-actions-fixed">
          <button className="action-btn reset-btn" onClick={resetData}>
            RESET DATA
          </button>
          <button className="action-btn export-btn" onClick={onExport}>
            SAVE AND EXPORT
          </button>
        </div>
      </div>
    </div>
  );
};