/*
  The React Fast Refresh ESLint rule (react-refresh/only-export-components)
  warns when a file exports both components and non-component values (like
  hooks or constants). In this file we intentionally export a Provider
  component and the consumer hook together for convenience. The warning is
  harmless for production but noisy during development, so we disable the
  rule for this file. If you prefer to keep the rule enabled, move the
  `usePlannerData` hook to a separate file (for example
  `src/hooks/usePlannerDataHook.ts`) and re-export from an index.
*/
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PlannerData } from '../types/planner';

const STORAGE_KEY = 'plannerHub_data';

const loadDefaultConfig = async (): Promise<PlannerData> => {
  try {
    const response = await fetch('/PlannerHub.json');
    if (!response.ok) throw new Error('Failed to load initial config file.');
    const data = await response.json();

    if (!data.appConfig) data.appConfig = [{ darkModeEnabled: false, backupFileName: 'PlannerHub' }];
    if (!data.appConfig[0].saveStatus) data.appConfig[0].saveStatus = 'Saved';
    if (!data.appConfig[0].lastSaveTimestamp) data.appConfig[0].lastSaveTimestamp = new Date().toISOString();
    if (typeof data.appConfig[0].isPomodoroEnabled === 'undefined') data.appConfig[0].isPomodoroEnabled = false;

    return data as PlannerData;
  } catch (error) {
    console.error('Error loading default config:', error);
    return {
      menuConfig: { menuTitle: 'Planner HUB', menuIcon: '', menuItems: [] },
      userConfig: [],
      appConfig: [{ darkModeEnabled: false, backupFileName: 'PlannerHub', saveStatus: 'Not Saved', isPomodoroEnabled: false }]
    };
  }
};

const saveToLocalStorageLive = (data: PlannerData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write to LocalStorage', e);
  }
};

const saveToLocalStorageExplicit = (data: PlannerData): PlannerData => {
  const dataToSave = JSON.parse(JSON.stringify(data)) as PlannerData;
  if (!dataToSave.appConfig) dataToSave.appConfig = [{ darkModeEnabled: false, backupFileName: 'PlannerHub' }];
  dataToSave.appConfig[0].saveStatus = 'Saved';
  dataToSave.appConfig[0].lastSaveTimestamp = new Date().toISOString();
  saveToLocalStorageLive(dataToSave);
  return dataToSave;
};

type PlannerContextValue = {
  data: PlannerData | null;
  loading: boolean;
  updatePlannerData: (newData: Partial<PlannerData>) => void;
  saveLocalState: () => boolean;
  resetData: () => void;
  exportData: () => void;
  loginUser: (username: string) => boolean;
  registerNewUser: (nameOrObj: { name: string; username: string; permission?: 'full' | 'read'; } | string, maybeUsername?: string, maybePermission?: string) => boolean;
  isAuthenticated: boolean;
};

const PlannerDataContext = createContext<PlannerContextValue | undefined>(undefined);

