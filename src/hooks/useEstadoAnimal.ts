import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estadoAnimalApi } from '../api/estado-animal';
import type { EstadoAnimalRequest, EstadoAnimalFilters } from '../types/api';

export function useEstadoAnimal(filters: EstadoAnimalFilters = {}) {
  return useQuery({
    queryKey: ['estado-animal', filters],
    queryFn: () => estadoAnimalApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useEstadoAnimalById(id: number) {
  return useQuery({
    queryKey: ['estado-animal', id],
    queryFn: () => estadoAnimalApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEstadoAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EstadoAnimalRequest) => estadoAnimalApi.create(data),
    onSuccess: () => {
      // Invalidar las consultas de animales para actualizar el estado mostrado
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estado-animal'] });
    },
  });
}

export function useUpdateEstadoAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstadoAnimalRequest }) => 
      estadoAnimalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estado-animal'] });
    },
  });
}

export function useDeleteEstadoAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => estadoAnimalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estado-animal'] });
    },
  });
}

export function useDarDeBajaAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { idEstadoAnimal: number; fechaFallecimiento: string }) => 
      estadoAnimalApi.darDeBaja(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estado-animal'] });
    },
  });
}
