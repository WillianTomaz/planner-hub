// src/pages/TodoList.tsx
import React, { useMemo, useState } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import type { TodoItem, ItemContent } from '../types/planner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FormModal } from '../components/FormModal';
import { EditModal } from '../components/EditModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface TodoListProps {
  categoryId: 'pro-todo' | 'per-todo';
}

// Reusable component for a single section (e.g., 'SEGUNDA-FEIRA')
const DailyTaskList: React.FC<{ 
  section: ItemContent, 
  updateTask: (id: string, completed: boolean, sectionTitle: string) => void,
  onEdit: (id: string, sectionTitle: string) => void,
  onDelete: (id: string, sectionTitle: string) => void,
  onAddTask: (sectionTitle: string) => void,
}> = ({ section, updateTask, onEdit, onDelete, onAddTask }) => {
  
  // Cast descriptionList to TodoItem[] based on the category type
  const todos = section.descriptionList as TodoItem[];
  const sectionTitle = section.title;

  return (
    <div className="task-list-section card">
      <div className="task-list-header">
        <h3>{sectionTitle}</h3>
        {/* O botão DELETE da seção não estava sendo usado, mantive o estilo do CSS para o h3 */}
      </div>
      
      {todos.map(todo => (
        <div key={todo.id} className={`task-item ${todo.completed ? 'completed' : ''}`}>
          <input 
            type="checkbox" 
            checked={!!todo.completed} 
            // O updateTask agora usa o título da seção para saber onde atualizar
            onChange={(e) => updateTask(todo.id, e.target.checked, sectionTitle)}
          />
          {/* O estilo é tratado pela classe CSS .task-item.completed .task-text */}
          <span className="task-text">
            {todo.text}
          </span>
          <div className="task-actions">
            {/* NOVO: Botão EDIT funcional */}
            <button 
                className="edit-btn" 
                onClick={() => onEdit(todo.id, sectionTitle)}
                style={{ color: 'var(--color-primary)' }}
            >
                EDIT
            </button>
            {/* NOVO: Botão DELETE funcional */}
            <button 
                className="delete-btn" 
                onClick={() => onDelete(todo.id, sectionTitle)}
                style={{ color: 'var(--color-danger)' }}
            >
                DELETE
            </button>
          </div>
        </div>
      ))}
      {/* NOVO: Botão ADD TASK funcional */}
      {/* TODO: Padronizar esse botão com os do internos da dashboard "link-to-full-page" */}
      <button 
        style={{ marginTop: '10px', width: '100%', background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        onClick={() => onAddTask(sectionTitle)}
      >
        <FontAwesomeIcon icon={faPlus} /> ADD TASK
      </button>
    </div>
  );
};

export const TodoList: React.FC<TodoListProps> = ({ categoryId }) => {
  const { data, updatePlannerData } = usePlannerData();
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ task: TodoItem; sectionTitle: string } | null>(null);
  const [deletingTask, setDeletingTask] = useState<{ taskId: string; sectionTitle: string } | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('');

  const menuItem = useMemo(() => {
    return data?.menuConfig.menuItems.find(item => item.id === categoryId);
  }, [data, categoryId]);

  // Função centralizada para atualizar o estado com um novo itemsContent
  const updateItemsContentInState = (newItemsContent: ItemContent[]) => {
    if (!data) return;

    const newMenuConfig = { ...data.menuConfig };
    newMenuConfig.menuItems = newMenuConfig.menuItems.map(item => 
      item.id === categoryId ? { ...item, itemsContent: newItemsContent } : item
    );

    updatePlannerData({ menuConfig: newMenuConfig });
  }

  // Helper para mapear o itemsContent e aplicar uma mudança na lista de tarefas
  const mapItemsContent = (
    sectionTitle: string, 
    callback: (tasks: TodoItem[]) => TodoItem[]
  ) => {
    if (!menuItem || !Array.isArray(menuItem.itemsContent)) return;

    return menuItem.itemsContent.map(section => {
      if (section.title === sectionTitle) {
        // Aplica o callback para obter a lista de tarefas atualizada
        const updatedDescriptionList = callback(section.descriptionList as TodoItem[]);
        return { ...section, descriptionList: updatedDescriptionList };
      }
      return section;
    });
  };

  // 1. Lógica para completar/descompletar (Existente, mas ligeiramente ajustada)
  const handleToggleComplete = (taskId: string, completed: boolean, sectionTitle: string) => {
    const newItemsContent = mapItemsContent(sectionTitle, (tasks) => {
      return tasks.map(item => {
        if (item.id === taskId) {
          return { ...item, completed: completed };
        }
        return item;
      });
    });
    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };

  // 2. NOVO: Lógica para DELETAR uma tarefa
  const handleDeleteTask = (taskId: string, sectionTitle: string) => {
    setDeletingTask({ taskId, sectionTitle });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingTask) return;

    const newItemsContent = mapItemsContent(deletingTask.sectionTitle, (tasks) => {
      // Filtra a tarefa com o ID especificado
      return tasks.filter(item => item.id !== deletingTask.taskId);
    });
    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };

  // 3. NOVO: Lógica para EDITAR uma tarefa
  const handleEditTask = (taskId: string, sectionTitle: string) => {
    const section = (menuItem?.itemsContent as ItemContent[] || []).find(s => s.title === sectionTitle);
    const currentTask = (section?.descriptionList as TodoItem[] || []).find(t => t.id === taskId);
    
    if (!currentTask) return;

    setEditingTask({ task: currentTask, sectionTitle });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (formData: any) => {
    if (!editingTask) return;

    const newItemsContent = mapItemsContent(editingTask.sectionTitle, (tasks) => {
      return tasks.map(item => {
        if (item.id === editingTask.task.id) {
          return { ...item, text: formData.text.trim(), completed: formData.completed };
        }
        return item;
      });
    });
    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };

  // 4. NOVO: Lógica para ADICIONAR uma nova tarefa
  const handleAddTask = (sectionTitle: string) => {
    setCurrentSection(sectionTitle);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (formData: any) => {
    const newId = Date.now().toString();
    const newTask: TodoItem = { 
        id: newId, 
        text: formData.text.trim(), 
        completed: false 
    };

    const newItemsContent = mapItemsContent(currentSection, (tasks) => {
      return [...tasks, newTask];
    });
    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };


  const title = menuItem?.description || 'Loading List...';
  const sections = (menuItem?.itemsContent as ItemContent[]) || [];

  // Modal field configurations
  const addTaskFields = [
    {
      name: 'text',
      label: 'Task Description',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter task description...'
    }
  ];

  const editTaskFields = [
    {
      name: 'text',
      label: 'Task Description',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter task description...'
    },
    {
      name: 'completed',
      label: 'Completed',
      type: 'checkbox' as const,
      required: false
    }
  ];

  return (
    <div className="page-container todo-page">
      <h2>{title}</h2>
      <div className="todo-list-grid">
        {sections.map(section => (
          <DailyTaskList 
            key={section.title} 
            section={section} 
            // Passa os manipuladores de evento
            updateTask={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      {/* Add Task Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveAdd}
        title="Add New Task"
        fields={addTaskFields}
        submitButtonText="ADD TASK"
      />

      {/* Edit Task Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEdit}
        title="Edit Task"
        fields={editTaskFields}
        initialData={editingTask ? {
          text: editingTask.task.text,
          completed: editingTask.task.completed || false
        } : {}}
        saveButtonText="SAVE CHANGES"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      />
    </div>
  );
};