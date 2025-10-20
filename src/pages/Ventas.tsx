import { useState, useEffect, useMemo } from 'react';
import { useVentas, useCreateVenta, useUpdateVenta, useDeleteVenta } from '../hooks/useVentas';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useTiposVenta } from '../hooks/useVentas';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { useCurrency } from '../context/CurrencyContext';
import { Pagination } from '../components/ui/Pagination';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { CurrencySelector, CurrencyValue } from '../components/ui/CurrencySelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generarFacturaPDF } from '../utils/facturasPDF';
import { ventasApi } from '../api/ventas';
import { VentaDetalleModal } from '../components/modals/VentaDetalleModal';
import type { VentasFilters, Venta, VentaRequest, Moneda } from '../types/api';


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
  const { obtenerTipoCambio, convertirValor } = useCurrency();

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
  const metodosPago = ['Efectivo', 'Sinpe Móvil', 'Transferencia', 'Cheque', 'Tarjeta'];

  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<VentaRequest>({
    ID_Animal: venta?.ID_Animal || 0,
    Fecha_Venta: venta?.Fecha_Venta || today,
    Tipo_Venta: venta?.Tipo_Venta || '',
    Comprador: venta?.Comprador || '',
    Vendedor: venta?.Vendedor || 'Rancho El Paraíso',
    Metodo_Pago: venta?.Metodo_Pago || 'Efectivo',
    Precio_Unitario: venta?.Precio_Unitario || venta?.Precio || 0,
    Cantidad: venta?.Cantidad || 1,
    IVA_Porcentaje: venta?.IVA_Porcentaje || 12,
    Registrado_Por: venta?.Registrado_Por || 1,
    Observaciones: venta?.Observaciones || '',
    Moneda: venta?.Moneda || 'CRC',
    Tipo_Cambio: venta?.Tipo_Cambio || 1,
  });

  // Cálculos en tiempo real
  const subtotal = useMemo(() => {
    const precio = Number(formData.Precio_Unitario) || 0;
    const cantidad = Number(formData.Cantidad) || 1;
    return precio * cantidad;
  }, [formData.Precio_Unitario, formData.Cantidad]);

  const iva = useMemo(() => {
    const porcentajeIVA = Number(formData.IVA_Porcentaje) || 0;
    return subtotal * (porcentajeIVA / 100);
  }, [subtotal, formData.IVA_Porcentaje]);

  const total = useMemo(() => {
    return subtotal + iva;
  }, [subtotal, iva]);

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

  // Función para formatear moneda (usando la moneda del formulario)
  const formatMoney = (valor: number) => {
    const monedaFormulario = formData.Moneda || 'CRC';
    if (monedaFormulario === 'CRC') {
      return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Actualizar formData cuando cambie la venta (para edición)
  useEffect(() => {
    if (venta) {
      const monedaVenta = venta.Moneda || 'CRC';
      const precioVenta = venta.Precio_Unitario || venta.Precio || 0;
      const tipoCambioVenta = venta.Tipo_Cambio || 1;
      
      // Si la venta está almacenada en CRC pero tiene moneda USD, convertir para mostrar
      let precioParaMostrar = precioVenta;
      if (monedaVenta === 'USD' && precioVenta > 0) {
        // El precio está almacenado en CRC en el backend, convertir a USD para mostrar
        precioParaMostrar = convertirValor(precioVenta, 'CRC', 'USD');
        console.log(`Cargando venta: ₡${precioVenta} CRC → $${precioParaMostrar} USD`);
      }
      
      setFormData({
        ID_Animal: venta.ID_Animal,
        Fecha_Venta: formatDateForInput(venta.Fecha_Venta),
        Tipo_Venta: venta.Tipo_Venta,
        Comprador: venta.Comprador,
        Vendedor: venta.Vendedor || 'Rancho El Paraíso',
        Metodo_Pago: venta.Metodo_Pago || 'Efectivo',
        Precio_Unitario: precioParaMostrar,
        Cantidad: venta.Cantidad || 1,
        IVA_Porcentaje: venta.IVA_Porcentaje || 12,
        Registrado_Por: venta.Registrado_Por,
        Observaciones: venta.Observaciones || '',
        Moneda: monedaVenta,
        Tipo_Cambio: tipoCambioVenta,
      });
    } else {
      // Limpiar formulario para nueva venta
      setFormData({
        ID_Animal: 0,
        Fecha_Venta: today,
        Tipo_Venta: '',
        Comprador: '',
        Vendedor: 'Rancho El Paraíso',
        Metodo_Pago: 'Efectivo',
        Precio_Unitario: 0,
        Cantidad: 1,
        IVA_Porcentaje: 12,
        Registrado_Por: 1,
        Observaciones: '',
        Moneda: 'CRC',
        Tipo_Cambio: 1,
      });
    }
  }, [venta, today, convertirValor]);

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
    const precioUnitario = Number(formData.Precio_Unitario) || 0;
    const idAnimal = Number(formData.ID_Animal) || 0;
    
    if (formData.Comprador.trim() && formData.Vendedor.trim() && precioUnitario > 0 && idAnimal > 0) {
      const monedaFormulario = formData.Moneda || 'CRC';
      
      // Si la moneda del formulario es USD, convertir todos los valores a CRC para el backend
      let precioParaEnvio = precioUnitario;
      let subtotalParaEnvio = subtotal;
      
      if (monedaFormulario === 'USD') {
        // Convertir USD a CRC para almacenamiento en backend
        precioParaEnvio = convertirValor(precioUnitario, 'USD', 'CRC');
        subtotalParaEnvio = convertirValor(subtotal, 'USD', 'CRC');
        
        console.log(`Conversión para envío: $${precioUnitario} USD → ₡${precioParaEnvio} CRC`);
        console.log(`Subtotal convertido: $${subtotal} USD → ₡${subtotalParaEnvio} CRC`);
      }
      
      // Preparar datos para envío
      const datosParaEnvio = {
        ...formData,
        ID_Animal: idAnimal,
        Precio_Unitario: precioParaEnvio,
        Subtotal: subtotalParaEnvio,
        // Mantener la moneda original y tipo de cambio para referencia
        Moneda: monedaFormulario,
        Tipo_Cambio: obtenerTipoCambio('CRC', monedaFormulario)
      };
      
      onSave(datosParaEnvio);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-receipt-cutoff me-2"></i>
              {venta ? 'Editar Venta/Factura' : 'Nueva Venta/Factura'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <p className="text-muted small mb-4">
                <i className="bi bi-info-circle me-1"></i>
                {venta ? 'Para edición: se muestra el animal actual + animales vivos' : 'Solo animales vivos disponibles para venta'}
              </p>

              {/* SECCIÓN 1: INFORMACIÓN DEL ANIMAL Y FECHA */}
              <div className="card mb-3 border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                    <i className="bi bi-tag me-2"></i>
                    Información del Animal
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label htmlFor="animal" className="form-label fw-semibold">Animal *</label>
                      <select
                        className="form-select"
                        id="animal"
                        value={formData.ID_Animal}
                        onChange={(e) => setFormData({ ...formData, ID_Animal: Number(e.target.value) })}
                        required
                      >
                        <option value="0">Seleccionar animal...</option>
                        {animales.map(animal => (
                          <option key={animal.ID_Animal} value={animal.ID_Animal}>
                            {animal.Nombre} - {animal.CategoriaTipo} ({animal.Raza})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="fecha" className="form-label fw-semibold">Fecha de Venta *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="fecha"
                        value={formData.Fecha_Venta}
                        onChange={(e) => setFormData({ ...formData, Fecha_Venta: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: INFORMACIÓN DE FACTURACIÓN */}
              <div className="card mb-3 border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                    <i className="bi bi-people me-2"></i>
                    Información de Facturación
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="vendedor" className="form-label fw-semibold">Vendedor *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="vendedor"
                        value={formData.Vendedor}
                        onChange={(e) => setFormData({ ...formData, Vendedor: e.target.value })}
                        placeholder="Nombre del vendedor/rancho..."
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="comprador" className="form-label fw-semibold">Comprador *</label>
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
                      <label htmlFor="tipo" className="form-label fw-semibold">Tipo de Venta *</label>
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
                      <label htmlFor="metodo-pago" className="form-label fw-semibold">Método de Pago</label>
                      <select
                        className="form-select"
                        id="metodo-pago"
                        value={formData.Metodo_Pago}
                        onChange={(e) => setFormData({ ...formData, Metodo_Pago: e.target.value })}
                      >
                        {metodosPago.map(metodo => (
                          <option key={metodo} value={metodo}>
                            {metodo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: DETALLES DE PRECIO */}
              <div className="card mb-3 border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                    <i className="bi bi-currency-dollar me-2"></i>
                    Detalles de Precio
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="precio-unitario" className="form-label fw-semibold">Precio Unitario *</label>
                      <div className="input-group">
                        <span className="input-group-text fw-bold">
                          {formData.Moneda === 'CRC' ? '₡' : '$'}
                        </span>
                        <input
                          type="number"
                          className="form-control"
                          id="precio-unitario"
                          value={formData.Precio_Unitario}
                          onChange={(e) => setFormData({ ...formData, Precio_Unitario: Number(e.target.value) })}
                          min="0.01"
                          step="0.01"
                          placeholder="50000.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Moneda</label>
                      <CurrencySelector
                        value={formData.Moneda || 'CRC'}
                        onChange={(nuevaMoneda: Moneda) => {
                          const monedaActual = formData.Moneda || 'CRC';
                          const precioActual = Number(formData.Precio_Unitario) || 0;
                          
                          // Si hay un precio actual, convertir el valor a la nueva moneda
                          let nuevoPrecio = precioActual;
                          if (precioActual > 0 && monedaActual !== nuevaMoneda) {
                            nuevoPrecio = convertirValor(precioActual, monedaActual, nuevaMoneda);
                            
                            // Mostrar mensaje informativo sobre la conversión
                            const simboloOrigen = monedaActual === 'CRC' ? '₡' : '$';
                            const simboloDestino = nuevaMoneda === 'CRC' ? '₡' : '$';
                            console.log(`Conversión: ${simboloOrigen}${precioActual.toFixed(2)} → ${simboloDestino}${nuevoPrecio.toFixed(2)}`);
                          }
                          
                          const tipoCambio = obtenerTipoCambio('CRC', nuevaMoneda);
                          setFormData({
                            ...formData,
                            Moneda: nuevaMoneda,
                            Tipo_Cambio: tipoCambio,
                            Precio_Unitario: nuevoPrecio
                          });
                        }}
                        showExchangeRate={true}
                        className="w-100"
                      />
                    </div>
                    <div className="col-md-2">
                      <label htmlFor="cantidad" className="form-label fw-semibold">Cantidad</label>
                      <input
                        type="number"
                        className="form-control"
                        id="cantidad"
                        value={formData.Cantidad}
                        onChange={(e) => setFormData({ ...formData, Cantidad: Number(e.target.value) })}
                        min="1"
                        disabled
                      />
                      <small className="text-muted">Siempre 1 por ahora</small>
                    </div>
                    <div className="col-md-2">
                      <label htmlFor="iva-porcentaje" className="form-label fw-semibold">IVA %</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="iva-porcentaje"
                          value={formData.IVA_Porcentaje}
                          onChange={(e) => setFormData({ ...formData, IVA_Porcentaje: Number(e.target.value) })}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                  </div>

                  {/* RESUMEN DE FACTURA */}
                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bs-secondary-bg)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 fw-bold">Resumen de Factura</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge" style={{ backgroundColor: 'var(--color-base-green)', color: 'white' }}>
                          {formData.Moneda === 'CRC' ? '₡ Colones' : '$ Dólares'}
                        </span>
                        {formData.Moneda !== 'CRC' && (
                          <small className="text-muted">
                            TC: {formData.Tipo_Cambio?.toFixed(4) || '1.0000'}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span className="fw-semibold">{formatMoney(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>IVA ({formData.IVA_Porcentaje}%):</span>
                      <span className="fw-semibold">{formatMoney(iva)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fs-5 fw-bold" style={{ color: 'var(--color-base-green)' }}>TOTAL:</span>
                      <span className="fs-5 fw-bold" style={{ color: 'var(--color-base-green)' }}>{formatMoney(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: INFORMACIÓN ADICIONAL */}
              <div className="card mb-0 border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <h6 className="mb-0 fw-semibold" style={{ color: 'var(--color-base-green)' }}>
                    <i className="bi bi-pencil-square me-2"></i>
                    Información Adicional
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-12">
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
                        maxLength={1000}
                      />
                      <small className="text-muted">{formData.Observaciones?.length || 0}/1000 caracteres</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-3" style={{ background: 'var(--bs-body-bg)', borderTop: '1px solid var(--bs-border-color)' }}>
              <div className="d-flex justify-content-between align-items-center gap-2 w-100">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {venta ? 'Se actualizará la factura' : 'Se generará un número de factura automáticamente'}
                </small>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-apply"
                    disabled={!formData.Comprador.trim() || !formData.Vendedor.trim() || formData.Precio_Unitario <= 0 || formData.ID_Animal <= 0}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {venta ? 'Actualizar Venta' : 'Crear Venta y Generar Factura'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Ventas() {
  const { params, updateParams, clearParams, setParams } = useQueryParams<VentasFilters>();

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
  const {
    monedaSeleccionada,
    setMonedaSeleccionada,
    formatearValorConConversion,
    obtenerSimbolo
  } = useCurrency();

  const ventas = useMemo(() => ventasData?.data || [], [ventasData?.data]);
  const animales = animalesData?.data || [];
  const tiposVenta = tiposVentaData?.data || [];
  const pagination = ventasData?.pagination;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    venta?: Venta;
  }>({ isOpen: false });

  const [detalleModalState, setDetalleModalState] = useState<{
    isOpen: boolean;
    venta: Venta | null;
  }>({ isOpen: false, venta: null });

  const [downloadingPDF, setDownloadingPDF] = useState<number | null>(null);

  const handleFilterChange = (key: keyof VentasFilters, value: string | number | undefined) => {
    if (value === '' || value === undefined) {
      // Elimina la clave usando setParams para forzar el borrado completo (igual que Animales)
      const newParams = { ...params };
      delete newParams[key];
      setParams(newParams);
    } else {
      updateParams({ ...params, [key]: value });
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
        const created = await createMutation.mutateAsync(formData);
        showToast('Venta creada exitosamente', 'success');
        // Si el backend devuelve la venta creada, intentar descargar la factura cuando esté disponible
        const createdId = created?.data?.ID_Venta;
        if (createdId) {
          // Poll the venta endpoint until Numero_Factura is set (backend may generate it asynchronously)
          const maxAttempts = 20;
          const delayMs = 1000;
          let found = false;
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
              const ventaResp = await ventasApi.getById(Number(createdId));
              const ventaData = ventaResp?.data;
              if (ventaData && ventaData.Numero_Factura) {
                found = true;
                break;
              }
            } catch (err) {
              // ignore and retry
            }
            await new Promise(res => setTimeout(res, delayMs));
          }
          // Mensaje eliminado: la factura se puede descargar desde la lista
        }
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
    if (window.confirm(`¿Estás seguro de eliminar la venta de "${venta.AnimalNombre}"?${venta.Numero_Factura ? `\nFactura: ${venta.Numero_Factura}` : ''}`)) {
      try {
        await deleteMutation.mutateAsync(venta.ID_Venta);
        showToast('Venta eliminada exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la venta';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleDescargarPDF = async (ventaId: number) => {
    try {
      setDownloadingPDF(ventaId);
      showToast('Descargando factura...', 'info');
      // Obtener datos de la factura desde el endpoint específico usando el cliente API (asegura baseURL correcto)
      const resp = await ventasApi.getFacturaPDF(ventaId);
      if (!resp || !resp.data) {
        throw new Error('No se recibieron datos de factura desde el backend');
      }
      // Generar y descargar el PDF
      await generarFacturaPDF(resp.data);
      showToast('Factura descargada exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showToast(error instanceof Error ? error.message : 'Error al descargar la factura', 'error');
    } finally {
      setDownloadingPDF(null);
    }
  };

  const openDetalleModal = (venta: Venta) => {
    setDetalleModalState({ isOpen: true, venta });
  };

  const closeDetalleModal = () => {
    setDetalleModalState({ isOpen: false, venta: null });
  };

  // Cálculos de estadísticas (priorizar Total de factura sobre Precio)
  const totalIngresos = useMemo(() => {
    return ventas.reduce((sum, venta) => {
      let monto = venta.Total || venta.Precio;
      if (typeof monto === 'string') {
        monto = parseFloat(monto);
      }
      const montoNumerico = typeof monto === 'number' && !isNaN(monto) ? monto : 0;

      // Convertir a la moneda seleccionada si es necesario
      const monedaVenta = venta.Moneda || 'CRC';
      if (monedaVenta !== monedaSeleccionada) {
        // Usar la función de conversión directa
        const valorConvertido = formatearValorConConversion(montoNumerico, monedaVenta, false);
        const valorNumerico = typeof valorConvertido === 'string' ? parseFloat(valorConvertido.replace(/[^\d.-]/g, '')) : valorConvertido;
        return sum + (isNaN(valorNumerico) ? 0 : valorNumerico);
      }

      return sum + montoNumerico;
    }, 0);
  }, [ventas, monedaSeleccionada, formatearValorConConversion]);

  const promedioVenta = useMemo(() => {
    return ventas.length > 0 ? (totalIngresos as number) / ventas.length : 0;
  }, [ventas.length, totalIngresos]);

  const totalVentas = ventas.length;

  // Formateador para moneda local con separadores (usando contexto de moneda)
  const formatMoney = (valor: number | string) => {
    const numValue = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numValue)) return `${obtenerSimbolo(monedaSeleccionada)}0.00`;
    return numValue.toLocaleString('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Datos para gráficos
  const chartData = useMemo(() => {
    if (ventas.length === 0) return { ventasPorMes: [], ventasPorTipo: [] };

    // Ventas por mes - ordenadas cronológicamente
    const ventasPorMesMap = new Map<string, { mes: string; ventas: number; ingresos: number; fecha: Date }>();

    ventas.forEach(venta => {
      const fecha = new Date(venta.Fecha_Venta);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      let monto = venta.Total || venta.Precio;
      if (typeof monto === 'string') {
        monto = parseFloat(monto);
      }
      const montoNumerico = typeof monto === 'number' && !isNaN(monto) ? monto : 0;

      // Convertir a la moneda seleccionada si es necesario
      const monedaVenta = venta.Moneda || 'CRC';
      let ingresos = montoNumerico;
      if (monedaVenta !== monedaSeleccionada) {
        // Usar la función de conversión directa
        const valorConvertido = formatearValorConConversion(montoNumerico, monedaVenta, false);
        ingresos = typeof valorConvertido === 'string' ? parseFloat(valorConvertido.replace(/[^\d.-]/g, '')) : valorConvertido;
        if (isNaN(ingresos)) ingresos = 0;
      }

      if (ventasPorMesMap.has(mes)) {
        const existing = ventasPorMesMap.get(mes)!;
        existing.ventas += 1;
        existing.ingresos += ingresos;
      } else {
        ventasPorMesMap.set(mes, {
          mes,
          ventas: 1,
          ingresos: ingresos,
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
      let monto = venta.Total || venta.Precio;
      if (typeof monto === 'string') {
        monto = parseFloat(monto);
      }
      const montoNumerico = typeof monto === 'number' && !isNaN(monto) ? monto : 0;

      // Convertir a la moneda seleccionada si es necesario
      const monedaVenta = venta.Moneda || 'CRC';
      let ingresos = montoNumerico;
      if (monedaVenta !== monedaSeleccionada) {
        // Usar la función de conversión directa
        const valorConvertido = formatearValorConConversion(montoNumerico, monedaVenta, false);
        ingresos = typeof valorConvertido === 'string' ? parseFloat(valorConvertido.replace(/[^\d.-]/g, '')) : valorConvertido;
        if (isNaN(ingresos)) ingresos = 0;
      }

      if (ventasPorTipoMap.has(tipo)) {
        const existing = ventasPorTipoMap.get(tipo)!;
        existing.ventas += 1;
        existing.ingresos += ingresos;
      } else {
        ventasPorTipoMap.set(tipo, {
          tipo,
          ventas: 1,
          ingresos: ingresos
        });
      }
    });

    const ventasPorTipo = Array.from(ventasPorTipoMap.values())
      .sort((a, b) => b.ventas - a.ventas);

    return { ventasPorMes, ventasPorTipo };
  }, [ventas, monedaSeleccionada, formatearValorConConversion]);

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
            <div className="flex-grow-1">
              <h1 className="h2 mb-2 d-flex align-items-center" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-cash-coin me-3"></i>
                Gestión de Ventas
              </h1>
              <p className="mb-0 fs-6 text-muted">
                {isLoading ? 'Cargando ventas...' : pagination ? `${pagination.totalCount} ventas registradas` : `${ventas.length} ventas registradas`}
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <div className="d-flex align-items-center gap-2">
                <label className="form-label mb-0 small text-muted">Moneda:</label>
                <CurrencySelector
                  value={monedaSeleccionada}
                  onChange={setMonedaSeleccionada}
                  compact={true}
                  className="d-none d-md-block"
                />
              </div>
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
              <h6 className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--color-base-green)' }}>
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
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Número de Factura</label>
                <input
                  type="text"
                  className="form-control"
                  value={params.Numero_Factura || ''}
                  onChange={(e) => handleFilterChange('Numero_Factura', e.target.value || undefined)}
                  placeholder="FAC-2025-00001"
                  aria-label="Buscar por número de factura"
                  autoComplete="off"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Comprador</label>
                <input
                  type="text"
                  className="form-control"
                  value={params.Comprador || ''}
                  onChange={(e) => handleFilterChange('Comprador', e.target.value || undefined)}
                  placeholder="Nombre del comprador"
                  aria-label="Buscar por comprador"
                  autoComplete="off"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Animal</label>
                <select
                  className="form-select"
                  value={params.ID_Animal || ''}
                  onChange={(e) => handleFilterChange('ID_Animal', e.target.value === '' ? undefined : Number(e.target.value))}
                  aria-label="Filtrar por animal"
                >
                  <option value="">Todos</option>
                  {animales.map((animal) => (
                    <option key={animal.ID_Animal} value={animal.ID_Animal}>
                      {animal.Nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Tipo de Venta</label>
                <select
                  className="form-select"
                  value={params.Tipo_Venta || ''}
                  onChange={(e) => handleFilterChange('Tipo_Venta', e.target.value === '' ? undefined : e.target.value)}
                  aria-label="Filtrar por tipo de venta"
                >
                  <option value="">Todos</option>
                  {tiposVenta.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row g-3 mt-1">
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

      {/* Estadísticas Responsive */}
      <div className="row mb-3">
        <div className="col-sm-6 col-lg-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {monedaSeleccionada === 'CRC' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="var(--color-base-green)" viewBox="0 0 16 16">
                      <text x="1" y="12" fontSize="16" fontWeight="bold" fill="var(--color-base-green)">₡</text>
                    </svg>
                  ) : (
                    <i className="bi bi-currency-dollar fs-4" style={{ color: 'var(--color-base-green)' }}></i>
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="text-muted small fw-semibold">TOTAL INGRESOS</div>
                  <div className="fw-bold fs-5" style={{ color: 'var(--bs-body-color)' }}>
                    {formatMoney(totalIngresos)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {monedaSeleccionada === 'CRC' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="var(--color-base-green)" viewBox="0 0 16 16">
                      <text x="1" y="12" fontSize="16" fontWeight="bold" fill="var(--color-base-green)">₡</text>
                    </svg>
                  ) : (
                    <i className="bi bi-currency-dollar fs-4" style={{ color: 'var(--color-base-green)' }}></i>
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="text-muted small fw-semibold">PROMEDIO POR VENTA</div>
                  <div className="fw-bold fs-5" style={{ color: 'var(--bs-body-color)' }}>
                    {formatMoney(promedioVenta)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-12 col-lg-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-list-check fs-4" style={{ color: 'var(--color-sage-gray)' }}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="text-muted small fw-semibold">TOTAL VENTAS</div>
                  <div className="fw-bold fs-5" style={{ color: 'var(--bs-body-color)' }}>
                    {totalVentas}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Estadísticos Responsive */}
      <div className="row mb-4">
        {/* Gráfico de Ventas por Mes */}
        <div className="col-12 col-lg-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pb-2">
              <h6 className="card-title mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--color-base-green)' }}>
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
                        name === 'ventas' ? `${value} ventas` : `${formatMoney(value)}`,
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
              <h6 className="card-title mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--color-base-green)' }}>
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
                            <td className="small text-end">
                              <div className="d-flex align-items-center justify-content-end gap-1">
                                {monedaSeleccionada === 'CRC' ? (
                                  <span className="small fw-bold" style={{ color: 'var(--color-base-green)' }}>₡</span>
                                ) : (
                                  <i className="bi bi-currency-dollar small" style={{ color: 'var(--color-base-green)' }}></i>
                                )}

                                {formatMoney(item.ingresos)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <label className="form-label">Número de Factura</label>
              <input
                type="text"
                className="form-control"
                value={params.Numero_Factura || ''}
                onChange={(e) => handleFilterChange('Numero_Factura', e.target.value || undefined)}
                placeholder="FAC-2025-00001"
                aria-label="Buscar por número de factura"
                autoComplete="off"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Comprador</label>
              <input
                type="text"
                className="form-control"
                value={params.Comprador || ''}
                onChange={(e) => handleFilterChange('Comprador', e.target.value || undefined)}
                placeholder="Nombre del comprador"
                aria-label="Buscar por comprador"
                autoComplete="off"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Animal</label>
              <select
                className="form-select"
                value={params.ID_Animal || ''}
                onChange={(e) => handleFilterChange('ID_Animal', e.target.value === '' ? undefined : Number(e.target.value))}
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
                onChange={(e) => handleFilterChange('Tipo_Venta', e.target.value === '' ? undefined : e.target.value)}
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
                  <h6 className="card-title mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--color-base-green)' }}>
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
                      <th scope="col" className="cell-tight text-center fw-bold p-4">Factura</th>
                      <th scope="col" className="cell-tight text-center fw-bold p-4">Animal</th>
                      <th scope="col" className="cell-tight text-center fw-bold p-4 d-none d-lg-table-cell">Fecha</th>
                      <th scope="col" className="cell-tight text-center fw-bold p-4 d-none d-xl-table-cell">Tipo</th>
                      <th scope="col" className="cell-tight text-center fw-bold p-4 d-none d-md-table-cell">Comprador</th>
                      <th scope="col" className="cell-tight text-center fw-bold p-4">Total</th>
                      <th scope="col" className="cell-tight text-center fw-bold p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => (
                      <tr key={venta.ID_Venta} className="align-middle">
                        <td className="cell-tight text-center">
                          {venta.Numero_Factura ? (
                            <span className="text-center">{venta.Numero_Factura}</span>
                          ) : (
                            <span className="text-center">Sin No.</span>
                          )}
                        </td>
                        <td className="cell-tight text-center">
                          <div className="text-center" title={venta.AnimalNombre}>
                            {venta.AnimalNombre}
                          </div>
                          {/* Información adicional para móviles */}
                          <div className="d-lg-none small mt-1">
                            <div className='text-muted'>{new Date(venta.Fecha_Venta).toLocaleDateString('es-CR')}</div>
                            <div className='text-muted' style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={venta.Tipo_Venta}>
                              {venta.Tipo_Venta}
                            </div>
                          </div>
                          <div className="d-md-none small mt-1">
                            <div className='text-muted' style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={venta.Comprador}>
                              {venta.Comprador}
                            </div>
                          </div>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-lg-table-cell">
                          <span className="">{new Date(venta.Fecha_Venta).toLocaleDateString('es-CR')}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-xl-table-cell">
                          <span className="text-center">
                            {venta.Tipo_Venta}
                          </span>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-md-table-cell">
                          <span className="text-body" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={venta.Comprador}>
                            {venta.Comprador}
                          </span>
                        </td>
                        <td className="cell-tight text-center">
                          <div>
                            {(() => {
                              // Cálculo robusto para Subtotal e IVA
                              const cantidad = Number(venta.Cantidad ?? 1);
                              const precioUnitario = Number(venta.Precio_Unitario ?? venta.Precio ?? 0);
                              const subtotal = typeof venta.Subtotal === 'number' ? venta.Subtotal : precioUnitario * cantidad;
                              const ivaPorcentaje = Number(venta.IVA_Porcentaje ?? 12);
                              const iva = typeof venta.IVA_Monto === 'number' ? venta.IVA_Monto : subtotal * ivaPorcentaje / 100;
                              const total = typeof venta.Total === 'number' ? venta.Total : subtotal + iva;
                              return (
                                <>
                                  <CurrencyValue
                                    value={total}
                                    originalCurrency={venta.Moneda || 'CRC'}
                                    showOriginal={venta.Moneda && venta.Moneda !== monedaSeleccionada}
                                    className="fw-bold"
                                    showSymbol={true}
                                  />
                                  <small className="d-block text-muted">
                                    Sub: <CurrencyValue
                                      value={subtotal}
                                      originalCurrency={venta.Moneda || 'CRC'}
                                      showSymbol={true}
                                    />
                                  </small>
                                  <small className="d-block text-muted">
                                    IVA: <CurrencyValue
                                      value={iva}
                                      originalCurrency={venta.Moneda || 'CRC'}
                                      showSymbol={true}
                                    />
                                  </small>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="cell-tight text-center">
                          <div className="d-flex gap-1 justify-content-center flex-wrap" role="group" aria-label="Acciones de la venta">
                            {/* Botón Ver Detalles */}
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => openDetalleModal(venta)}
                              title="Ver Detalles"
                              aria-label="Ver detalles de la venta"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {/* Botón Descargar PDF */}
                            {venta.Numero_Factura && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleDescargarPDF(venta.ID_Venta)}
                                disabled={downloadingPDF === venta.ID_Venta}
                                title="Descargar Factura PDF"
                                aria-label="Descargar factura en PDF"
                              >
                                {downloadingPDF === venta.ID_Venta ? (
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                  <i className="bi bi-file-pdf"></i>
                                )}
                              </button>
                            )}
                            {/* Botón Editar */}
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openModal(venta)}
                              title="Editar"
                              aria-label="Editar venta"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            {/* Botón Eliminar */}
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

      <VentaDetalleModal
        venta={detalleModalState.venta}
        isOpen={detalleModalState.isOpen}
        onClose={closeDetalleModal}
      />
    </div>
  );
}
