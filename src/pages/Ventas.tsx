import { useState, useEffect, useMemo } from 'react';
import { useVentas, useCreateVenta, useUpdateVenta, useDeleteVenta } from '../hooks/useVentas';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/ui/Breadcrumb';
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
  const animales = useMemo(() => animalesData?.data || [], [animalesData?.data]);
  const usuarios = usuariosData?.data || [];

  const [formData, setFormData] = useState<VentaRequest>({
    ID_Animal: venta?.ID_Animal || 0,
    Fecha_Venta: venta?.Fecha_Venta || '',
    Tipo_Venta: venta?.Tipo_Venta || '',
    Comprador: venta?.Comprador || '',
    Precio: venta?.Precio || 0,
    Registrado_Por: venta?.Registrado_Por || 1,
    Observaciones: venta?.Observaciones || '',
  });

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
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {venta ? 'Editar Venta' : 'Nueva Venta'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label">Animal</label>
                  <select
                    className="form-select"
                    id="animal"
                    value={formData.ID_Animal ?? ""}
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
                  <label htmlFor="fecha" className="form-label">Fecha de Venta</label>
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
                  <label htmlFor="tipo" className="form-label">Tipo de Venta</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tipo"
                    value={formData.Tipo_Venta}
                    onChange={(e) => setFormData({ ...formData, Tipo_Venta: e.target.value })}
                    placeholder="Ej: Venta Directa, Subasta, Exportación..."
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="comprador" className="form-label">Comprador</label>
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
                  <label htmlFor="precio" className="form-label">Precio</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
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
                  <label htmlFor="usuario" className="form-label">Registrado por</label>
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
                  <label htmlFor="observaciones" className="form-label">Observaciones</label>
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
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!formData.Comprador.trim() || formData.Precio <= 0 || formData.ID_Animal <= 0}
              >
                {venta ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Ventas() {
  const { params } = useQueryParams<VentasFilters>();
  const { data, isLoading, error } = useVentas(params);
  const createMutation = useCreateVenta();
  const updateMutation = useUpdateVenta();
  const deleteMutation = useDeleteVenta();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    venta?: Venta;
  }>({ isOpen: false });

  const [showFilters, setShowFilters] = useState(false);

  const ventas = data?.data || [];

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
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la venta';
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

  const totalIngresos = ventas.reduce((sum, venta) => sum + venta.Precio, 0);

  const hasActiveFilters = Object.keys(params).length > 0;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar las ventas</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Gestión', path: '#' },
          { label: 'Ventas', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Ventas</h1>
          <p className="text-muted mb-0">
            {isLoading ? 'Cargando...' : `${ventas.length} ventas registradas`}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros {hasActiveFilters && <span className="badge bg-primary ms-1">{Object.keys(params).length}</span>}
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Resumen de ingresos */}
      {ventas.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h5 className="card-title">Total Ingresos</h5>
                <h3 className="card-text">${totalIngresos.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h5 className="card-title">Promedio por Venta</h5>
                <h3 className="card-text">${(totalIngresos / ventas.length).toLocaleString()}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h5 className="card-title">Total Ventas</h5>
                <h3 className="card-text">{ventas.length}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando ventas...</span>
          </div>
        </div>
      ) : ventas.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay ventas registradas</h5>
            <p className="text-muted">Registra la primera venta del sistema.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Registrar Primera Venta
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Animal</th>
                  <th>Fecha Venta</th>
                  <th>Tipo</th>
                  <th>Comprador</th>
                  <th>Precio</th>
                  <th>Registrado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.ID_Venta}>
                    <td className="fw-semibold">{venta.AnimalNombre}</td>
                    <td>{new Date(venta.Fecha_Venta).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-secondary">{venta.Tipo_Venta}</span>
                    </td>
                    <td>{venta.Comprador}</td>
                    <td className="fw-bold text-success">${venta.Precio.toLocaleString()}</td>
                    <td>{venta.UsuarioNombre}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(venta)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(venta)}
                          disabled={deleteMutation.isPending}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
