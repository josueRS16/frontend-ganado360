import { useState, useEffect, useMemo } from 'react';
import { useVentas, useCreateVenta, useUpdateVenta, useDeleteVenta } from '../hooks/useVentas';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useTiposVenta } from '../hooks/useVentas';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { Pagination } from '../components/ui/Pagination';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { VentasFilters, Venta, VentaRequest } from '../types/api';


interface VentaModalProps {
  venta?: Venta;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VentaRequest) => void;
}


function VentaModal({ venta, isOpen, onClose, onSave }: VentaModalProps) {
  const { data: animalesData } = useAnimales();
  const { data: usuariosData } = useUsuarios();
  const { data: tiposVentaData } = useTiposVenta();
  
  // Para nueva venta: solo animales vivos, para edición: incluir el animal actual
  const animales = useMemo(() => {
    const todosAnimales = animalesData?.data || [];
    
    if (venta) {
      // Para edición: incluir el animal actual sin importar su estado
      const animalActual = todosAnimales.find(a => a.ID_Animal === venta.ID_Animal);
      const animalesVivos = todosAnimales.filter(a => a.EstadoNombre?.toLowerCase() === 'viva');
      
      // Combinar el animal actual con los animales vivos, evitando duplicados
      const animalesCombinados = [...animalesVivos];
      if (animalActual && !animalesVivos.find(a => a.ID_Animal === animalActual.ID_Animal)) {
        animalesCombinados.unshift(animalActual);
      }
      
      return animalesCombinados;
    } else {
      // Para nueva venta: solo animales vivos
      return todosAnimales.filter(a => a.EstadoNombre?.toLowerCase() === 'viva');
    }
  }, [animalesData?.data, venta]);
  const usuarios = usuariosData?.data || [];
  const tiposVenta = tiposVentaData?.data || [];

  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<VentaRequest>({
    ID_Animal: venta?.ID_Animal || 0,
    Fecha_Venta: venta?.Fecha_Venta || today,
    Tipo_Venta: venta?.Tipo_Venta || '',
    Comprador: venta?.Comprador || '',
    Precio: venta?.Precio || 0,
    Registrado_Por: venta?.Registrado_Por || 1,
    Observaciones: venta?.Observaciones || '',
  });

  // Función para formatear fecha para input HTML
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } catch {
      return '';
    }
  };

  // Actualizar formData cuando cambie la venta (para edición)
  useEffect(() => {
    if (venta) {
      setFormData({
        ID_Animal: venta.ID_Animal,
        Fecha_Venta: formatDateForInput(venta.Fecha_Venta),
        Tipo_Venta: venta.Tipo_Venta,
        Comprador: venta.Comprador,
        Precio: venta.Precio,
        Registrado_Por: venta.Registrado_Por,
        Observaciones: venta.Observaciones,
      });
    } else {
      // Limpiar formulario para nueva venta
      setFormData({
        ID_Animal: 0,
        Fecha_Venta: today,
        Tipo_Venta: '',
        Comprador: '',
        Precio: 0,
        Registrado_Por: 1,
        Observaciones: '',
      });
    }
  }, [venta, today]);

  // Update ID_Animal when animals are loaded and no venta is being edited
  useEffect(() => {
    if (!venta && animales.length > 0 && formData.ID_Animal === 0) {
      setFormData(prev => ({
        ...prev,
        ID_Animal: animales[0].ID_Animal
      }));
    }
  }, [animales, venta, formData.ID_Animal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Comprador.trim() && formData.Precio > 0 && formData.ID_Animal > 0) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-cash-coin me-2"></i>
              {venta ? 'Editar Venta' : 'Nueva Venta'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <p className="text-muted small">
                {venta ? 'Para edición: se muestra el animal actual + animales vivos' : 'Solo animales vivos'}
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label fw-semibold">Animal</label>
                  <select
                    className="form-select"
                    id="animal"
                    value={formData.ID_Animal}
                    onChange={(e) => setFormData({ ...formData, ID_Animal: Number(e.target.value) })}
                    required
                  >
                    {animales.map(animal => (
                      <option key={animal.ID_Animal} value={animal.ID_Animal}>
                        {animal.Nombre} - {animal.CategoriaTipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="fecha" className="form-label fw-semibold">Fecha de Venta</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    value={formData.Fecha_Venta}
                    onChange={(e) => setFormData({ ...formData, Fecha_Venta: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="tipo" className="form-label fw-semibold">Tipo de Venta</label>
                  <select
                    className="form-select"
                    id="tipo"
                    value={formData.Tipo_Venta}
                    onChange={(e) => setFormData({ ...formData, Tipo_Venta: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tiposVenta.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="comprador" className="form-label fw-semibold">Comprador</label>
                  <input
                    type="text"
                    className="form-control"
                    id="comprador"
                    value={formData.Comprador}
                    onChange={(e) => setFormData({ ...formData, Comprador: e.target.value })}
                    placeholder="Nombre del comprador..."
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="precio" className="form-label fw-semibold">Precio</label>
                  <div className="input-group">
                    <span className="input-group-text">₡</span>
                    <input
                      type="number"
                      className="form-control"
                      id="precio"
                      value={formData.Precio}
                      onChange={(e) => setFormData({ ...formData, Precio: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="usuario" className="form-label fw-semibold">Registrado por</label>
                  <select
                    className="form-select"
                    id="usuario"
                    value={formData.Registrado_Por}
                    onChange={(e) => setFormData({ ...formData, Registrado_Por: Number(e.target.value) })}
                    required
                  >
                    {usuarios.map(usuario => (
                      <option key={usuario.ID_Usuario} value={usuario.ID_Usuario}>
                        {usuario.Nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="observaciones" className="form-label fw-semibold">Observaciones</label>
                  <textarea
                    className="form-control"
                    id="observaciones"
                    rows={3}
                    value={formData.Observaciones}
                    onChange={(e) => setFormData({ ...formData, Observaciones: e.target.value })}
                    placeholder="Observaciones adicionales sobre la venta..."
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-3" style={{ background: 'var(--color-base-green)' }}>
              <div className="d-flex justify-content-end gap-2 w-100">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-apply"
                  disabled={!formData.Comprador.trim() || formData.Precio <= 0 || formData.ID_Animal <= 0}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  {venta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Ventas() {
  const { params, updateParams, clearParams } = useQueryParams<VentasFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: VentasFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  };
  
  const { data: ventasData, isLoading, error } = useVentas(currentParams);
  const { data: animalesData } = useAnimales();
  const { data: tiposVentaData } = useTiposVenta();
  const createMutation = useCreateVenta();
  const updateMutation = useUpdateVenta();
  const deleteMutation = useDeleteVenta();
  const { showToast } = useToast();

  const ventas = useMemo(() => ventasData?.data || [], [ventasData?.data]);
  const animales = animalesData?.data || [];
  const tiposVenta = tiposVentaData?.data || [];
  const pagination = ventasData?.pagination;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    venta?: Venta;
  }>({ isOpen: false });

  const handleFilterChange = (key: keyof VentasFilters, value: string | number | undefined) => {
    if (value === '' || value === undefined) {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      updateParams({ [key]: value });
    }
  };

  const clearAllFilters = () => {
    clearParams();
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

  const openModal = (venta?: Venta) => {
    setModalState({ isOpen: true, venta });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: VentaRequest) => {
    try {
      if (modalState.venta) {
        await updateMutation.mutateAsync({
          id: modalState.venta.ID_Venta,
          data: formData
        });
        showToast('Venta actualizada exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Venta creada exitosamente', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      let errorMessage = 'Error al guardar la venta';
      // Si el error viene del backend y tiene un mensaje, úsalo
      if (error && typeof error === 'object') {
        // Axios custom error
        if ('message' in error && typeof error.message === 'string' && error.message) {
          errorMessage = error.message;
        } else if (
          'originalError' in error &&
          error.originalError &&
          typeof error.originalError === 'object' &&
          'response' in error.originalError &&
          error.originalError.response &&
          typeof error.originalError.response === 'object' &&
          'data' in error.originalError.response &&
          error.originalError.response.data &&
          typeof error.originalError.response.data === 'object' &&
          'message' in error.originalError.response.data &&
          typeof error.originalError.response.data.message === 'string'
        ) {
          errorMessage = error.originalError.response.data.message;
        }
      }
      // Mensaje especial para estado "viva"
      if (errorMessage.includes('Solo se pueden vender animales que estén en estado')) {
        errorMessage = 'Solo puedes vender animales que estén en estado "viva". Por favor, selecciona un animal válido.';
      }
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (venta: Venta) => {
    if (window.confirm(`¿Estás seguro de eliminar la venta de "${venta.AnimalNombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(venta.ID_Venta);
        showToast('Venta eliminada exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la venta';
        showToast(errorMessage, 'error');
      }
    }
  };

  // Cálculos de estadísticas
  const totalIngresos = ventas.reduce((sum, venta) => {
    let precio = venta.Precio;
    if (typeof precio === 'string') {
      precio = parseFloat(precio);
    }
    return sum + (typeof precio === 'number' && !isNaN(precio) ? precio : 0);
  }, 0);

  const promedioVenta = ventas.length > 0 ? totalIngresos / ventas.length : 0;
  const totalVentas = ventas.length;

  // Formateador para moneda local con separadores
  const formatMoney = (valor: number | string) => {
    const numValue = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numValue)) return '0.00';
    return numValue.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Datos para gráficos
  const chartData = useMemo(() => {
    if (ventas.length === 0) return { ventasPorMes: [], ventasPorTipo: [] };

    // Ventas por mes - ordenadas cronológicamente
    const ventasPorMesMap = new Map<string, { mes: string; ventas: number; ingresos: number; fecha: Date }>();
    
    ventas.forEach(venta => {
      const fecha = new Date(venta.Fecha_Venta);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      
      if (ventasPorMesMap.has(mes)) {
        const existing = ventasPorMesMap.get(mes)!;
        existing.ventas += 1;
        existing.ingresos += Number(venta.Precio) || 0;
      } else {
        ventasPorMesMap.set(mes, { 
          mes, 
          ventas: 1, 
          ingresos: Number(venta.Precio) || 0,
          fecha: new Date(fecha.getFullYear(), fecha.getMonth(), 1)
        });
      }
    });

    const ventasPorMes = Array.from(ventasPorMesMap.values())
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .map((item) => {
        // Usar fecha para ordenamiento pero no incluir en resultado
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fecha, ...rest } = item;
        return rest;
      });

    // Ventas por tipo - ordenadas por cantidad
    const ventasPorTipoMap = new Map<string, { tipo: string; ventas: number; ingresos: number }>();
    
    ventas.forEach(venta => {
      const tipo = venta.Tipo_Venta || 'Sin especificar';
      
      if (ventasPorTipoMap.has(tipo)) {
        const existing = ventasPorTipoMap.get(tipo)!;
        existing.ventas += 1;
        existing.ingresos += Number(venta.Precio) || 0;
      } else {
        ventasPorTipoMap.set(tipo, { 
          tipo, 
          ventas: 1, 
          ingresos: Number(venta.Precio) || 0
        });
      }
    });

    const ventasPorTipo = Array.from(ventasPorTipoMap.values())
      .sort((a, b) => b.ventas - a.ventas);

    return { ventasPorMes, ventasPorTipo };
  }, [ventas]);

  // Colores para gráficos - adaptados al modo oscuro
  const COLORS = [
    'var(--color-base-green)', 
    'var(--color-tint1)', 
    'var(--color-sage-gray)', 
    'var(--color-gold)', 
    'var(--color-rust)', 
    'var(--color-slate)'
  ];

  const hasActiveFilters = Object.keys(params).length > 0;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar las ventas</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Ventas', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-cash-coin me-3"></i>
                Gestión de Ventas
              </h1>
              <p className="mb-0 fs-6">
                {isLoading ? 'Cargando ventas...' : pagination ? `${pagination.totalCount} ventas registradas` : `${ventas.length} ventas registradas`}
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <button 
                className="btn btn-outline-secondary d-lg-none" 
                data-bs-toggle="offcanvas" 
                data-bs-target="#filtersOffcanvas"
                aria-label="Abrir filtros"
              >
                <i className="bi bi-funnel me-2"></i>
                Filtros
                {hasActiveFilters && (
                  <span className="badge bg-primary ms-2">{Object.keys(params).length}</span>
                )}
              </button>
              <button className="btn btn-apply" onClick={() => openModal()}>
                <i className="bi bi-plus-circle-fill me-2"></i>
                <span className="fw-bold">Nueva</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Filters Panel */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="filters-panel d-none d-lg-block">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold d-flex align-items-center section-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-funnel-fill me-2"></i>
                Filtros de Búsqueda
              </h6>
              {hasActiveFilters && (
                <button className="btn btn-outline-secondary btn-sm" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-1"></i>
                  Limpiar Filtros
                </button>
              )}
            </div>
            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Animal</label>
                <select
                  className="form-select"
                  value={params.ID_Animal || ''}
                  onChange={(e) => handleFilterChange('ID_Animal', e.target.value ? Number(e.target.value) : undefined)}
                  aria-label="Filtrar por animal"
                >
                  <option value="">Todos los animales</option>
                  {animales.map((animal) => (
                    <option key={animal.ID_Animal} value={animal.ID_Animal}>
                      {animal.Nombre} - {animal.CategoriaTipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Tipo de Venta</label>
                <select
                  className="form-select"
                  value={params.Tipo_Venta || ''}
                  onChange={(e) => handleFilterChange('Tipo_Venta', e.target.value || undefined)}
                  aria-label="Filtrar por tipo de venta"
                >
                  <option value="">Todos los tipos</option>
                  {tiposVenta.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaDesde || ''}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                  aria-label="Fecha desde"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaHasta || ''}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                  aria-label="Fecha hasta"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Minimalistas */}
      {/* {ventas.length > 0 && ( */}
        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-cash "></i>
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">TOTAL INGRESOS</div>
                    <div className="fw-bold text-body">₡{formatMoney(totalIngresos)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-graph-up fs-5" style={{ color: 'var(--color-tint1)' }}></i>
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">PROMEDIO POR VENTA</div>
                    <div className="fw-bold text-body">₡{formatMoney(promedioVenta)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-list-check fs-5" style={{ color: 'var(--color-sage-gray)' }}></i>
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">TOTAL VENTAS</div>
                    <div className="fw-bold text-body">{totalVentas}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* )} */}

      {/* Gráficos Estadísticos Minimalistas */}
      {/* {ventas.length > 0 && ( */}
        <div className="row mb-4">
          {/* Gráfico de Ventas por Mes */}
          <div className="col-12 col-lg-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 pb-2">
                <h6 className="card-title mb-0 fw-semibold d-flex align-items-center section-title-dark" style={{ color: 'var(--color-base-green)' }}>
                  <i className="bi bi-calendar-month me-2"></i>
                  Análisis por Mes
                </h6>
              </div>
              <div className="card-body p-3">
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.ventasPorMes}>
                      <CartesianGrid strokeDasharray="2 2" stroke="var(--bs-border-color)" opacity={0.3} />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 10, fill: 'var(--bs-body-color)' }}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'var(--bs-body-color)' }}
                        axisLine={{ stroke: 'var(--bs-border-color)', opacity: 0.5 }}
                        tickLine={{ stroke: 'var(--bs-border-color)', opacity: 0.5 }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'ventas' ? `${value} ventas` : `₡${formatMoney(value)}`,
                          name === 'ventas' ? 'Cantidad' : 'Ingresos'
                        ]}
                        labelStyle={{ color: 'var(--bs-body-color)', fontSize: '11px' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--bs-body-bg)', 
                          border: '1px solid var(--bs-border-color)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: 'var(--bs-body-color)',
                          padding: '6px'
                        }}
                      />
                      <Bar 
                        dataKey="ventas" 
                        fill="var(--color-base-green)" 
                        radius={[1, 1, 0, 0]}
                        stroke="var(--color-tint1)"
                        strokeWidth={0.5}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Distribución por Tipo */}
          <div className="col-12 col-lg-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 pb-2">
                <h6 className="card-title mb-0 fw-semibold d-flex align-items-center section-title-dark" style={{ color: 'var(--color-base-green)' }}>
                  <i className="bi bi-pie-chart me-2"></i>
                  Distribución por Tipo
                </h6>
              </div>
              <div className="card-body p-3">
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.ventasPorTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ tipo, ventas }) => `${tipo}: ${ventas}`}
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="ventas"
                        stroke="var(--bs-border-color)"
                        strokeWidth={0.5}
                      >
                        {chartData.ventasPorTipo.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="var(--bs-border-color)"
                            strokeWidth={0.5}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} ventas`, 'Cantidad']}
                        labelStyle={{ color: 'var(--bs-body-color)', fontSize: '11px' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--bs-body-bg)', 
                          border: '1px solid var(--bs-border-color)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: 'var(--bs-body-color)',
                          padding: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Tabla de detalles */}
                {/* {chartData.ventasPorTipo.length > 0 && ( */}
                  <div className="mt-3">
                    <h6 className="small text-muted mb-2">Detalles por Tipo:</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-hover mb-0">
                        <thead>
                          <tr>
                            <th className="small">Tipo</th>
                            <th className="small text-center">Ventas</th>
                            <th className="small text-center">Porcentaje</th>
                            <th className="small text-end">Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.ventasPorTipo.map((item, index) => {
                            const totalVentas = chartData.ventasPorTipo.reduce((sum, v) => sum + v.ventas, 0);
                            const porcentaje = ((item.ventas / totalVentas) * 100).toFixed(1);
                            return (
                              <tr key={index}>
                                <td className="small">
                                  <span 
                                    className="badge me-2" 
                                    style={{ 
                                      backgroundColor: COLORS[index % COLORS.length],
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%'
                                    }}
                                  ></span>
                                  {item.tipo}
                                </td>
                                <td className="small text-center">{item.ventas}</td>
                                <td className="small text-center">{porcentaje}%</td>
                                <td className="small text-end">₡{formatMoney(item.ingresos)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                {/* )} */}
              </div>
            </div>
          </div>
        </div>
      {/* )} */}

      {/* Mobile Filters Offcanvas */}
      <div className="offcanvas offcanvas-start filters-offcanvas" tabIndex={-1} id="filtersOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title d-flex align-items-center">
            <i className="bi bi-funnel-fill me-2"></i>
            Filtros de Búsqueda
          </h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar filtros"></button>
        </div>
        <div className="offcanvas-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Animal</label>
              <select
                className="form-select"
                value={params.ID_Animal || ''}
                onChange={(e) => handleFilterChange('ID_Animal', e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por animal"
              >
                <option value="">Todos los animales</option>
                {animales.map((animal) => (
                  <option key={animal.ID_Animal} value={animal.ID_Animal}>
                    {animal.Nombre} - {animal.CategoriaTipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Tipo de Venta</label>
              <select
                className="form-select"
                value={params.Tipo_Venta || ''}
                onChange={(e) => handleFilterChange('Tipo_Venta', e.target.value || undefined)}
                aria-label="Filtrar por tipo de venta"
              >
                <option value="">Todos los tipos</option>
                {tiposVenta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Fecha desde</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaDesde || ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                aria-label="Fecha desde"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Fecha hasta</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaHasta || ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                aria-label="Fecha hasta"
              />
            </div>
          </div>
          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-apply" data-bs-dismiss="offcanvas">
              <i className="bi bi-search me-2"></i>
              Aplicar Filtros
            </button>
            <button className="btn btn-outline-secondary" onClick={clearAllFilters}>
              <i className="bi bi-x-circle me-2"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="card">
          <div className="card-body table-state-loading">
            <div className="d-flex flex-column align-items-center">
              <div className="spinner-border mb-3" style={{ color: 'var(--color-base-green)' }} role="status">
                <span className="visually-hidden">Cargando ventas...</span>
              </div>
              <h6 className="text-muted mb-0">Cargando ventas...</h6>
            </div>
          </div>
        </div>
      ) : ventas.length === 0 ? (
        <div className="card">
          <div className="card-body table-state-empty">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-cash-coin display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">No se encontraron ventas</h5>
              <p className="text-muted text-center mb-4">
                {hasActiveFilters 
                  ? 'No hay ventas que coincidan con los filtros aplicados.'
                  : 'Aún no tienes ventas registradas en el sistema.'
                }
              </p>
              {hasActiveFilters ? (
                <button className="btn btn-outline-secondary" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar Filtros
                </button>
              ) : (
                <button className="btn btn-apply" onClick={() => openModal()}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Registrar Primera Venta
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0 fw-semibold d-flex align-items-center section-title-dark" style={{ color: 'var(--color-base-green)' }}>
                    <i className="bi bi-list-ul me-2"></i>
                    Historial de Ventas
                  </h6>
                  <span className="badge rounded-pill px-3 py-2" style={{ 
                    backgroundColor: 'var(--color-sage-gray)', 
                    color: 'var(--color-charcoal)' 
                  }}>
                    {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'}
                  </span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-ganado table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" className="cell-tight text-center fw-bold">Animal</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Fecha</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Tipo</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Comprador</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Precio</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Registrado por</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => (
                      <tr key={venta.ID_Venta} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="text-body">{venta.AnimalNombre}</div>
                          {/* Información adicional para móviles */}
                          <div className="d-md-none small text-muted mt-1">
                            <div className='text-body'>{new Date(venta.Fecha_Venta).toLocaleDateString()}</div>
                            <div className='text-body'>{venta.Tipo_Venta}</div>
                            <div className='text-body'>{venta.Comprador}</div>
                            <div className='text-body'>{venta.UsuarioNombre}</div>
                          </div>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-md-table-cell">
                          <span className="">{new Date(venta.Fecha_Venta).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell">
                          <span className="text-body">{venta.Tipo_Venta}</span>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-md-table-cell">
                          <span className="text-body">{venta.Comprador}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <span className="text-body">₡{formatMoney(venta.Precio)}</span>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-lg-table-cell">
                          <span className="">{venta.UsuarioNombre}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <div className="btn-group gap-2" role="group" aria-label="Acciones de la venta">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openModal(venta)}
                              title="Editar"
                              aria-label="Editar venta"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(venta)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar"
                              aria-label="Eliminar venta"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {ventas.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="pagination-ganado">
                {pagination ? (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalCount}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    showItemsPerPage={true}
                    itemsPerPageOptions={[5, 10, 20, 50]}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                    nextPage={pagination.nextPage}
                    prevPage={pagination.prevPage}
                  />
                ) : (
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center">
                      <label htmlFor="itemsPerPage" className="form-label me-2 mb-0 small">
                        Mostrar:
                      </label>
                      <select
                        id="itemsPerPage"
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={currentParams.limit || 10}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        aria-label="Elementos por página"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="ms-2 text-muted small">por página</span>
                    </div>
                    <div className="text-muted small" aria-live="polite">
                      {isLoading ? 'Cargando...' : `${ventas.length} resultados`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <VentaModal
        venta={modalState.venta}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
