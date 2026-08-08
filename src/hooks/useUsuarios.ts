import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios';
import type { UsuarioRequest, UsuariosFilters } from '../types/api';

export function useUsuarios(filters: UsuariosFilters = {}) {
  return useQuery({
    queryKey: ['usuarios', filters],
    queryFn: () => usuariosApi.getAll(filters),
    staleTime: 0, // Los datos se consideran obsoletos inmediatamente
    refetchInterval: 30000, // Revalidar cada 30 segundos
    refetchOnWindowFocus: true, // Revalidar cuando la ventana recupera el foco
    refetchOnReconnect: true, // Revalidar cuando se recupera la conexión
  });
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => usuariosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UsuarioRequest) => usuariosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioRequest }) => 
      usuariosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario'] });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => usuariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
