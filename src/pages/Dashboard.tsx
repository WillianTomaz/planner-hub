import React, { useMemo } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import { useNavigate } from 'react-router-dom';

import type { MenuItem, ItemContent, TodoItem, AnnotationItem, ScheduleItem, DescriptionItem } from '../types/planner';

// Utility function to get the current day of the week in Portuguese
const getWeekDayName = (date: Date): string => {
    // Array of days of the week, starting with Sunday (index 0)
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
};

// Component that handles the specific content logic for the dashboard preview
const DashboardContentPreview: React.FC<{ item: MenuItem & { itemsContent: ItemContent[] } }> = ({ item }) => {
    
    const navigate = useNavigate();
    const { itemsContent, id } = item;
    // Gets the current date/time for future reference
    const now = useMemo(() => new Date(), []);
    const weekDay = useMemo(() => getWeekDayName(now), [now]);

    // Logic to select specific items based on ID
    const { selectedItems, dailySectionTitle } = useMemo(() => {
        
        // Function to parse the Schedule date/time string (DD/MM/YYYY HH:mmAM/PM)
        const parseScheduleDate = (dateAndTime: string): Date | null => {
            // Regex to capture the parts: DD/MM/YYYY HH:mmAM/PM
            const parts = dateAndTime.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})(am|pm)/i);
            if (parts) {
                // In JSON format: [1]=Day, [2]=Month, [3]=Year, [4]=Hour, [5]=Minute, [6]=AM/PM
                const [, day, month, year, hour, minute, ampm] = parts;
                let h = parseInt(hour, 10);
                const m = parseInt(minute, 10);

                // Conversion from 12h to 24h
                if (ampm.toLowerCase() === 'pm' && h < 12) h += 12;
                if (ampm.toLowerCase() === 'am' && h === 12) h = 0; // 12:xx AM = 0h

                // The Date() constructor in JS uses Month with index 0 (Month - 1)
                return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, m);
            }
            return null;
        };

        let dailySectionTitle: string | undefined = undefined;
        let selectedItems: DescriptionItem[] = [];
        
        if (id === 'pro-todo' || id === 'per-todo') {
            // 1. TODO LISTS: Find the current day's section
            const dailySection = itemsContent.find(section => section.title.toUpperCase() === weekDay);
            
            if (dailySection) {
                // CAPTURE SECTION TITLE
                dailySectionTitle = (dailySection.title).toUpperCase();
                
                // Returns up to 3 uncompleted tasks for the day
                selectedItems = (dailySection.descriptionList as TodoItem[])
                    .filter(todo => !todo.completed)
                    .slice(0, 3);
            }
            
        } else if (id === 'annotations') {
            // 2. ANNOTATIONS: Get the last (most recent) annotation
            const allNotes = itemsContent.flatMap(section => section.descriptionList as AnnotationItem[]);
            
            if (allNotes.length > 0) {
                dailySectionTitle = (allNotes[allNotes.length - 1].title).toUpperCase();
                selectedItems = [allNotes[allNotes.length - 1]]; 
            }
            
        } else if (id === 'schedule') {
            // 3. SCHEDULE: Get appointments for today OR next day
            const allSchedules = itemsContent.flatMap(section => section.descriptionList as ScheduleItem[]);

            // Filters and sorts future appointments
            const futureSchedules: (ScheduleItem & { dateObj: Date })[] = allSchedules
                .map(item => {
                    const dateObj = parseScheduleDate(item.dateAndTime);
                    // Filters items that could not be analyzed or that have already passed
                    if (dateObj && dateObj.getTime() >= now.getTime()) {
                        return { ...item, dateObj };
                    }
                    return null;
                })
                .filter((item): item is ScheduleItem & { dateObj: Date } => item !== null)
                .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Sorts by ascending date/time

            // Sets the start and end date of the current day
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            // Filters appointments that fall WITHIN today (and are already future)
            const todaysSchedules = futureSchedules
                .filter(item => item.dateObj.getTime() >= todayStart.getTime() && item.dateObj.getTime() <= todayEnd.getTime())
                .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Sorts by time

            if (todaysSchedules.length > 0) {
                // Sets the section title to 'TODAY'
                dailySectionTitle = 'TODAY';
                selectedItems = todaysSchedules;
            } else if (futureSchedules.length > 0) {
                dailySectionTitle = 'UPCOMING EVENTS:';
                selectedItems = [futureSchedules[0]];
            }
        }
        
        return { selectedItems, dailySectionTitle };
    }, [itemsContent, id, weekDay, now]);


    // Helper to format the item display
    const formatItemDisplay = (item: DescriptionItem): string => {
        // The parseScheduleDate function needs to be available here, or the logic repeated/isolated.
        // I'll repeat it to maintain local scope, since it's a lightweight helper function. 
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
                const datePart = isToday ? 'Today' : date.toLocaleDateString('pt-BR');
                const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return `[${datePart} ${timePart}] ${schedule.text}`;
            }
            return `[${schedule.dateAndTime}] ${schedule.text}`;
            
        } else if ('text' in item) { // TodoItem
            return (item as TodoItem).text;
            
        } else if ('title' in item) { // AnnotationItem
            const annotation = item as AnnotationItem;
            const snippet = annotation.description.length > 50 ? annotation.description.substring(0, 50) + '...' : annotation.description;
            // Ensures bold text is visible, but may require a Markdown component for actual rendering.
            return `${snippet}`; 
        }
        return 'Item de Conteúdo Inválido';
    };

    // Function for navigation
    const handleNavigation = (pathId: string) => {
        // 1. Close the menu
        // onClose(); 
        
        // 2. Construct the path (e.g. 'annotations' -> '/annotations')
        const path = `/${pathId}`;
        
        // 3. Browse
        navigate(path); 
    };
    // Function that handles the menu item click event (Fixed and elegant)
    const handleMenuItemClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: string) => {
        // ESSENTIAL: Prevents event propagation to avoid flickering behavior
        e.preventDefault(); 
        e.stopPropagation(); 
        
        // Fixes a special case: 'index' must be '/' (dashboard)
        const finalItemId = itemId === 'index' ? '' : itemId;

        handleNavigation(finalItemId);
    }

    return (
        <div className="dashboard-content-preview" style={{ marginTop: '10px' }}>
            
            {/* NEW: Displays the day's section title (TODO List) or status (Schedule) */}
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
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            verticalAlign: 'middle', 
                            minHeight: '0px',
                            fontSize: '1.0rem', 
                            margin: '10px 0', 
                            whiteSpace: 'prewrap',
                        }}
                    >
                        {formatItemDisplay(item)}
                    </p>
                ))
            ) : (
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                    {id === 'pro-todo' || id === 'per-todo' 
                        ? `No task to ${weekDay}.` 
                        : id === 'annotations' 
                        ? 'No notes available.'
                        : id === 'schedule' 
                        ? 'No future appointments found.'
                        : 'No information available.'
                    }
                </p>
            )}
            
            {/* Adds a link to the full page */}
            {item.link && (
                <a className="link-to-full-page"
                    key={item.id}
                    onClick={(e) => handleMenuItemClick(e, item.id)} >
                    {item.description}
                </a>
            )}
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { data } = usePlannerData();
        
    const timestamp = useMemo(() => {
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long', // Friday
            year: 'numeric', // 2024
            month: 'long',   // October
            day: '2-digit',  // 09
        };
        const date = now.toLocaleDateString('en-US', dateOptions);
        return `${time} | ${date}`;
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
            {/* Date/Time Display */}
            <div className="dashboard-time-content">
                {timestamp}
            </div>
            <div>
                <div className="dashboard-grid">
                    {dashboardItems.map(item => (
                        <div key={item.id} className="card dashboard-card">
                            {/* Main Item Title (Ex: [PRO] TODO LIST) */}
                            <h3 style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                                {item.description}
                            </h3>
                            
                            {/* Smart Content, including the day's subtitle */}
                            <DashboardContentPreview item={item} />
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
};