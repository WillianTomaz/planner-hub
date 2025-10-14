// src/pages/Schedule.tsx
import React, { useMemo, useState } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import type { ItemContent, ScheduleItem } from '../types/planner';
import { FormModal } from '../components/FormModal';
import { EditModal } from '../components/EditModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Reusable component for a single schedule item
const ScheduleEntry: React.FC<{ 
    item: ScheduleItem, 
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}> = ({ item, onEdit, onDelete }) => {
    
    const formatDateTime = (dateTimeStr: string) => {
        try {
            const date = new Date(dateTimeStr);
            if (!isNaN(date.getTime())) {
                const datePart = date.toLocaleDateString('pt-BR');
                const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return `[${datePart} ${timePart}]`;
            }
        } catch (e) {
            return `[${dateTimeStr}]: [${e}]`;
        }
        return `[${dateTimeStr}]`;
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', padding: '4px 0', borderBottom: '1px dotted var(--color-border)' }}>
            <p style={{ flexGrow: 1, marginRight: '16px', lineHeight: '1.4' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)', minWidth: '150px', display: 'inline-block' }}>
                    {formatDateTime(item.dateAndTime)}
                </span> 
                <span style={{ marginLeft: '10px' }}>
                    {item.text}
                </span>
            </p>
            <div className="task-actions" style={{ minWidth: '100px' }}>
                <button 
                    onClick={() => onEdit(item.id)} 
                    className="edit-btn" 
                    style={{ color: 'var(--color-primary)', padding: '4px 8px', fontSize: '0.8rem' }}
                >
                    EDIT
                </button>
                <button 
                    onClick={() => onDelete(item.id)} 
                    className="delete-btn" 
                    style={{ color: 'var(--color-danger)', padding: '4px 8px', fontSize: '0.8rem', marginLeft: '8px' }}
                >
                    DELETE
                </button>
            </div>
        </div>
    );
};

export const Schedule: React.FC = () => {
    const { data, updatePlannerData } = usePlannerData();
    const SCHEDULE_ID = 'schedule';
    const AGENDA_TITLE = 'MY AGENDA';

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

    const scheduleItem = useMemo(() => {
        return data?.menuConfig.menuItems.find(item => item.id === SCHEDULE_ID);
    }, [data]);

    const agendaContent = (scheduleItem?.itemsContent as ItemContent[]) || [];
    
    const allScheduleItems = useMemo(() => {
        const agendaSection = agendaContent.find(s => s.title === AGENDA_TITLE);
        const sortedItems = (agendaSection?.descriptionList || [])
            .slice()
            .sort((a, b) => 
                'dateAndTime' in a && 'dateAndTime' in b
                ? a.dateAndTime.localeCompare(b.dateAndTime)
                : 0
            );

        return sortedItems as ScheduleItem[];
    }, [agendaContent]);

    const updateAgendaInState = (newDescriptionList: ScheduleItem[]) => {
        if (!data) return;

        const newItemsContent = agendaContent.map(section => {
            if (section.title === AGENDA_TITLE) {
                return { ...section, descriptionList: newDescriptionList };
            }
            return section;
        });

        const newMenuConfig = { ...data.menuConfig };
        newMenuConfig.menuItems = newMenuConfig.menuItems.map(item => 
            item.id === SCHEDULE_ID ? { ...item, itemsContent: newItemsContent } : item
        );

        updatePlannerData({ menuConfig: newMenuConfig });
    };

    const handleDelete = (itemId: string) => {
        setDeletingItemId(itemId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deletingItemId) return;

        const newDescriptionList = allScheduleItems.filter(item => item.id !== deletingItemId);
        updateAgendaInState(newDescriptionList);
    };

    const handleEdit = (itemId: string) => {
        const currentItem = allScheduleItems.find(item => item.id === itemId);
        if (!currentItem) return;

        setEditingItem(currentItem);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (formData: any) => {
        if (!editingItem) return;

        const newDescriptionList = allScheduleItems.map(item => {
            if (item.id === editingItem.id) {
                return { 
                    ...item, 
                    text: formData.text.trim(),
                    dateAndTime: formData.dateAndTime.trim()
                };
            }
            return item;
        });
        
        updateAgendaInState(newDescriptionList);
    };

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleSaveAdd = (formData: any) => {
        const newId = Date.now().toString(); 
        const newItem: ScheduleItem = { 
            id: newId, 
            text: formData.text.trim(), 
            dateAndTime: formData.dateAndTime.trim()
        };

        const newDescriptionList = [...allScheduleItems, newItem];
        
        updateAgendaInState(newDescriptionList);
    };

    const title = scheduleItem?.title || 'Schedule';
    const addScheduleFields = [
        {
            name: 'text',
            label: 'Schedule Item',
            type: 'text' as const,
            required: true,
            placeholder: 'Enter schedule item description...'
        },
        {
            name: 'dateAndTime',
            label: 'Date & Time',
            type: 'datetime-local' as const,
            required: true
        }
    ];

    const editScheduleFields = [
        {
            name: 'text',
            label: 'Schedule Item',
            type: 'text' as const,
            required: true,
            placeholder: 'Enter schedule item description...'
        },
        {
            name: 'dateAndTime',
            label: 'Date & Time',
            type: 'datetime-local' as const,
            required: true
        }
    ];

    return (
        <div className="page-container schedule-page">
            <h2>{title}</h2>
            
            <div className="card schedule-card">
                <div className="task-list-header">
                    <h3>{AGENDA_TITLE}</h3>
                    <div className="task-actions">
                    </div>
                </div>
                
                <div className="schedule-list" style={{ marginTop: '15px' }}>
                    {allScheduleItems.length > 0 ? (
                        allScheduleItems.map(item => (
                            <ScheduleEntry 
                                key={item.id} 
                                item={item} 
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <p style={{ opacity: 0.7 }}>No schedule items yet. Add one below!</p>
                    )}
                </div>
                
                {/* Add button area at the bottom */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', width: '100%' }}>
                    <button 
                        className="modern-menu-toggle" 
                        onClick={handleAdd}
                        style={{ 
                            width: '50%',
                            textAlign: 'center',
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            borderRadius: '8px'
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} /> ADD
                    </button>
                </div>
            </div>

            {/* Add Schedule Modal */}
            <FormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleSaveAdd}
                title="Add New Schedule"
                fields={addScheduleFields}
                submitButtonText="Create"
            />

            {/* Edit Schedule Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveEdit}
                title="Edit Schedule Item"
                fields={editScheduleFields}
                initialData={editingItem ? {
                    text: editingItem.text,
                    dateAndTime: editingItem.dateAndTime
                } : {}}
                saveButtonText="SAVE CHANGES"
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingItemId(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Schedule Item"
                message="Are you sure you want to delete this schedule item? This action cannot be undone."
                confirmText="DELETE"
                cancelText="CANCEL"
                type="danger"
            />
        </div>
    );
};