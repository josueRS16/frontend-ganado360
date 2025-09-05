import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias';
import type { CategoriaRequest, UpdateCategoriaRequest } from '../types/api';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos más estables
  });
}

export function useCategoria(id: number) {
  return useQuery({
    queryKey: ['categoria', id],
    queryFn: () => categoriasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CategoriaRequest) => categoriasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaRequest }) => 
      categoriasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categoria'] });
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}