export const PlannerDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PlannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      let plannerData: PlannerData;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          plannerData = JSON.parse(saved) as PlannerData;
          if (!plannerData.appConfig || !Array.isArray(plannerData.appConfig) || plannerData.appConfig.length === 0) {
            plannerData.appConfig = [{ darkModeEnabled: false, backupFileName: 'PlannerHub', isPomodoroEnabled: false }];
          }
          if (typeof plannerData.appConfig[0].isPomodoroEnabled === 'undefined') plannerData.appConfig[0].isPomodoroEnabled = false;
          console.log('Data loaded from LocalStorage.');
        } catch (e) {
          console.warn('Invalid LocalStorage data, loading default.', e);
          plannerData = await loadDefaultConfig();
          saveToLocalStorageExplicit(plannerData);
        }
      } else {
        plannerData = await loadDefaultConfig();
        saveToLocalStorageExplicit(plannerData);
        console.log('Data loaded from default JSON and saved to LocalStorage.');
      }
      if (mounted) {
        setData(plannerData);
        setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const updatePlannerData = useCallback((newData: Partial<PlannerData>) => {
    setData(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...newData };
      if (newData.menuConfig) updated.menuConfig = { ...prev.menuConfig, ...newData.menuConfig };
      if (newData.appConfig) updated.appConfig = newData.appConfig;
      if (!updated.appConfig || updated.appConfig.length === 0) updated.appConfig = [{ darkModeEnabled: false, backupFileName: 'PlannerHub', isPomodoroEnabled: false }];
      updated.appConfig[0].saveStatus = 'Not Saved';
      saveToLocalStorageLive(updated);
      return updated;
    });
  }, []);

  // Authenticate a user by username. Marks the found user as active and
  // persists the change. Returns true if user found and activated.
  const loginUser = useCallback((username: string): boolean => {
    // Normalize username for consistent matching
    const normalized = username?.trim().toLowerCase().replace(/\s+/g, '');
    if (!normalized) return false;
    let found = false;
    setData(prev => {
      if (!prev) return prev;
      const users = prev.userConfig || [];
      const updatedUsers = users.map(u => {
        if (u.username && u.username.toLowerCase() === normalized) {
          found = true;
          return { ...u, active: true };
        }
        return { ...u, active: false };
      });
      if (!found) return prev;
      const updated = { ...prev, userConfig: updatedUsers } as PlannerData;
      saveToLocalStorageLive(updated);
      return updated;
    });
    return found;
  }, []);

  // Register a new user. Accepts either an object {name, username, permission}
  // or arguments (name, username, permission). Activates the new user and
  // deactivates others. Returns true when user was created and activated.
  const registerNewUser = useCallback((nameOrObj: { name: string; username: string; permission?: 'full' | 'read'; } | string, maybeUsername?: string, maybePermission?: string): boolean => {
    let name: string | undefined;
    let username: string | undefined;
    let permission: 'full' | 'read' = 'read';

    if (typeof nameOrObj === 'object') {
      name = nameOrObj.name;
      username = nameOrObj.username;
      permission = nameOrObj.permission === 'full' ? 'full' : 'read';
    } else {
      name = nameOrObj as string;
      username = maybeUsername;
      permission = maybePermission === 'full' ? 'full' : 'read';
    }

    if (!username || !name) return false;

    // Normalize username: trim, lowercase, remove internal spaces
    username = username.trim().toLowerCase().replace(/\s+/g, '');

    // Validate username: allow letters, numbers, dot, underscore, hyphen; min 3 chars
    const usernameRegex = /^[a-z0-9._-]{3,}$/;
    if (!usernameRegex.test(username)) {
      return false;
    }

    let created = false;
    setData(prev => {
      if (!prev) return prev;
      const users = prev.userConfig || [];
      // prevent duplicate usernames
      if (users.find(u => u.username === username)) return prev;

      const newUser = {
        id: Date.now().toString(),
        name,
        username,
        permission,
        active: true,
      };

      const updatedUsers = users.map(u => ({ ...u, active: false })).concat(newUser);
      const updated = { ...prev, userConfig: updatedUsers } as PlannerData;
      saveToLocalStorageLive(updated);
      created = true;
      return updated;
    });

    return created;
  }, []);

  const saveLocalState = useCallback(() => {
    if (!data) return false;
    const saved = saveToLocalStorageExplicit(data);
    setData(saved);
    return true;
  }, [data]);

  const resetData = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data? This will clear your local changes.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }, []);

  const exportData = useCallback(() => {
    if (!data) return;
    const finalData = saveToLocalStorageExplicit(data);
    setData(finalData);

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timePart = now.toLocaleTimeString('pt-BR', { hour12: false }).replace(/:/g, '');
    const filenameBase = finalData.appConfig[0].backupFileName || 'PlannerHub';
    const filename = `${filenameBase}_BKP_${datePart}_${timePart}.json`;

    const jsonString = JSON.stringify(finalData, null, 2);
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

  const value: PlannerContextValue = {
    data,
    loading,
    updatePlannerData,
    saveLocalState,
    resetData,
    exportData,
    loginUser,
    registerNewUser,
    isAuthenticated: !!data?.userConfig?.find(u => u.active)
  };

  return <PlannerDataContext.Provider value={value}>{children}</PlannerDataContext.Provider>;
};

export const usePlannerData = (): PlannerContextValue => {
  const ctx = useContext(PlannerDataContext);
  if (!ctx) throw new Error('usePlannerData must be used within PlannerDataProvider');
  return ctx;
};