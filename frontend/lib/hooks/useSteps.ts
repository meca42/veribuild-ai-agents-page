import { useState, useEffect, useCallback } from 'react';
import * as mockClient from '../api/mockClient';
import type * as API from '../api/types';
import type { FilterParams } from '../mocks/filters';

export const useSteps = (projectId: string | undefined, params: FilterParams = {}) => {
  const [data, setData] = useState<API.Step[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params.page || 1);
  const [pageSize, setPageSize] = useState(params.pageSize || 10);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSteps = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await mockClient.listSteps(projectId, { ...params, page, pageSize });
      setData(response.data);
      setTotal(response.total);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, params.phaseId, params.q, params.status, params.sortBy, params.sortDir, page, pageSize]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  return {
    data,
    total,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    refetch: fetchSteps,
  };
};

export const useStep = (id: string | undefined) => {
  const [data, setData] = useState<API.Step | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchStep = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const step = await mockClient.getStep(id);
        setData(step);
      } catch (err) {
        setIsError(true);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStep();
  }, [id]);

  return { data, isLoading, isError, error };
};

export const useCreateStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createStep = useCallback(async (projectId: string, phaseId: string, data: Partial<API.Step>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const step = await mockClient.createStep(projectId, phaseId, data);
      return step;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createStep, isLoading, isError, error };
};

export const useUpdateStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStep = useCallback(async (id: string, data: Partial<API.Step>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const step = await mockClient.updateStep(id, data);
      return step;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateStep, isLoading, isError, error };
};

export const useToggleCheckItem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleCheckItem = useCallback(async (stepId: string, checkItemId: string) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const step = await mockClient.toggleCheckItem(stepId, checkItemId);
      return step;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { toggleCheckItem, isLoading, isError, error };
};
