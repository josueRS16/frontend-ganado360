import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estadosApi } from '../api/estados';
import type { EstadoRequest, EstadosFilters } from '../types/api';

export function useEstados(filters: EstadosFilters = {}) {
  return useQuery({
    queryKey: ['estados', filters],
    queryFn: () => estadosApi.getAll(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useEstado(id: number) {
  return useQuery({
    queryKey: ['estado', id],
    queryFn: () => estadosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEstado() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EstadoRequest) => estadosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
    },
  });
}

export function useUpdateEstado() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstadoRequest }) => 
      estadosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
      queryClient.invalidateQueries({ queryKey: ['estado'] });
    },
  });
}

export function useDeleteEstado() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => estadosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
    },
  });
}
