import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth';
import * as mockClient from '../api/mockClient';
import type * as API from '../api/types';
import type { FilterParams, PaginatedResponse } from '../mocks/filters';

export const useProjects = (params: FilterParams = {}) => {
  const { currentOrgId } = useAuth();
  const [data, setData] = useState<API.Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params.page || 1);
  const [pageSize, setPageSize] = useState(params.pageSize || 10);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!currentOrgId) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await mockClient.listProjects(currentOrgId, { ...params, page, pageSize });
      setData(response.data);
      setTotal(response.total);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrgId, params.q, params.status, params.sortBy, params.sortDir, page, pageSize]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    data,
    total,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    refetch: fetchProjects,
  };
};

export const useProject = (id: string | undefined) => {
  const [data, setData] = useState<API.Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchProject = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const project = await mockClient.getProject(id);
        setData(project);
      } catch (err) {
        setIsError(true);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { data, isLoading, isError, error };
};

export const useCreateProject = () => {
  const { currentOrgId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = useCallback(
    async (data: Partial<API.Project>) => {
      if (!currentOrgId) throw new Error('No organization selected');

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const project = await mockClient.createProject(currentOrgId, data);
        return project;
      } catch (err) {
        setIsError(true);
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentOrgId]
  );

  return { createProject, isLoading, isError, error };
};

export const useUpdateProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProject = useCallback(async (id: string, data: Partial<API.Project>) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const project = await mockClient.updateProject(id, data);
      return project;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateProject, isLoading, isError, error };
};

export const useArchiveProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const archiveProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      await mockClient.archiveProject(id);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { archiveProject, isLoading, isError, error };
};
