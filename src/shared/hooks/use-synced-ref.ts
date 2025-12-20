import { useEffect, useRef } from 'react';

/**
 * Хук для рефа с синхронизацией значения
 */
export const useSyncedRef = <T>(value: T) => {
  const ref = useRef(value);
  useEffect(() => void (ref.current = value), [value]);
  return ref;
};
