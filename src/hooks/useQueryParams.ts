import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { buildParams, parseParams } from '../utils/params';

/**
 * Hook para manejar query parameters de la URL de forma tipada
 */
export function useQueryParams<T extends Record<string, any>>() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Obtener parámetros actuales como objeto tipado
  const params = parseParams(searchParams) as Partial<T>;

  // Actualizar parámetros
  const updateParams = useCallback((newParams: Partial<T>) => {
    const updatedParams = buildParams({ ...params, ...newParams });
    setSearchParams(updatedParams);
  }, [params, setSearchParams]);

  // Limpiar parámetros
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Establecer parámetros (reemplaza todos)
  const setParams = useCallback((newParams: Partial<T>) => {
    const updatedParams = buildParams(newParams);
    setSearchParams(updatedParams);
  }, [setSearchParams]);

  return {
    params,
    updateParams,
    clearParams,
    setParams,
  };
}
