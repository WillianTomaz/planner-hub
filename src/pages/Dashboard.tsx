// src/pages/Dashboard.tsx
import React, { useMemo } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import type { MenuItem, ItemContent } from '../types/planner';

// Mock component to render the list item preview
const DashboardContentPreview: React.FC<{ itemContent: ItemContent[] }> = ({ itemContent }) => {
  const listItems = itemContent.flatMap(section => 
    section.descriptionList.slice(0, 3) // Show first 3 items as a preview
  );

  return (
    <div style={{ marginTop: '10px' }}>
      {listItems.length > 0 ? (
        listItems.map((item, index) => (
          <p key={index} style={{ fontSize: '0.9rem', margin: '4px 0' }}>
            {'dateAndTime' in item
              ? `[${item.dateAndTime.split(' ')[0]}] ${item.text}`
              : 'text' in item
              ? item.text
              : 'title' in item
              ? item.title
              : ''}
          </p>
        ))
      ) : (
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No data available.</p>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { data } = usePlannerData();
  const timestamp = useMemo(() => {
    const now = new Date();
    return `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString('en-US')}`;
  }, []);

  // Filter menu items that should be displayed on the dashboard
  const dashboardItems = useMemo(() => {
    return data?.menuConfig.menuItems.filter(
      (item): item is MenuItem & { itemsContent: ItemContent[] } => 
        item.showOnDashboard === true && Array.isArray(item.itemsContent)
    ) || [];
  }, [data]);

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-grid">
        {dashboardItems.map(item => (
          <div key={item.id} className="card dashboard-card">
            <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '8px' }}>
              {item.title}
            </h3>
            
            <DashboardContentPreview itemContent={item.itemsContent} />
          </div>
        ))}
        
        {/* Placeholder for the Date/Time in the top right corner (as seen in image) */}
        <div style={{ 
          position: 'absolute', 
          top: '30px', 
          right: '30px', 
          fontSize: '0.8rem', 
          fontWeight: '600',
          backgroundColor: 'var(--color-surface)',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          {timestamp}
        </div>
      </div>
    </div>
  );
};