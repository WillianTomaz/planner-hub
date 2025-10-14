// src/pages/Annotations.tsx
import React, { useMemo, useState } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import type { ItemContent, AnnotationItem } from '../types/planner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FormModal } from '../components/FormModal';
import { EditModal } from '../components/EditModal';
import { ConfirmModal } from '../components/ConfirmModal';

// Reusable component for a single annotation card
const AnnotationCard: React.FC<{ 
    item: AnnotationItem, 
    sectionTitle: string, 
    onEdit: (id: string, sectionTitle: string) => void,  // Edita título e descrição juntos
    onDelete: (id: string, sectionTitle: string) => void 
}> = ({ item, sectionTitle, onEdit, onDelete }) => {
  return (
    <div className="card">
      <div className="annotation-card">
        <div className="task-list-header" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
          <h3 style={{ margin: '10px', flex: 1 }}>{item.title}</h3>
        </div>

        <div className="annotation-card-content">
          <p>{item.description}</p>
        </div>        
      </div>
    
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: '4px',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
      >
        <button
          onClick={() => onEdit(item.id, sectionTitle)}
          className="edit-btn"
          style={{ background: 'var(--color-primary)', padding: '10px 50px', margin: '2px' }}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
        <button
          onClick={() => onDelete(item.id, sectionTitle)}
          className="delete-btn"
          style={{ color: 'var(--color-danger)', padding: '10px 50px', margin: '2px' }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      </div >
  );
};

export const Annotations: React.FC = () => {
  const { data, updatePlannerData } = usePlannerData();
  const ANNOTATIONS_ID = 'annotations';

  // Modal states - simplificados
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{ note: AnnotationItem; sectionTitle: string } | null>(null);
  const [deletingNote, setDeletingNote] = useState<{ noteId: string; sectionTitle: string } | null>(null);

  const annotationsItem = useMemo(() => {
    return data?.menuConfig.menuItems.find(item => item.id === ANNOTATIONS_ID);
  }, [data]);

  const annotationsContent = (annotationsItem?.itemsContent as ItemContent[]) || [];

  // Helper para mapear o itemsContent e aplicar uma mudança
  const mapItemsContent = (
    sectionTitle: string, 
    callback: (notes: AnnotationItem[]) => AnnotationItem[]
  ) => {
    if (!annotationsItem || !Array.isArray(annotationsItem.itemsContent)) return null;

    return annotationsItem.itemsContent.map(section => {
      if (section.title === sectionTitle) {
        const updatedDescriptionList = callback(section.descriptionList as AnnotationItem[]);
        return { ...section, descriptionList: updatedDescriptionList };
      }
      return section;
    });
  };

  const updateItemsContentInState = (newItemsContent: ItemContent[]) => {
    if (!data) return;

    const newMenuConfig = { ...data.menuConfig };
    newMenuConfig.menuItems = newMenuConfig.menuItems.map(item => 
      item.id === ANNOTATIONS_ID ? { ...item, itemsContent: newItemsContent } : item
    );

    updatePlannerData({ menuConfig: newMenuConfig });
  }


  // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS ---
  const handleDelete = (noteId: string, sectionTitle: string) => {
    setDeletingNote({ noteId, sectionTitle });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingNote) return;

    const newItemsContent = mapItemsContent(deletingNote.sectionTitle, (notes) => {
      return notes.filter(note => note.id !== deletingNote.noteId);
    });

    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };

  // Função unificada para editar nota (título e descrição juntos)
  const handleEditNote = (noteId: string, sectionTitle: string) => {
    const section = annotationsContent.find(s => s.title === sectionTitle);
    const currentNote = (section?.descriptionList as AnnotationItem[] || []).find(n => n.id === noteId);
    
    if (!currentNote) return;

    setEditingNote({ note: currentNote, sectionTitle });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (formData: any) => {
    if (!editingNote) return;

    const newItemsContent = mapItemsContent(editingNote.sectionTitle, (notes) => {
      return notes.map(note => {
        if (note.id === editingNote.note.id) {
          return { 
            ...note, 
            title: formData.title.trim(),
            description: formData.description.trim()
          };
        }
        return note;
      });
    });

    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };


  // 3. CORREÇÃO: Lógica para ADICIONAR - Simplificada
  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (formData: any) => {
    // Automaticamente insere na PRIMEIRA seção encontrada
    const targetSection = annotationsContent[0];
    
    if (!targetSection) {
        alert("Cannot add note: No annotation section found in data structure. Please ensure at least one section exists.");
        return;
    }

    const newId = Date.now().toString(); 
    const newNote: AnnotationItem = { 
        id: newId, 
        title: formData.title.trim(), 
        description: formData.description.trim()
    };

    // Usa a seção alvo encontrada automaticamente
    const newItemsContent = mapItemsContent(targetSection.title, (notes) => {
        // Adiciona a nova nota ao final da lista da PRIMEIRA seção
        return [...notes, newNote];
    });

    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };
  
  const title = annotationsItem?.title || 'Annotations';

  // Modal field configurations
  const addNoteFields = [
    {
      name: 'title',
      label: 'Note Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter note title...'
    },
    {
      name: 'description',
      label: 'Note Content',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Enter note content...'
    }
  ];

  // Modal unificado para edição (título e descrição juntos)
  const editNoteFields = [
    {
      name: 'title',
      label: 'Note Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter note title...'
    },
    {
      name: 'description',
      label: 'Note Content',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Enter note content...'
    }
  ];

  return (
    <div className="page-container annotations-page">
      <div className="annotations-title">
        <h2>{title}</h2>
        <div className='annotations-add'>
          <button className="modern-menu-toggle" onClick={handleAdd} style={{ height: '40px', width: '80px' }}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <div className="annotations-grid">
        {annotationsContent.map((section) => (
          (section.descriptionList as AnnotationItem[]).map(note => (
            <AnnotationCard 
              key={note.id} 
              item={note} 
              sectionTitle={section.title}
              onEdit={handleEditNote}
              onDelete={handleDelete}
            />
          ))
        ))}
      </div>
      

      {/* Add Note Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSaveAdd}
        title="Add New Note"
        fields={addNoteFields}
        submitButtonText="ADD NOTE"
      />

      {/* Edit Note Modal - Unificado (título e descrição juntos) */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveEdit}
        title="Edit Note"
        fields={editNoteFields}
        initialData={editingNote ? {
          title: editingNote.note.title,
          description: editingNote.note.description
        } : {}}
        saveButtonText="SAVE CHANGES"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingNote(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      />
    </div>
  );
};