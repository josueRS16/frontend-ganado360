import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animalesApi } from '../api/animales';
import type { AnimalesFilters, CreateAnimalRequest, UpdateAnimalRequest } from '../types/api';

export function useAnimales(filters: AnimalesFilters = {}) {
  return useQuery({
    queryKey: ['animales', filters],
    queryFn: () => animalesApi.getAll(filters),
    staleTime: 0, // Los datos se consideran obsoletos inmediatamente
    refetchInterval: 300000, // Revalidar cada 30 segundos
    refetchOnWindowFocus: true, // Revalidar cuando la ventana recupera el foco
    refetchOnReconnect: true, // Revalidar cuando se recupera la conexión
  });
}

export function useAnimal(id: number) {
  return useQuery({
    queryKey: ['animal', id],
    queryFn: () => animalesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnimalRequest) => animalesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAnimalRequest }) => 
      animalesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['animal'] });
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => animalesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
    },
  });
}

export function useAnimalesConDetalle() {
  return useQuery({
    queryKey: ['animales-con-detalle'],
    queryFn: () => animalesApi.getAllWithDetail(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnimalEstado(id: number) {
  return useQuery({
    queryKey: ['animal-estado', id],
    queryFn: () => animalesApi.getEstado(id),
    enabled: !!id,
  });
}

export function useAnimalHistorial(id: number) {
  return useQuery({
    queryKey: ['animal-historial', id],
    queryFn: () => animalesApi.getHistorial(id),
    enabled: !!id,
  });
}

export function useAnimalRecordatorios(id: number) {
  return useQuery({
    queryKey: ['animal-recordatorios', id],
    queryFn: () => animalesApi.getRecordatorios(id),
    enabled: !!id,
  });
}
