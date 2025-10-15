import { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { getMonedasDisponibles } from '../../utils/currencyUtils';
import type { Moneda } from '../../types/api';

interface CurrencySelectorProps {
  /** Moneda seleccionada actualmente */
  value: Moneda;
  /** Función que se ejecuta cuando cambia la moneda */
  onChange: (moneda: Moneda) => void;
  /** Si se debe mostrar información del tipo de cambio */
  showExchangeRate?: boolean;
  /** Si se debe mostrar el selector compacto (solo símbolos) */
  compact?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Si el selector está deshabilitado */
  disabled?: boolean;
  /** Placeholder para el selector */
  placeholder?: string;
  /** Si se debe mostrar el nombre completo de la moneda */
  showFullName?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  showExchangeRate = false,
  compact = false,
  className = '',
  disabled = false,
  showFullName = false
}: CurrencySelectorProps) {
  const { 
    formatearTipoCambioTexto
  } = useCurrency();
  
  const [isOpen, setIsOpen] = useState(false);
  const monedas = getMonedasDisponibles();

  const handleMonedaSelect = (moneda: Moneda) => {
    onChange(moneda);
    setIsOpen(false);
  };

  const monedaActual = monedas.find(m => m.codigo === value);
  const simboloActual = monedaActual?.simbolo || '₡';
  const nombreActual = monedaActual?.nombre || 'Colón Costarricense';

  if (compact) {
    return (
      <div className={`currency-selector-compact ${className}`}>
        <div className="d-flex align-items-center gap-2">
          {monedas.map((moneda) => (
            <button
              key={moneda.codigo}
              type="button"
              className={`btn btn-sm ${value === moneda.codigo ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleMonedaSelect(moneda.codigo)}
              disabled={disabled}
              title={moneda.nombre}
            >
              {moneda.simbolo}
            </button>
          ))}
        </div>
        {showExchangeRate && value !== 'CRC' && (
          <small className="text-muted d-block mt-1">
            {formatearTipoCambioTexto('CRC', value)}
          </small>
        )}
      </div>
    );
  }

  return (
    <div className={`currency-selector ${className}`}>
      <div className="dropdown">
        <button
          className="btn btn-outline-secondary dropdown-toggle w-100 d-flex align-items-center justify-content-between"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="d-flex align-items-center">
            <span className="me-2 fw-bold">{simboloActual}</span>
            {showFullName ? (
              <span>{nombreActual}</span>
            ) : (
              <span>{value}</span>
            )}
          </div>
        </button>
        
        {isOpen && (
          <div className="dropdown-menu show w-100" style={{ position: 'absolute', zIndex: 1050 }}>
            {monedas.map((moneda) => (
              <button
                key={moneda.codigo}
                className={`dropdown-item d-flex align-items-center justify-content-between ${
                  value === moneda.codigo ? 'active' : ''
                }`}
                type="button"
                onClick={() => handleMonedaSelect(moneda.codigo)}
              >
                <div className="d-flex align-items-center">
                  <span className="me-2 fw-bold">{moneda.simbolo}</span>
                  <div>
                    <div className="fw-semibold">{moneda.codigo}</div>
                    {showFullName && (
                      <small className="text-muted">{moneda.nombre}</small>
                    )}
                  </div>
                </div>
                {value === moneda.codigo && (
                  <i className="bi bi-check text-primary"></i>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {showExchangeRate && value !== 'CRC' && (
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-arrow-repeat me-1"></i>
            {formatearTipoCambioTexto('CRC', value)}
          </small>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar información de tipo de cambio
interface ExchangeRateInfoProps {
  monedaOrigen: Moneda;
  monedaDestino: Moneda;
  className?: string;
}

export function ExchangeRateInfo({ 
  monedaOrigen, 
  monedaDestino, 
  className = '' 
}: ExchangeRateInfoProps) {
  const { formatearTipoCambioTexto } = useCurrency();

  if (monedaOrigen === monedaDestino) {
    return null;
  }

  return (
    <div className={`exchange-rate-info ${className}`}>
      <small className="text-muted">
        <i className="bi bi-arrow-repeat me-1"></i>
        {formatearTipoCambioTexto(monedaOrigen, monedaDestino)}
      </small>
    </div>
  );
}

// Componente para mostrar valor con conversión automática
interface CurrencyValueProps {
  /** Valor a mostrar */
  value: number | string;
  /** Moneda del valor original */
  originalCurrency: Moneda;
  /** Si se debe mostrar el valor original también */
  showOriginal?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Si se debe mostrar el símbolo de moneda */
  showSymbol?: boolean;
}

export function CurrencyValue({
  value,
  originalCurrency,
  showOriginal = false,
  className = '',
  showSymbol = true
}: CurrencyValueProps) {
  const { 
    formatearValorConConversion, 
    formatearValor, 
    monedaSeleccionada
  } = useCurrency();

  const valorConvertido = formatearValorConConversion(value, originalCurrency, showSymbol);
  const valorOriginal = formatearValor(value, showSymbol);

  if (originalCurrency === monedaSeleccionada) {
    return (
      <span className={className}>
        {valorOriginal}
      </span>
    );
  }

  return (
    <div className={className}>
      <div className="fw-semibold">{valorConvertido}</div>
      {showOriginal && (
        <small className="text-muted">
          Original: {valorOriginal}
        </small>
      )}
    </div>
  );
}

// Componente para input de moneda con selector integrado
interface CurrencyInputProps {
  /** Valor del input */
  value: number;
  /** Función que se ejecuta cuando cambia el valor */
  onChange: (value: number) => void;
  /** Moneda seleccionada */
  currency: Moneda;
  /** Función que se ejecuta cuando cambia la moneda */
  onCurrencyChange: (currency: Moneda) => void;
  /** Placeholder del input */
  placeholder?: string;
  /** Si el input está deshabilitado */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Valor mínimo */
  min?: number;
  /** Valor máximo */
  max?: number;
  /** Paso del input */
  step?: number;
}

export function CurrencyInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  placeholder = '0.00',
  disabled = false,
  className = '',
  min,
  max,
  step = 0.01
}: CurrencyInputProps) {
  const { obtenerSimbolo } = useCurrency();
  const simbolo = obtenerSimbolo(currency);

  return (
    <div className={`currency-input ${className}`}>
      <div className="input-group">
        <span className="input-group-text fw-bold">{simbolo}</span>
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
        />
        <CurrencySelector
          value={currency}
          onChange={onCurrencyChange}
          compact={true}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
