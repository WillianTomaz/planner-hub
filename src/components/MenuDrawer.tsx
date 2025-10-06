// src/components/MenuDrawer.tsx
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

  // Função Simples para navegação
  const handleNavigation = (pathId: string) => {
    onClose(); // 1. Fecha o menu
    
    // 2. Constrói o path (ex: 'annotations' -> '/annotations')
    const path = `/${pathId}`;
    
    // 3. Navega
    navigate(path); 
  };
  
  // Função que lida com o evento de clique no item do menu (Corrigida e elegante)
  const handleMenuItemClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: string) => {
    // ESSENCIAL: Impede a propagação do evento para evitar o comportamento de oscilação
    e.preventDefault(); 
    e.stopPropagation(); 
    
    // Corrige um caso especial: 'index' deve ser '/' (dashboard)
    const finalItemId = itemId === 'index' ? '' : itemId;

    handleNavigation(finalItemId);
  }
  
  return (
    // O div externo (overlay) fecha o menu ao clicar fora
    <div className={`menu-drawer ${isOpen ? 'open' : ''}`} onClick={onClose}>
      {/* O div interno impede o fechamento ao clicar no conteúdo do menu */}
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header menu-header-icon">
            <img src={plannerhubIcon} alt="Planner Hub Icon" className="app-icon" />
        </div>
        
        {/* Botão de Fechar com novo estilo */}
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <nav className="menu-nav">
          {data?.menuConfig.menuItems
            .filter(item => item.isVisible)
            .sort((a, b) => parseInt(a.order) - parseInt(b.order))
            .map(item => (
              <a
                key={item.id}
                className="menu-item"
                // Usa a função robusta de clique
                onClick={(e) => handleMenuItemClick(e, item.id)} 
              >
                {item.title}
              </a>
            ))}
        </nav>

        <div className="menu-actions">
          {/* Botões de Ação com novo estilo */}
          <button className="action-btn reset-btn" onClick={resetData}>
            RESETAR DADOS
          </button>
          <button className="action-btn export-btn" onClick={onExport}>
            SALVAR E EXPORTAR
          </button>
        </div>
      </div>
    </div>
  );
};