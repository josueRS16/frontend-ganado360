import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles';
import type { RolRequest, RolesFilters } from '../types/api';

export function useRoles(filters: RolesFilters = {}) {
  return useQuery({
    queryKey: ['roles', filters],
    queryFn: () => rolesApi.getAll(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useRol(id: number) {
  return useQuery({
    queryKey: ['rol', id],
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRol() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RolRequest) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRol() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RolRequest }) => 
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rol'] });
    },
  });
}

export function useDeleteRol() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
