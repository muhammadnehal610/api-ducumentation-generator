
import { useEffect, useRef } from 'react';

export const useDebouncedEffect = (
  callback: () => void,
  deps: any[],
  delay: number
) => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      callback();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [...deps, delay]); // eslint-disable-line react-hooks/exhaustive-deps
};
