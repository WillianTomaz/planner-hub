import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { usePlannerData } from '../hooks/usePlannerData';
import type { PlannerData } from '../types/planner'; 
import { ConfirmModal } from '../components/ConfirmModal';

export const Identification: React.FC = () => {
  const { data, isAuthenticated, loginUser, resetData } = usePlannerData(); 
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const [username, setUsername] = useState('');

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [onSuccessConfirm, setOnSuccessConfirm] = useState<() => void>(() => () => {});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateUsername = (raw: string): { ok: boolean; reason?: string; normalized?: string } => {
    if (!raw || !raw.trim()) return { ok: false, reason: 'Username is required.' };
    const normalized = raw.trim().toLowerCase().replace(/\s+/g, '');
    if (normalized.length < 3) return { ok: false, reason: 'Username must be at least 3 characters long.' };
    const usernameRegex = /^[a-z0-9._-]{3,}$/;
    if (!usernameRegex.test(normalized)) return { ok: false, reason: 'Invalid username. Use letters, numbers, dot, underscore or hyphen. No spaces.' };
    return { ok: true, normalized };
  };

  const handleEnter = () => {
    const v = validateUsername(username);
    if (!v.ok) {
      setErrorMessage(v.reason || 'Invalid username.');
      setIsErrorModalOpen(true);
      return;
    }

    const success = loginUser(v.normalized!);
    if (success) {
      setSuccessMessage(`Welcome back, ${v.normalized}!`);
      // navigate only after user confirms the modal
      setOnSuccessConfirm(() => () => navigate('/dashboard', { replace: true }));
      setIsSuccessModalOpen(true);
    } else {
      setErrorMessage('Username not found. You can create a new account.');
      setIsErrorModalOpen(true);
    }
  };

  const triggerImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonText = e.target?.result as string;
        const importedData = JSON.parse(jsonText) as PlannerData;

        if (!importedData.menuConfig) {
          setErrorMessage("Invalid file structure. Missing 'menuConfig'.");
          setIsErrorModalOpen(true);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        // Persist to localStorage (keeps provider logic simple)
        localStorage.setItem('plannerHub_data', JSON.stringify(importedData));
        setSuccessMessage('Data successfully imported! Would you like to continue with existing data?');
        setOnSuccessConfirm(() => () => {
          if (fileInputRef.current) fileInputRef.current.value = '';
          window.location.reload();
        });
        setIsSuccessModalOpen(true);
      } catch (error) {
        setErrorMessage(`Error importing file: ${(error as Error).message}`);
        setIsErrorModalOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetData();
  };

  return (
    <div className="identification-container">
      <div className="card identification-card">
        <div className="identification-header">
          <div className="app-title-container">
            <h1 className="app-title" style={{ fontSize: '2rem' }}>
              {data?.menuConfig.menuTitle || "Planner HUB"}
            </h1>
          </div>
        </div>
        
        <div className="form-group" style={{ textAlign: "initial", marginTop: '20px' }}>
          <label style={{ fontWeight: 500, margin: '50px 0 10px 0'}}>
            USERNAME:
          </label>
          <input 
            style={{ margin: '0 0 30px 0' }}
            type="text" 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </div>

        <button onClick={handleEnter} className="modern-menu-toggle" style={{ width: '100%', marginBottom: '16px' }}>
          ENTER
        </button>

        <button 
          onClick={() => navigate('/register')} 
          className="btn-data" 
          style={{ 
            background: 'var(--color-surface-hover)', 
            color: 'var(--color-text)', 
            border: '1px solid var(--color-border)', 
            marginBottom: '16px', 
          }}
        >
          CREATE ACCOUNT
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".json" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />
        <div className="action-row">
          <button className="btn-data" onClick={triggerImportClick}>
            IMPORT DATA
          </button>
          <button className="btn-data" onClick={handleResetData}>
            RESET DATA
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onConfirm={() => setIsErrorModalOpen(false)}
        title="Validation Error"
        message={errorMessage}
        confirmText="OK"
        type="danger"
      />

      <ConfirmModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onConfirm={() => {
          setIsSuccessModalOpen(false);
          onSuccessConfirm();
        }}
        title="Success"
        message={successMessage}
        confirmText="OK"
        type="info"
        showIcon={false}
      />
    </div>
  );
};