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

  const handleNavigation = (pathId: string) => {
    onClose();
    const path = `/${pathId}`;
    navigate(path);
  };

  const handleMenuItemClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const finalItemId = itemId === 'index' ? '' : itemId;
    handleNavigation(finalItemId);
  };

  const isPomodoroEnabled = useMemo(() => {
    return data?.appConfig?.[0]?.isPomodoroEnabled ?? false;
  }, [data]);

  const togglePomodoro = () => {
    if (data && data.appConfig && data.appConfig.length > 0) {
      const updatedConfig = data.appConfig.map((cfg, idx) =>
        idx === 0 ? { ...cfg, isPomodoroEnabled: !isPomodoroEnabled } : cfg
      );
      updatePlannerData({ appConfig: updatedConfig });
      // no reload: context update triggers re-render across the app
      onClose();
    }
  };

  return (
    <div className={`menu-drawer ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header menu-header-icon">
          <a style={{ cursor: 'pointer' }} key={'dashboard'} onClick={(e) => handleMenuItemClick(e, '/')} >
            <h1 className="app-title">{data?.menuConfig.menuTitle || 'Planner HUB'}</h1>
          </a>
        </div>

        <button className="close-btn" onClick={onClose}>&times;</button>

        <nav className="menu-nav">
          {data?.menuConfig.menuItems
            .filter(item => item.isVisible)
            .sort((a, b) => parseInt(a.order) - parseInt(b.order))
            .map(item => (
              <a key={item.id} className="menu-item" onClick={(e) => handleMenuItemClick(e, item.id)}>
                {item.title}
              </a>
            ))}
        </nav>

        <div className="menu-actions-fixed">
          <button className="btn-data" onClick={togglePomodoro}>
            <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
            POMODORO: {isPomodoroEnabled ? 'ON' : 'OFF'}
          </button>

          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '10px' }} />

          <button className="btn-data" onClick={resetData}>RESET DATA</button>
          <button className="btn-data" onClick={onExport}>SAVE AND EXPORT</button>
        </div>
      </div>
    </div>
  );
};