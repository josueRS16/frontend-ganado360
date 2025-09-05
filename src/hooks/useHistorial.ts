import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historialApi } from '../api/historial';
import type { HistorialVeterinarioRequest } from '../types/api';

export function useHistorial() {
  return useQuery({
    queryKey: ['historial'],
    queryFn: () => historialApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useHistorialItem(id: number) {
  return useQuery({
    queryKey: ['historial-item', id],
    queryFn: () => historialApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateHistorial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: HistorialVeterinarioRequest) => historialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historial'] });
    },
  });
}

export function useUpdateHistorial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HistorialVeterinarioRequest }) => 
      historialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historial'] });
      queryClient.invalidateQueries({ queryKey: ['historial-item'] });
    },
  });
}

export function useDeleteHistorial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => historialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historial'] });
    },
  });
}
