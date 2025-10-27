import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnimales } from '../../hooks/useAnimales';
import { useCurrency } from '../../context/CurrencyContext';
import { getImageDisplayUrl } from '../../utils/imageUtils';
import { CurrencyValue, ExchangeRateInfo } from '../ui/CurrencySelector';
import type { Venta, Animal } from '../../types/api';

interface VentaDetalleModalProps {
  venta: Venta | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VentaDetalleModal({ venta, isOpen, onClose }: VentaDetalleModalProps) {
  const { t } = useTranslation();
  // Obtener detalles del animal vendido
  const { data: animalesData } = useAnimales();
  const { monedaSeleccionada } = useCurrency();
  const animales = useMemo(() => animalesData?.data || [], [animalesData]);
  const animal = useMemo(() => animales.find((a: Animal) => a.ID_Animal === venta?.ID_Animal), [animales, venta]);
  const imageUrl = animal ? getImageDisplayUrl(animal.Imagen_URL || undefined) : null;


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !venta) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-receipt me-2"></i>
              {t('sales.modal.title')}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {/* ENCABEZADO DE FACTURA */}
            {venta.Numero_Factura && (
              <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bs-secondary-bg)' }}>
                <h4 className="mb-1" style={{ color: 'var(--color-base-green)' }}>
                  {t('sales.modal.invoiceNumber')} {venta.Numero_Factura}
                </h4>
                <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                  <p className="text-muted mb-0">
                    {t('sales.modal.issueDate')}: {formatDate(venta.Fecha_Venta)}
                  </p>
                  {venta.Moneda && (
                    <span className="badge" style={{ backgroundColor: 'var(--color-base-green)', color: 'white' }}>
                      {venta.Moneda}
                    </span>
                  )}
                </div>
                {venta.Moneda && venta.Moneda !== monedaSeleccionada && (
                  <ExchangeRateInfo 
                    monedaOrigen={venta.Moneda} 
                    monedaDestino={monedaSeleccionada}
                    className="small"
                  />
                )}
              </div>
            )}

            <div className="row g-4">
              {/* COLUMNA IZQUIERDA - INFORMACIÓN DEL ANIMAL */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent">
                    <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                      <i className="bi bi-tag me-2"></i>
                      {t('sales.modal.soldAnimal')}
                    </h6>
                  </div>
                  <div className="card-body text-center">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={animal?.Nombre} 
                        className="img-fluid rounded shadow-sm mb-3" 
                        style={{ maxHeight: 200, objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="bg-light border rounded d-flex align-items-center justify-content-center mb-3" style={{ height: 200 }}>
                        <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                    <h5 className="fw-bold">{animal?.Nombre || venta.AnimalNombre}</h5>
                    <div className="mt-3 text-start">
                      <div className="mb-2">
                        <i className="bi bi-gender-ambiguous me-2 text-muted"></i>
                        <strong>{t('sales.modal.sex')}:</strong> {animal?.Sexo === 'F' ? t('animals.form.female') : t('animals.form.male')}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-speedometer2 me-2 text-muted"></i>
                        <strong>{t('sales.modal.weight')}:</strong> {animal?.Peso || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-card-list me-2 text-muted"></i>
                        <strong>{t('sales.modal.breed')}:</strong> {animal?.Raza || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-tag me-2 text-muted"></i>
                        <strong>{t('sales.modal.category')}:</strong> {animal?.CategoriaTipo || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-palette me-2 text-muted"></i>
                        <strong>{t('sales.modal.color')}:</strong> {animal?.Color || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA - DETALLES DE FACTURACIÓN */}
              <div className="col-md-8">
                {/* INFORMACIÓN DE PARTES */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-transparent">
                    <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                      <i className="bi bi-people me-2"></i>
                      {t('sales.modal.partiesInfo')}
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--bs-secondary-bg)' }}>
                          <small className="text-muted d-block mb-1">{t('sales.modal.seller')}</small>
                          <strong>{venta.Vendedor || t('sales.modal.notSpecified')}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--bs-secondary-bg)' }}>
                          <small className="text-muted d-block mb-1">{t('sales.modal.buyer')}</small>
                          <strong>{venta.Comprador}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETALLES DE LA VENTA */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-transparent">
                    <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      {t('sales.modal.saleDetails')}
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">{t('sales.modal.saleType')}</small>
                        <span className="badge" style={{ backgroundColor: 'var(--color-tint1)', color: 'var(--color-charcoal)' }}>
                          {venta.Tipo_Venta}
                        </span>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">{t('sales.modal.paymentMethod')}</small>
                        <strong>{venta.Metodo_Pago || t('sales.modal.notSpecified')}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">{t('sales.modal.quantity')}</small>
                        <strong>{venta.Cantidad || 1} {t('sales.modal.units')}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">{t('sales.modal.registeredBy')}</small>
                        <strong>{venta.UsuarioNombre}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESUMEN FINANCIERO */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent">
                    <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                      <i className="bi bi-currency-dollar me-2"></i>
                      {t('sales.modal.financialSummary')}
                    </h6>
                  </div>
                  <div className="card-body">
                    <table className="table table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="text-muted">{t('sales.modal.price')}:</td>
                          <td className="text-end fw-semibold">
                            {(() => {
                              // Robust fallback: prefer Precio_Unitario, then Precio, then 0
                              let precio = 0;
                              if (typeof venta.Precio_Unitario === 'number' && !isNaN(venta.Precio_Unitario)) {
                                precio = venta.Precio_Unitario;
                              } else if (typeof venta.Precio === 'number' && !isNaN(venta.Precio)) {
                                precio = venta.Precio;
                              } else if (venta.Precio_Unitario != null && !isNaN(Number(venta.Precio_Unitario))) {
                                precio = Number(venta.Precio_Unitario);
                              } else if (venta.Precio != null && !isNaN(Number(venta.Precio))) {
                                precio = Number(venta.Precio);
                              }
                              return (
                                <CurrencyValue
                                  value={precio}
                                  originalCurrency={venta.Moneda || 'CRC'}
                                  showOriginal={venta.Moneda && venta.Moneda !== monedaSeleccionada}
                                  showSymbol={true}
                                />
                              );
                            })()}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">{t('sales.modal.quantity')}:</td>
                          <td className="text-end fw-semibold">× {venta.Cantidad || 1}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">{t('sales.modal.subtotal')}:</td>
                          <td className="text-end fw-semibold">
                            <CurrencyValue
                              value={typeof venta.Subtotal === 'number' ? venta.Subtotal : Number(venta.Precio || 0) * Number(venta.Cantidad || 1)}
                              originalCurrency={venta.Moneda || 'CRC'}
                              showOriginal={venta.Moneda && venta.Moneda !== monedaSeleccionada}
                              showSymbol={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">
                            IVA ({venta.IVA_Porcentaje || 0}%):
                          </td>
                          <td className="text-end fw-semibold">
                            <CurrencyValue
                              value={typeof venta.IVA_Monto === 'number' ? venta.IVA_Monto : (Number(venta.Subtotal || venta.Precio || 0) * Number(venta.IVA_Porcentaje || 12) / 100)}
                              originalCurrency={venta.Moneda || 'CRC'}
                              showOriginal={venta.Moneda && venta.Moneda !== monedaSeleccionada}
                              showSymbol={true}
                            />
                          </td>
                        </tr>
                        <tr className="border-top">
                          <td className="fs-5 fw-bold" style={{ color: 'var(--color-base-green)' }}>
                            {t('sales.modal.total')}:
                          </td>
                          <td className="text-end fs-5 fw-bold" style={{ color: 'var(--color-base-green)' }}>
                            {(() => {
                              const cantidad = Number(venta.Cantidad ?? 1);
                              const precioUnitario = Number(venta.Precio_Unitario ?? venta.Precio ?? 0);
                              const subtotal = typeof venta.Subtotal === 'number' ? venta.Subtotal : precioUnitario * cantidad;
                              const ivaPorcentaje = Number(venta.IVA_Porcentaje ?? 12);
                              const iva = typeof venta.IVA_Monto === 'number' ? venta.IVA_Monto : subtotal * ivaPorcentaje / 100;
                              const total = typeof venta.Total === 'number' ? venta.Total : subtotal + iva;
                              return (
                                <CurrencyValue
                                  value={total}
                                  originalCurrency={venta.Moneda || 'CRC'}
                                  showOriginal={venta.Moneda && venta.Moneda !== monedaSeleccionada}
                                  showSymbol={true}
                                />
                              );
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* OBSERVACIONES */}
                {venta.Observaciones && venta.Observaciones.trim() && (
                  <div className="card border-0 shadow-sm mt-3">
                    <div className="card-header bg-transparent">
                      <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                        <i className="bi bi-chat-left-text me-2"></i>
                        {t('sales.modal.observations')}
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-0">{venta.Observaciones}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 p-3" style={{ background: 'var(--bs-body-bg)', borderTop: '1px solid var(--bs-border-color)' }}>
            <div className="d-flex justify-content-end w-100">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                <i className="bi bi-x-circle me-2"></i>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
