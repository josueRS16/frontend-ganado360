import { useMemo } from 'react';
import { useAnimales } from '../../hooks/useAnimales';
import { getImageDisplayUrl } from '../../utils/imageUtils';
import type { Venta, Animal } from '../../types/api';

interface VentaDetalleModalProps {
  venta: Venta | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VentaDetalleModal({ venta, isOpen, onClose }: VentaDetalleModalProps) {
  // Obtener detalles del animal vendido
  const { data: animalesData } = useAnimales();
  const animales = useMemo(() => animalesData?.data || [], [animalesData]);
  const animal = useMemo(() => animales.find((a: Animal) => a.ID_Animal === venta?.ID_Animal), [animales, venta]);
  const imageUrl = animal ? getImageDisplayUrl(animal.Imagen_URL || undefined) : null;

  if (!isOpen || !venta) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles de la Venta</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-4 text-center">
                {imageUrl ? (
                  <img src={imageUrl} alt={animal?.Nombre} className="img-fluid rounded mb-2" style={{ maxHeight: 200 }} />
                ) : (
                  <div className="bg-light border rounded d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                    <span className="text-muted">Sin imagen</span>
                  </div>
                )}
                <h5 className="mt-2">{animal?.Nombre}</h5>
              </div>
              <div className="col-md-8">
                <div className="row g-2">
                  <div className="col-6">
                    <strong>Sexo:</strong> {animal?.Sexo === 'F' ? 'Hembra' : 'Macho'}
                  </div>
                  <div className="col-6">
                    <strong>Peso:</strong> {animal?.Peso} kg
                  </div>
                  <div className="col-6">
                    <strong>Raza:</strong> {animal?.Raza}
                  </div>
                  <div className="col-6">
                    <strong>Categoría:</strong> {animal?.CategoriaTipo}
                  </div>
                  <div className="col-12">
                    <strong>Comprador:</strong> {venta.Comprador}
                  </div>
                  <div className="col-12">
                    <strong>Observación:</strong> {venta.Observaciones || 'Sin observaciones'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
