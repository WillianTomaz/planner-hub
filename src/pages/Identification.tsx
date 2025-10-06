// src/pages/Identification.tsx
import React, { useState, useEffect, useRef } from 'react'; // Adicionando useRef
import { useNavigate } from 'react-router-dom';
import { usePlannerData } from '../hooks/usePlannerData';
import { PlannerData } from '../types/planner'; // Assumindo que o erro de importação foi resolvido

export const Identification: React.FC = () => {
  const { data, isAuthenticated, updatePlannerData } = usePlannerData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); // Referência para o input de arquivo

  const [username, setUsername] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
    // Set current time for display
    const now = new Date();
    setTimestamp(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('en-US'));
  }, [isAuthenticated, navigate]);

  const handleEnter = () => {
    const user = data?.userConfig.find(u => u.username === username);

    if (user) {
      // Logic to activate the user
      const updatedUserConfig = data!.userConfig.map(u => ({
        ...u,
        active: u.username === username 
      }));

      updatePlannerData({ userConfig: updatedUserConfig });
      
      alert(`Welcome back, ${user.name}!`);
      navigate('/dashboard');

    } else {
      alert('Username not found. Please try "admin-full" or "user-01" as per the initial JSON.');
    }
  };

  // Nova função para acionar o clique no input file
  const triggerImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  // Implementação da funcionalidade de importação
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonText = e.target?.result as string;
        // 1. Analisa o JSON
        const importedData = JSON.parse(jsonText) as PlannerData;
        
        // 2. Garante que a estrutura básica está correta (checa se existe menuConfig)
        if (!importedData.menuConfig) {
            throw new Error("Invalid file structure. Missing 'menuConfig'.");
        }

        // 3. Salva a nova estrutura no LocalStorage (usando updatePlannerData)
        // Isso irá sobrescrever o estado atual e marcar como 'Not Saved' temporariamente
        // A função saveLocalState deve ser chamada para persistir no LS, mas o update já o prepara.
        // Como estamos importando, queremos salvar imediatamente a nova versão.
        localStorage.setItem('plannerHub_data', JSON.stringify(importedData));
        
        alert('Data successfully imported and saved locally! Please re-enter your username to proceed.');
        
        // Recarrega a página para iniciar o ciclo de usePlannerData com os novos dados
        window.location.reload(); 

      } catch (error) {
        console.error("Error importing data:", error);
        alert(`Failed to import file: ${error instanceof Error ? error.message : "The file is not a valid JSON structure."}`);
      }
    };

    reader.readAsText(file);
    // Limpa o valor do input para permitir o upload do mesmo arquivo novamente
    event.target.value = '';
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data? This will clear your local changes.")) {
        localStorage.removeItem('plannerHub_data');
        window.location.reload();
    }
  };

  return (
    <div className="identification-container">
      <div className="identification-card card">
        <div className={`save-status status-saved`}>Saved</div>
        <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>{timestamp}</p>
        
        <h2 style={{ marginTop: '30px' }}>IDENTIFICATION</h2>
        
        <div className="form-group">
          <label htmlFor="username">USERNAME</label>
          <input 
            type="text" 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
          />
        </div>
        
        <button onClick={handleEnter} className="menu-toggle" style={{ width: '100%', marginBottom: '16px' }}>
          ENTER
        </button>
        
        <div className="action-row">
          {/* Oculta o input real e aciona-o via clique no botão */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".json" 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
          />
          <button onClick={triggerImportClick}>
            IMPORT DATA
          </button>
          <button onClick={handleResetData}>
            RESET DATA
          </button>
        </div>
      </div>
    </div>
  );
};