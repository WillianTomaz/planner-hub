// src/pages/Schedule.tsx
import React, { useMemo, useState } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import type { ItemContent, ScheduleItem } from '../types/planner';

// Reusable component for a single schedule item
const ScheduleEntry: React.FC<{ 
    item: ScheduleItem, 
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}> = ({ item, onEdit, onDelete }) => {
    
    // Formata a data e hora para exibição
    const formatDateTime = (dateTimeStr: string) => {
        try {
            // Tenta criar um objeto Date.
            // Se o formato for "MM/DD/YYYY HH:mmAM/PM", funciona.
            const date = new Date(dateTimeStr);
            if (!isNaN(date.getTime())) {
                const datePart = date.toLocaleDateString('pt-BR');
                const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return `[${datePart} ${timePart}]`;
            }
        } catch (e) {
            // Retorna a string original se a formatação falhar
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
    const [newItemText, setNewItemText] = useState('');
    const SCHEDULE_ID = 'schedule';
    const AGENDA_TITLE = 'MY AGENDA'; // Título fixo do bloco no JSON

    const scheduleItem = useMemo(() => {
        return data?.menuConfig.menuItems.find(item => item.id === SCHEDULE_ID);
    }, [data]);

    const agendaContent = (scheduleItem?.itemsContent as ItemContent[]) || [];
    
    // Lista de todos os itens do agendamento (dentro de "MY AGENDA")
    const allScheduleItems = useMemo(() => {
        const agendaSection = agendaContent.find(s => s.title === AGENDA_TITLE);
        // Ordena os itens por data e hora (simplificado: tenta ordenar pela string)
        const sortedItems = (agendaSection?.descriptionList || [])
            .slice()
            .sort((a, b) => 
                'dateAndTime' in a && 'dateAndTime' in b
                ? a.dateAndTime.localeCompare(b.dateAndTime)
                : 0
            );

        return sortedItems as ScheduleItem[];
    }, [agendaContent]);

    // --- FUNÇÕES DE MANIPULAÇÃO DE ESTADO ---

    // Função auxiliar para atualizar o itemsContent
    const updateAgendaInState = (newDescriptionList: ScheduleItem[]) => {
        if (!data) return;

        // Atualiza a seção 'MY AGENDA' com a nova lista de agendamentos
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

    // 1. NOVO: Lógica para DELETAR um item
    const handleDelete = (itemId: string) => {
        if (!window.confirm("Confirm delete schedule item?")) return;

        const newDescriptionList = allScheduleItems.filter(item => item.id !== itemId);
        updateAgendaInState(newDescriptionList);
    };

    // 2. NOVO: Lógica para EDITAR um item
    const handleEdit = (itemId: string) => {
        const currentItem = allScheduleItems.find(item => item.id === itemId);
        if (!currentItem) return;

        const newText = window.prompt("Edit Task:", currentItem.text);
        
        if (newText === null || newText.trim() === currentItem.text) return; 

        // NOVO: Permite editar a data/hora também (opcional)
        const newDateTime = window.prompt("Edit Date/Time (e.g., 05/10/2025 11:00am):", currentItem.dateAndTime);
        
        const newDescriptionList = allScheduleItems.map(item => {
            if (item.id === itemId) {
                return { 
                    ...item, 
                    text: newText.trim(),
                    dateAndTime: newDateTime?.trim() || currentItem.dateAndTime // Usa a nova data se fornecida
                };
            }
            return item;
        });
        
        updateAgendaInState(newDescriptionList);
    };

    // 3. NOVO: Lógica para ADICIONAR um novo item
    const handleAdd = () => {
        if (!newItemText.trim()) return;

        // Pede a data/hora
        const dateTimeInput = window.prompt("Enter Date/Time for the schedule (e.g., 10/25/2025 10:00am):");
        
        if (!dateTimeInput || dateTimeInput.trim() === "") {
             alert("Date/Time is required to add a schedule item.");
             return;
        }

        const newId = Date.now().toString(); 
        const newItem: ScheduleItem = { 
            id: newId, 
            text: newItemText.trim(), 
            dateAndTime: dateTimeInput.trim()
        };

        const newDescriptionList = [...allScheduleItems, newItem];
        
        updateAgendaInState(newDescriptionList);
        setNewItemText(''); // Limpa o input
    };
    
    // --- RENDERIZAÇÃO ---

    const title = scheduleItem?.title || 'Schedule';

    return (
        <div className="page-container schedule-page">
            <h2>{title}</h2>
            
            <div className="card schedule-card">
                <div className="task-list-header">
                    <h3>{AGENDA_TITLE}</h3>
                    {/* Estes botões de ação na seção inteira não serão implementados por enquanto para manter o foco na funcionalidade por item */}
                    <div className="task-actions">
                        {/* <button className="edit-btn" style={{ color: 'var(--color-primary)' }}>EDIT ALL</button>
                        <button className="delete-btn" style={{ color: 'var(--color-danger)' }}>DELETE ALL</button> */}
                    </div>
                </div>
                
                <div className="schedule-list" style={{ marginTop: '15px' }}>
                    {allScheduleItems.length > 0 ? (
                        allScheduleItems.map(item => (
                            <ScheduleEntry 
                                key={item.id} 
                                item={item} 
                                // Passa os manipuladores de evento
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <p style={{ opacity: 0.7 }}>No schedule items yet. Add one below!</p>
                    )}
                </div>
                
                {/* Input/Button area at the bottom */}
                <div style={{ display: 'flex', marginTop: '20px' }}>
                    <input 
                        type="text" 
                        placeholder="Add New Schedule Item" 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                        }}
                        style={{ 
                            flexGrow: 1, 
                            padding: 'var(--spacing-sm) var(--spacing-md)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '8px 0 0 8px',
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text)',
                            fontSize: '1rem'
                        }}
                    />
                    <button 
                        className="modern-menu-toggle" 
                        onClick={handleAdd}
                        disabled={!newItemText.trim()}
                        style={{ 
                            textAlign: 'center',
                            width: '100px',
                            borderRadius: '0 8px 8px 0',
                            padding: 'var(--spacing-sm) var(--spacing-lg)'
                        }}
                    >
                        ADD
                    </button>
                </div>
            </div>
        </div>
    );
};