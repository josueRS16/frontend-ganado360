import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventasApi } from '../api/ventas';
import type { VentasFilters, VentaRequest, PaginatedResponse, Venta } from '../types/api';

export function useVentas(filters: VentasFilters = {}) {
  return useQuery<PaginatedResponse<Venta[]>>({
    queryKey: ['ventas', filters],
    queryFn: () => ventasApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useVenta(id: number) {
  return useQuery({
    queryKey: ['venta', id],
    queryFn: () => ventasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateVenta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VentaRequest) => ventasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
}

export function useUpdateVenta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VentaRequest }) => 
      ventasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['venta'] });
    },
  });
}

export function useDeleteVenta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ventasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
}

export function useTiposVenta() {
  return useQuery({
    queryKey: ['tipos-venta'],
    queryFn: () => ventasApi.getTiposVenta(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}