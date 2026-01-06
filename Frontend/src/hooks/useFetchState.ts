import { useState, useCallback } from 'react';

/**
 * Generic hook for managing async fetch operations with loading and error states
 * Eliminates duplicate loading/error state management across components
 */
export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseFetchStateReturn<T> extends FetchState<T> {
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  execute: <R>(asyncFn: () => Promise<R>, onSuccess?: (result: R) => void) => Promise<R | null>;
}

export function useFetchState<T>(initialData: T | null = null): UseFetchStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(true);
    setError(null);
  }, [initialData]);

  const execute = useCallback(async <R>(
    asyncFn: () => Promise<R>,
    onSuccess?: (result: R) => void
  ): Promise<R | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    setData,
    setLoading,
    setError,
    reset,
    execute
  };
}

export default useFetchState;
