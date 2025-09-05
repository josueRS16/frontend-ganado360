import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordatoriosApi } from '../api/recordatorios';
import type { RecordatoriosFilters, RecordatorioRequest } from '../types/api';

export function useRecordatorios(filters: RecordatoriosFilters = {}) {
  return useQuery({
    queryKey: ['recordatorios', filters],
    queryFn: () => recordatoriosApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useRecordatorio(id: number) {
  return useQuery({
    queryKey: ['recordatorio', id],
    queryFn: () => recordatoriosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRecordatorio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RecordatorioRequest) => recordatoriosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
    },
  });
}

export function useUpdateRecordatorio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordatorioRequest }) => 
      recordatoriosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      queryClient.invalidateQueries({ queryKey: ['recordatorio'] });
    },
  });
}

export function useDeleteRecordatorio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => recordatoriosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
    },
  });
}
