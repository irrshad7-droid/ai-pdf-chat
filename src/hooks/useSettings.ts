import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gemini_api_key';

export function useGeminiKey() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
    }
    setIsLoaded(true);
  }, []);

  // Save key to localStorage
  const saveKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY, key);
  }, []);

  // Clear key from localStorage
  const clearKey = useCallback(() => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if key is configured
  const hasKey = apiKey.trim().length > 0;

  return {
    apiKey,
    saveKey,
    clearKey,
    hasKey,
    isLoaded
  };
}
