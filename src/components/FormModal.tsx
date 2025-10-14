import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FormField[];
  submitButtonText?: string;
  initialData?: Record<string, any>;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'datetime-local' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  submitButtonText = 'SAVE',
  initialData = {}
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);
  const firstTextareaRef = useRef<HTMLTextAreaElement>(null);
  const firstSelectRef = useRef<HTMLSelectElement>(null);

  // Reset form when modal opens/closes and focus first input
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
      
      // Focus first input after modal animation completes
      setTimeout(() => {
        const firstField = fields[0];
        if (firstField) {
          switch (firstField.type) {
            case 'textarea':
              if (firstTextareaRef.current) firstTextareaRef.current.focus();
              break;
            case 'select':
              if (firstSelectRef.current) firstSelectRef.current.focus();
              break;
            default:
              if (firstInputRef.current) firstInputRef.current.focus();
              break;
          }
        }
      }, 100);
    }
  }, [isOpen, fields]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const renderField = (field: FormField, isFirstField: boolean = false) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.name, e.target.value),
      placeholder: field.placeholder,
      className: `modal-input ${errors[field.name] ? 'error' : ''}`,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            style={{ resize: 'vertical' }}
            ref={isFirstField ? firstTextareaRef : undefined}
          />
        );
      
      case 'datetime-local':
        return (
          <input
            {...commonProps}
            type="datetime-local"
            ref={isFirstField ? firstInputRef : undefined}
          />
        );
      
      case 'select':
        return (
          <select 
            {...commonProps}
            ref={isFirstField ? firstSelectRef : undefined}
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type="text"
            ref={isFirstField ? firstInputRef : undefined}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <form onSubmit={handleSubmit} className="modal-form">
        {fields.map((field, index) => (
          <div key={field.name} className="modal-field">
            <label htmlFor={field.name} className="modal-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {renderField(field, index === 0)}
            {errors[field.name] && (
              <span className="modal-error">{errors[field.name]}</span>
            )}
          </div>
        ))}
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={onClose}
            className="modal-btn modal-btn-secondary"
          >
            CANCEL
          </button>
          <button 
            type="submit"
            className="modal-btn modal-btn-primary"
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </Modal>
  );
};
