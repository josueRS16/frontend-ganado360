import { useState, useEffect, useMemo } from 'react';
import { useVentas, useCreateVenta, useUpdateVenta, useDeleteVenta } from '../hooks/useVentas';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useTiposVenta } from '../hooks/useVentas';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { Pagination } from '../components/ui/Pagination';
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
  const { data: tiposVentaData } = useTiposVenta();

  const animales = useMemo(() => animalesData?.data || [], [animalesData?.data]);
  const usuarios = usuariosData?.data || [];
  const tiposVenta = tiposVentaData?.data || [];

  const [formData, setFormData] = useState<VentaRequest>({
    ID_Animal: venta?.ID_Animal || 0,
    Fecha_Venta: venta?.Fecha_Venta || '',
    Tipo_Venta: venta?.Tipo_Venta || '',
    Comprador: venta?.Comprador || '',
    Precio: venta?.Precio || 0,
    Registrado_Por: venta?.Registrado_Por || 1,
    Observaciones: venta?.Observaciones || '',
  });

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

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
      setFormData({
        ID_Animal: 0,
        Fecha_Venta: new Date().toISOString().split('T')[0],
        Tipo_Venta: '',
        Comprador: '',
        Precio: 0,
        Registrado_Por: 1,
        Observaciones: '',
      });
    }
  }, [venta]);

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
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label fw-semibold">Animal</label>
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

export default VentaModal;
