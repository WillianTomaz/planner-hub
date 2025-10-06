// src/pages/Annotations.tsx
import React, { useMemo } from 'react';
import { usePlannerData } from '../hooks/usePlannerData';
import { ItemContent, AnnotationItem } from '../types/planner';

// Reusable component for a single annotation card
const AnnotationCard: React.FC<{ 
    item: AnnotationItem, 
    sectionTitle: string, 
    onEditTitle: (id: string, sectionTitle: string) => void,       // Edita apenas o título
    onEditDescription: (id: string, sectionTitle: string) => void, // Edita apenas a descrição (conteúdo)
    onDelete: (id: string, sectionTitle: string) => void 
}> = ({ item, sectionTitle, onEditTitle, onEditDescription, onDelete }) => {
  return (
    <div className="card annotation-card">
      <div className="task-list-header" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
        
        {/* Título da Nota com botão de edição lateral */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 style={{ margin: 0 }}>{item.title}</h3> 
            <button 
                onClick={() => onEditTitle(item.id, sectionTitle)} 
                title="Edit Note Title"
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-secondary)', 
                    cursor: 'pointer', 
                    fontSize: '1rem', 
                    padding: '4px', 
                    lineHeight: '1',
                    marginLeft: '8px'
                }}
            >
                📝
            </button>
        </div>
        
        {/* Removido a exibição de Categoria para simplificar a interface */}
      </div>
      
      <div className="annotation-card-content">
        <p>{item.description}</p>
      </div>
      
      <div className="task-actions" style={{ marginTop: '10px', textAlign: 'right' }}>
        <button 
            onClick={() => onEditDescription(item.id, sectionTitle)} 
            className="edit-btn" 
            style={{ color: 'var(--color-primary)', padding: '4px 8px' }}
        >
            EDIT CONTENT
        </button>
        <button 
            onClick={() => onDelete(item.id, sectionTitle)} 
            className="delete-btn" 
            style={{ color: 'var(--color-danger)', padding: '4px 8px', marginLeft: '8px' }}
        >
            DELETE NOTE
        </button>
      </div>
    </div>
  );
};

export const Annotations: React.FC = () => {
  const { data, updatePlannerData } = usePlannerData();
  const ANNOTATIONS_ID = 'annotations';

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


  // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (Inalteradas) ---
  const handleDelete = (noteId: string, sectionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete this note?`)) return;

    const newItemsContent = mapItemsContent(sectionTitle, (notes) => {
      return notes.filter(note => note.id !== noteId);
    });

    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };

  const handleEditTitle = (noteId: string, sectionTitle: string) => {
    const section = annotationsContent.find(s => s.title === sectionTitle);
    const currentNote = (section?.descriptionList as AnnotationItem[] || []).find(n => n.id === noteId);
    
    if (!currentNote) return;

    const newTitle = window.prompt("Edit Note Title:", currentNote.title);
    if (!newTitle || newTitle.trim() === currentNote.title) return; 

    const newItemsContent = mapItemsContent(sectionTitle, (notes) => {
      return notes.map(note => {
        if (note.id === noteId) {
          return { ...note, title: newTitle.trim() }; 
        }
        return note;
      });
    });

    if (newItemsContent) {
      updateItemsContentInState(newItemsContent);
    }
  };

  const handleEditDescription = (noteId: string, sectionTitle: string) => {
    const section = annotationsContent.find(s => s.title === sectionTitle);
    const currentNote = (section?.descriptionList as AnnotationItem[] || []).find(n => n.id === noteId);
    
    if (!currentNote) return;

    const newDescription = window.prompt("Edit Note Content:", currentNote.description);
    if (newDescription === null || newDescription.trim() === currentNote.description) return; 

    const newItemsContent = mapItemsContent(sectionTitle, (notes) => {
      return notes.map(note => {
        if (note.id === noteId) {
          return { ...note, description: newDescription.trim() }; 
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
    // 1. Pede o Título da Nova Anotação
    const noteTitle = window.prompt("Enter new note title:");
    if (!noteTitle || noteTitle.trim() === "") return;

    // 2. Pede o Conteúdo da Anotação
    const noteDescription = window.prompt("Enter new note content:");
    if (noteDescription === null) return; 

    // 3. CORRIGIDO: Automaticamente insere na PRIMEIRA seção encontrada
    const targetSection = annotationsContent[0];
    
    if (!targetSection) {
        alert("Cannot add note: No annotation section found in data structure. Please ensure at least one section exists.");
        return;
    }

    const newId = Date.now().toString(); 
    const newNote: AnnotationItem = { 
        id: newId, 
        title: noteTitle.trim(), 
        description: noteDescription.trim()
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

  return (
    <div className="page-container annotations-page">
      <h2>{title}</h2>
      
      <div className="annotations-grid">
        {annotationsContent.map((section) => (
          // Itera sobre as notas dentro de cada seção
          (section.descriptionList as AnnotationItem[]).map(note => (
            <AnnotationCard 
              key={note.id} 
              item={note} 
              sectionTitle={section.title}
              onEditTitle={handleEditTitle}
              onEditDescription={handleEditDescription}
              onDelete={handleDelete}
            />
          ))
        ))}
      </div>

      <button 
            className="menu-toggle" 
            onClick={handleAdd}
            style={{ width: '100%', padding: '10px 0', marginTop: '20px' }}
        >
            + ADD NOTE
        </button>
    </div>
  );
};