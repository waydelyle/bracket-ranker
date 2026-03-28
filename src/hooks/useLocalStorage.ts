'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * A generic hook for persisting values to localStorage.
 * Reads from localStorage on mount, writes on every update.
 * Falls back to initialValue if localStorage is unavailable or the stored value is invalid.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage (or fallback to initialValue).
  // We use a lazy initializer so we only read localStorage once on mount.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync to localStorage whenever storedValue changes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Storage full or unavailable — silently ignore.
    }
  }, [key, storedValue]);

  // Setter that mirrors the useState API (accepts value or updater function).
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        return nextValue;
      });
    },
    []
  );

  return [storedValue, setValue];
}
