import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlannerData } from '../hooks/usePlannerData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, onExport }) => {
  const { data, resetData, updatePlannerData } = usePlannerData();
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

  const isPomodoroEnabled = useMemo(() => {
    return data?.appConfig[0]?.isPomodoroEnabled ?? false;
  }, [data]);

  const togglePomodoro = () => {
    if (data && data.appConfig[0]) {
        const updatedConfig = data.appConfig.map((config, index) => {
            if (index === 0) {
                return { ...config, isPomodoroEnabled: !isPomodoroEnabled };
            }
            return config;
        });
        updatePlannerData({ appConfig: updatedConfig });
        
        onClose();
        // navigate('/');
        window.location.reload(); 
    }
  };

  return (
    // The outer div (overlay) closes the menu when clicking outside
    <div className={`menu-drawer ${isOpen ? 'open' : ''}`} onClick={onClose}>
      {/* The inner div prevents closing when clicking on the menu content */}
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header menu-header-icon">
              <a style={{ cursor: 'pointer' }}
                key={'dashboard'}
                onClick={(e) => handleMenuItemClick(e, '/')} >
                  <h1 className="app-title">
                    {data?.menuConfig.menuTitle || "Planner HUB"}
                  </h1>
              </a>
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
          <button className="btn-data" onClick={togglePomodoro}>
              <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
              POMODORO: {isPomodoroEnabled ? 'ON' : 'OFF'}
          </button>
          <div className="menu-actions-fixed" 
              style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '10px' }}>
          </div>
          <button className="btn-data" onClick={resetData}>
            RESET DATA
          </button>
          <button className="btn-data" onClick={onExport}>
            SAVE AND EXPORT
          </button>
        </div>
      </div>
    </div>
  );
};