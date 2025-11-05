import React, { createContext, useContext, useState, useEffect } from 'react';

const ReadingPreferencesContext = createContext();

export const useReadingPreferences = () => {
  const context = useContext(ReadingPreferencesContext);
  if (!context) {
    throw new Error('useReadingPreferences must be used within ReadingPreferencesProvider');
  }
  return context;
};

export const ReadingPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('readingPreferences');
      return saved ? JSON.parse(saved) : {
        fontSize: 16,
        readingMode: 'vertical',
        brightness: 100,
        autoScroll: false,
        autoScrollSpeed: 50
      };
    } catch (e) {
      return {
        fontSize: 16,
        readingMode: 'vertical',
        brightness: 100,
        autoScroll: false,
        autoScrollSpeed: 50
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('readingPreferences', JSON.stringify(preferences));
    document.documentElement.style.setProperty('--reader-font-size', `${preferences.fontSize}px`);
    document.documentElement.style.setProperty('--reader-brightness', `${preferences.brightness}%`);
    document.documentElement.style.setProperty('--reader-mode', preferences.readingMode);
  }, [preferences]);

  const updatePreferences = (updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return (
    <ReadingPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </ReadingPreferencesContext.Provider>
  );
};
