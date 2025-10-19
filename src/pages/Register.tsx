// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlannerData } from '../hooks/usePlannerData';
import { ConfirmModal } from '../components/ConfirmModal';

export const Register: React.FC = () => {
  const { data, registerNewUser } = usePlannerData();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (rawName: string, rawUsername: string): { ok: boolean; reason?: string; normalized?: string } => {
    if (!rawName || !rawName.trim()) return { ok: false, reason: '"Full Name" is required!' };
    const normalizedRawName = rawName.trim().toLowerCase().replace(/\s+/g, '');
    if (normalizedRawName.length < 3) return { ok: false, reason: '"Full Name" must be at least 3 characters long!' };

    if (!rawUsername || !rawUsername.trim()) return { ok: false, reason: '"Username" is required!' };
    const hasSpace = /\s/.test(username);
    if (hasSpace) return { ok: false, reason: '"Username" cannot contain spaces!' };
    const normalized = rawUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (normalized.length < 3) return { ok: false, reason: '"Username" must be at least 3 characters long!' };
    const usernameRegex = /^[a-z0-9._-]{3,}$/;
    if (!usernameRegex.test(normalized)) return { ok: false, reason: 'Invalid username! Use letters, numbers, dot, underscore or hyphen. No spaces.' };
    return { ok: true, normalized};
  };

  const handleRegister = () => {
    const v = validateForm(name, username);
    if (!v.ok) {
      setErrorMessage(v.reason || 'Invalid input.');
      setErrorModalOpen(true);
      return;
    }

    const created = registerNewUser(name.trim(), v.normalized, 'read');
    if (!created) {
      setErrorMessage('Registration failed. Username may already be taken.');
      setErrorModalOpen(true);
      return;
    }

    setSuccessMessage(`Registration successful! User '${v.normalized}' created.`);
    setSuccessModalOpen(true);
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
          <p style={{ marginTop: '10px', fontSize: '1.2rem', color: 'var(--color-text-tertiary)' }}>
            NEW USER REGISTRATION
          </p>
        </div>

        <div className="form-group" style={{ textAlign: "initial", marginTop: "20px" }}>
          <label style={{ fontWeight: 500, margin: '30px 0 10px 0'}}>FULL NAME:</label>
          <input maxLength={30} style={{ margin: '0 0 30px 0' }} type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>

        <div className="form-group" style={{ textAlign: "initial" }}>
          <label style={{ fontWeight: 500, margin: '0 0 10px 0'}}>USERNAME:</label>
          <input maxLength={15} style={{ margin: '0 0 30px 0' }} type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
        </div>
        
        <button onClick={handleRegister} className="modern-menu-toggle" style={{ width: '100%', marginBottom: '16px' }}>
          REGISTER
        </button>
        
        {/* Botão de retorno, usando o estilo de botão de dados existente */}
        <button 
            onClick={() => navigate('/identification', { replace: true })} 
            className="btn-data" 
            style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
            BACK TO LOGIN
        </button>
      </div>

      <ConfirmModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onConfirm={() => setErrorModalOpen(false)}
        title="Validation Error"
        message={errorMessage}
        confirmText="OK"
        type="danger"
      />

      <ConfirmModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onConfirm={() => {
          setSuccessModalOpen(false);
          navigate('/identification', { replace: true });
        }}
        title="Success"
        message={successMessage}
        confirmText="OK"
        type="info"
      />
    </div>
  );
};