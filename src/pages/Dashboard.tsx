// src/pages/Dashboard.tsx
import React, { useMemo } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import type { MenuItem, ItemContent, TodoItem, AnnotationItem, ScheduleItem, DescriptionItem } from '../types/planner';

// Utility function to get the current day of the week in Portuguese
const getWeekDayName = (date: Date): string => {
    // Array dos dias da semana em Português, começando por Domingo (índice 0)
    const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
    return days[date.getDay()];
};

// Component that handles the specific content logic for the dashboard preview
const DashboardContentPreview: React.FC<{ item: MenuItem & { itemsContent: ItemContent[] } }> = ({ item }) => {
    
    const { itemsContent, id } = item;
    // Pega a data/hora atual para referências futuras
    const now = useMemo(() => new Date(), []);
    const weekDay = useMemo(() => getWeekDayName(now), [now]);

    // Lógica para selecionar os itens específicos com base no ID
    const { selectedItems, dailySectionTitle } = useMemo(() => {
        
        // Função para analisar a string de data/hora do Schedule (DD/MM/YYYY HH:mmAM/PM)
        const parseScheduleDate = (dateAndTime: string): Date | null => {
            // Regex para capturar as partes: DD/MM/YYYY HH:mmAM/PM
            const parts = dateAndTime.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})(am|pm)/i);
            if (parts) {
                // No formato JSON: [1]=Dia, [2]=Mês, [3]=Ano, [4]=Hora, [5]=Minuto, [6]=AM/PM
                const [, day, month, year, hour, minute, ampm] = parts;
                let h = parseInt(hour, 10);
                const m = parseInt(minute, 10);

                // Conversão de 12h para 24h
                if (ampm.toLowerCase() === 'pm' && h < 12) h += 12;
                if (ampm.toLowerCase() === 'am' && h === 12) h = 0; // 12:xx AM = 0h

                // O construtor Date() em JS usa Mês com índice 0 (Mês - 1)
                return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, m);
            }
            return null;
        };

        let dailySectionTitle: string | undefined = undefined;
        let selectedItems: DescriptionItem[] = [];
        
        if (id === 'pro-todo' || id === 'per-todo') {
            // 1. TODO LISTS: Encontrar a seção do dia atual
            const dailySection = itemsContent.find(section => section.title.toUpperCase() === weekDay);
            
            if (dailySection) {
                // CAPTURA DO TÍTULO DA SEÇÃO
                dailySectionTitle = dailySection.title;
                
                // Retorna até 3 tarefas não concluídas do dia
                selectedItems = (dailySection.descriptionList as TodoItem[])
                    .filter(todo => !todo.completed)
                    .slice(0, 3);
            }
            
        } else if (id === 'annotations') {
            // 2. ANNOTATIONS: Obter a última anotação (mais recente)
            const allNotes = itemsContent.flatMap(section => section.descriptionList as AnnotationItem[]);
            
            if (allNotes.length > 0) {
                selectedItems = [allNotes[allNotes.length - 1]]; 
            }
            
        } else if (id === 'schedule') {
            // 3. SCHEDULE: Obter agendamentos de hoje OU o próximo
            const allSchedules = itemsContent.flatMap(section => section.descriptionList as ScheduleItem[]);

            // Filtra e ordena agendamentos futuros
            const futureSchedules: (ScheduleItem & { dateObj: Date })[] = allSchedules
                .map(item => {
                    const dateObj = parseScheduleDate(item.dateAndTime);
                    // Filtra itens que não puderam ser analisados ou que já passaram
                    if (dateObj && dateObj.getTime() >= now.getTime()) {
                        return { ...item, dateObj };
                    }
                    return null;
                })
                .filter((item): item is ScheduleItem & { dateObj: Date } => item !== null)
                .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Ordena por data/hora ascendente

            // Prepara a data de início e fim do dia atual
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            // Filtra os agendamentos que caem DENTRO do dia de hoje (e já são futuros)
            const todaysSchedules = futureSchedules
                .filter(item => item.dateObj.getTime() >= todayStart.getTime() && item.dateObj.getTime() <= todayEnd.getTime())
                .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Ordena por horário

            if (todaysSchedules.length > 0) {
                // Define o título da seção como 'HOJE'
                dailySectionTitle = 'HOJE';
                selectedItems = todaysSchedules;
            } else if (futureSchedules.length > 0) {
                // Define o título como 'PRÓXIMO EVENTO'
                dailySectionTitle = 'PRÓXIMO EVENTO';
                selectedItems = [futureSchedules[0]];
            }
        }
        
        return { selectedItems, dailySectionTitle };
    }, [itemsContent, id, weekDay, now]);


    // Helper para formatar a exibição do item
    const formatItemDisplay = (item: DescriptionItem): string => {
        // A função parseScheduleDate precisa estar disponível aqui, ou a lógica repetida/isolada.
        // Vou repeti-la para manter o escopo local, já que é uma função auxiliar e leve.
        const parseScheduleDate = (dateAndTime: string): Date | null => {
            const parts = dateAndTime.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})(am|pm)/i);
            if (parts) {
                const [, day, month, year, hour, minute, ampm] = parts;
                let h = parseInt(hour, 10);
                const m = parseInt(minute, 10);
                if (ampm.toLowerCase() === 'pm' && h < 12) h += 12;
                if (ampm.toLowerCase() === 'am' && h === 12) h = 0;
                return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, m);
            }
            return null;
        };

        if ('dateAndTime' in item) { // ScheduleItem
            const schedule = item as ScheduleItem;
            const date = parseScheduleDate(schedule.dateAndTime);
            
            if (date) {
                const isToday = date.toDateString() === now.toDateString();
                const datePart = isToday ? 'Hoje' : date.toLocaleDateString('pt-BR');
                const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return `[${datePart} ${timePart}] ${schedule.text}`;
            }
            return `[${schedule.dateAndTime}] ${schedule.text}`;
            
        } else if ('text' in item) { // TodoItem
            return (item as TodoItem).text;
            
        } else if ('title' in item) { // AnnotationItem
            const annotation = item as AnnotationItem;
            const snippet = annotation.description.length > 50 ? annotation.description.substring(0, 50) + '...' : annotation.description;
            // Garante que o texto em negrito seja visível, mas pode precisar de um componente de Markdown para renderização real.
            return `${annotation.title}: ${snippet}`; 
        }
        return 'Item de Conteúdo Inválido';
    };

    return (
        <div style={{ marginTop: '10px' }}>
            
            {/* NOVO: Exibe o título da seção do dia (TODO List) ou o status (Schedule) */}
            {dailySectionTitle && (
                 <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                    {dailySectionTitle}
                </h4>
            )}

            {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => (
                    // Usar o ID do item se existir, senão o index
                    <p 
                        key={(item as any).id || index} 
                        style={{ 
                            fontSize: '0.9rem', 
                            margin: '4px 0', 
                            whiteSpace: 'pre-wrap',
                            // Estiliza o texto do título da anotação
                            fontWeight: 'title' in item ? 'bold' : 'normal'
                        }}
                    >
                        {formatItemDisplay(item)}
                    </p>
                ))
            ) : (
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                    {id === 'pro-todo' || id === 'per-todo' 
                        ? `Nenhuma tarefa para ${weekDay}.` 
                        : id === 'annotations' 
                        ? 'Nenhuma anotação disponível.' 
                        : id === 'schedule' 
                        ? 'Nenhum agendamento futuro encontrado.'
                        : 'Nenhuma informação disponível.'
                    }
                </p>
            )}
            
            {/* Adiciona um link para a página completa */}
            {item.link && (
                <a href={`/${item.link}`} style={{ fontSize: '0.8rem', marginTop: '10px', display: 'block', color: 'var(--color-primary)' }}>
                    Ver mais...
                </a>
            )}
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { data } = usePlannerData();
    
    const timestamp = useMemo(() => {
        const now = new Date();
        // Formato para exibição
        return `${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString('pt-BR')}`;
    }, []);

    // Filtra itens do menu para exibir no dashboard, garantindo que tenham conteúdo
    const dashboardItems = useMemo(() => {
        return data?.menuConfig.menuItems.filter(
            (item): item is MenuItem & { itemsContent: ItemContent[] } => 
                item.showOnDashboard === true && Array.isArray(item.itemsContent) && item.itemsContent.length > 0
        ) || [];
    }, [data]);

    return (
        <div className="page-container dashboard-page">
            <div className="dashboard-grid">
                {dashboardItems.map(item => (
                    <div key={item.id} className="card dashboard-card">
                        {/* Título Principal do Item (Ex: [PRO] TODO LIST) */}
                        <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                            {item.title}
                        </h3>
                        
                        {/* Conteúdo Inteligente, incluindo o subtítulo do dia */}
                        <DashboardContentPreview item={item} />
                    </div>
                ))}
            </div>
            
            {/* Display de Data/Hora */}
            <div style={{ 
                position: 'absolute', 
                top: '30px', 
                right: '30px', 
                fontSize: '0.8rem', 
                fontWeight: '600',
                backgroundColor: 'var(--color-surface)',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: 'var(--shadow-elevation-low)' 
            }}>
                {timestamp}
            </div>
        </div>
    );
};