import { useState, useEffect, useCallback } from 'react';
import type { PlannerData } from '../types/planner'; 

const STORAGE_KEY = 'plannerHub_data';

// --- Utility Functions ---
/** Loads the default JSON file from the public folder. */
const loadDefaultConfig = async (): Promise<PlannerData> => {
  try {
    const response = await fetch('/PlannerHub.json');
    if (!response.ok) {
      throw new Error('Failed to load initial config file.');
    }
    const data = await response.json();
    
    // Initialize save status
    data.appConfig[0].saveStatus = 'Saved';
    data.appConfig[0].lastSaveTimestamp = new Date().toISOString();

    return data as PlannerData;
  } catch (error) {
    console.error('Error loading default config:', error);
    // Return a minimal safe structure in case of failure
    return { menuConfig: { menuTitle: "Error", menuIcon: "", menuItems: [] }, userConfig: [], appConfig: [{ darkModeEnabled: false, backupFileName: "PlannerHub", saveStatus: 'Not Saved' }] };
  }
};

/** Save the current state to LocalStorage immediately to ensure persistence
 *  after any change (updatePlannerData). Keep the current status ("Unsaved" or "Saved").
 */
const saveToLocalStorageLive = (data: PlannerData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};


/** Saves to LocalStorage and updates the status to "Saved."
 *  Used only for explicit saves (SAVE or Export button).
 */
const saveToLocalStorageExplicit = (data: PlannerData): PlannerData => {
  const dataToSave = { ...data };
  // Update status before saving
  dataToSave.appConfig[0].saveStatus = 'Saved';
  dataToSave.appConfig[0].lastSaveTimestamp = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  return dataToSave;
};

// --- Main Hook ---
export const usePlannerData = () => {
  const [data, setData] = useState<PlannerData | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load from LocalStorage or Default JSON
  useEffect(() => {
    const loadData = async () => {
      let plannerData: PlannerData;
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        // Load from LocalStorage (User's last saved state)
        plannerData = JSON.parse(savedData) as PlannerData;
        console.log('Data loaded from LocalStorage.');
      } else {
        // Load from default JSON (First time use or after reset)
        plannerData = await loadDefaultConfig();
        // Save the default config to LocalStorage for future sessions
        saveToLocalStorageExplicit(plannerData); // Use explicit save to mark initial load as 'Saved'
        console.log('Data loaded from default JSON and saved to LocalStorage.');
      }
      setData(plannerData);
      setLoading(false);
    };

    loadData();
  }, []);

  // 2. Function to update data and mark as "Not Saved"
  const updatePlannerData = useCallback((newData: Partial<PlannerData>) => {
    setData(prevData => {
      if (!prevData) return null;

      const updatedData = { ...prevData, ...newData };
      
      // Update the save status to 'Not Saved'
      updatedData.appConfig[0].saveStatus = 'Not Saved';
      
      // Saves data to LocalStorage immediately.
      saveToLocalStorageLive(updatedData); 
      
      return updatedData;
    });
  }, []);

  // 3. Function to explicitly save to LocalStorage (e.g., on Save button click)
  const saveLocalState = useCallback(() => {
    if (data) {
      // Uses saveToLocalStorageExplicit to update status and timestamp
      const savedData = saveToLocalStorageExplicit(data);
      setData(savedData); // Update state with the 'Saved' status and timestamp
      console.log('Application state saved to LocalStorage.');
      return true;
    }
    return false;
  }, [data]);


  // 4. Function to Reset Data to Default
  const resetData = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all data? This will clear your local changes.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload(); // Reload to trigger the default JSON loading
    }
  }, []);
  
  // 5. Function to Export Data (Save Data and Export)
  const exportData = useCallback(() => {
    if (!data) return;

    // 5.1. Ensure the latest changes are saved to LocalStorage first
    // Use saveToLocalStorageExplicit to update status/timestamp AND save to localStorage
    const finalData = saveToLocalStorageExplicit(data); 
    setData(finalData); // Update state to reflect 'Saved' status before export

    // 5.2. Format filename with timestamp
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timePart = now.toLocaleTimeString('pt-BR', { hour12: false }).replace(/:/g, ''); // HHMMSS
    const filenameBase = finalData.appConfig[0].backupFileName || 'PlannerHub';
    const filename = `${filenameBase}_BKP_${datePart}_${timePart}.json`;

    // 5.3. Create and download the JSON file
    const jsonString = JSON.stringify(finalData, null, 2); // 'null, 2' for pretty print
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Data successfully exported as ${filename}`);
  }, [data]);


  return {
    data,
    loading,
    updatePlannerData,
    saveLocalState,
    resetData,
    exportData,
    // Helper to check if the user is authenticated (using a simple check for now)
    isAuthenticated: !!data?.userConfig.find(u => u.active), 
  };
};