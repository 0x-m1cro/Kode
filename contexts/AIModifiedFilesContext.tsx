'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface AIModifiedFilesContextType {
  modifiedFiles: Set<string>;
  markFileAsModified: (path: string) => void;
  clearModifiedFile: (path: string) => void;
  clearAllModifiedFiles: () => void;
  isFileModified: (path: string) => boolean;
}

const AIModifiedFilesContext = createContext<AIModifiedFilesContextType | undefined>(undefined);

export function AIModifiedFilesProvider({ children }: { children: React.ReactNode }) {
  const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set());

  const markFileAsModified = useCallback((path: string) => {
    setModifiedFiles((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  }, []);

  const clearModifiedFile = useCallback((path: string) => {
    setModifiedFiles((prev) => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }, []);

  const clearAllModifiedFiles = useCallback(() => {
    setModifiedFiles(new Set());
  }, []);

  const isFileModified = useCallback((path: string) => {
    return modifiedFiles.has(path);
  }, [modifiedFiles]);

  return (
    <AIModifiedFilesContext.Provider
      value={{
        modifiedFiles,
        markFileAsModified,
        clearModifiedFile,
        clearAllModifiedFiles,
        isFileModified,
      }}
    >
      {children}
    </AIModifiedFilesContext.Provider>
  );
}

export function useAIModifiedFiles() {
  const context = useContext(AIModifiedFilesContext);
  if (context === undefined) {
    throw new Error('useAIModifiedFiles must be used within an AIModifiedFilesProvider');
  }
  return context;
}
