import React, { createContext, useContext, useState } from 'react';

interface FileContextType {
  activeFilename: string | null;
  activeFolder: string | null;
  setActiveFile: (filename: string, folder: string) => void;
  clearActiveFile: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFilename, setActiveFilename] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const setActiveFile = (filename: string, folder: string) => {
    setActiveFilename(filename);
    setActiveFolder(folder);
  };

  const clearActiveFile = () => {
    setActiveFilename(null);
    setActiveFolder(null);
  };

  return (
    <FileContext.Provider value={{ activeFilename, activeFolder, setActiveFile, clearActiveFile }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within FileProvider');
  }
  return context;
};
