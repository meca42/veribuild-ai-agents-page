import { useState, useEffect, useCallback } from 'react';
import * as mockClient from '../api/mockClient';
import type * as API from '../api/types';

export const usePhases = (projectId: string | undefined) => {
  const [data, setData] = useState<API.Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPhases = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const phases = await mockClient.listPhases(projectId);
      setData(phases);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchPhases,
  };
};

export const useCreatePhase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPhase = useCallback(async (projectId: string, data: Partial<API.Phase>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const phase = await mockClient.createPhase(projectId, data);
      return phase;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createPhase, isLoading, isError, error };
};

export const useUpdatePhase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePhase = useCallback(async (id: string, data: Partial<API.Phase>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const phase = await mockClient.updatePhase(id, data);
      return phase;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updatePhase, isLoading, isError, error };
};

export const useReorderPhases = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reorderPhases = useCallback(async (projectId: string, phaseIds: string[]) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      await mockClient.reorderPhases(projectId, phaseIds);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reorderPhases, isLoading, isError, error };
};
