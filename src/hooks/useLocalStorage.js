import { useEffect, useState } from 'react';

// Persists state to localStorage under `key`, initializing from any
// previously stored value (falling back to `initialValue`).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return initialValue;
      return JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (e.g. private browsing) - ignore
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
