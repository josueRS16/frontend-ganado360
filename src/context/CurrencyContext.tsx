import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Moneda } from '../types/api';
import { 
  getTipoCambio, 
  setTipoCambio, 
  updateTipoCambio,
  initializeTipoCambio,
  mostrarEjemplosConversion,
  formatearMoneda,
  formatearMonedaConConversion,
  convertirMoneda,
  getSimboloMoneda,
  getNombreMoneda,
  calcularTipoCambio,
  formatearTipoCambio
} from '../utils/currencyUtils';

interface CurrencyContextType {
  // Estado de moneda seleccionada
  monedaSeleccionada: Moneda;
  setMonedaSeleccionada: (moneda: Moneda) => void;
  
  // Tipos de cambio
  tiposCambio: Record<Moneda, number>;
  actualizarTipoCambio: (moneda: Moneda, tasa: number) => void;
  actualizarTodosTiposCambio: (tipos: Record<Moneda, number>) => void;
  
  // Utilidades de formateo
  formatearValor: (valor: number | string, mostrarSimbolo?: boolean) => string;
  formatearValorConConversion: (
    valor: number | string, 
    monedaValor: Moneda, 
    mostrarSimbolo?: boolean
  ) => string;
  
  // Utilidades de conversión
  convertirValor: (valor: number, monedaOrigen: Moneda, monedaDestino: Moneda) => number;
  obtenerTipoCambio: (monedaOrigen: Moneda, monedaDestino: Moneda) => number;
  formatearTipoCambioTexto: (monedaOrigen: Moneda, monedaDestino: Moneda) => string;
  
  // Información de moneda
  obtenerSimbolo: (moneda: Moneda) => string;
  obtenerNombre: (moneda: Moneda) => string;
  
  // Estado de carga
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [monedaSeleccionada, setMonedaSeleccionadaState] = useState<Moneda>('CRC');
  const [tiposCambio, setTiposCambio] = useState<Record<Moneda, number>>({ CRC: 1, USD: 500 });
  const [isLoading, setIsLoading] = useState(false);

  // Cargar configuración inicial
  useEffect(() => {
    const cargarConfiguracion = () => {
      setIsLoading(true);
      
      try {
        // Cargar moneda seleccionada desde localStorage
        const monedaGuardada = localStorage.getItem('ganado360_moneda_seleccionada') as Moneda;
        if (monedaGuardada && (monedaGuardada === 'CRC' || monedaGuardada === 'USD')) {
          setMonedaSeleccionadaState(monedaGuardada);
        }

        // Cargar tipos de cambio
        const tiposCargados = getTipoCambio();
        setTiposCambio(tiposCargados);
        
        // Si no hay tipos de cambio guardados, inicializar con los valores por defecto
        if (!localStorage.getItem('ganado360_tipo_cambio')) {
          initializeTipoCambio();
        }
        
        // Mostrar ejemplos de conversión en consola (solo en desarrollo)
        if (import.meta.env.DEV) {
          setTimeout(() => mostrarEjemplosConversion(), 1000);
        }
      } catch (error) {
        console.warn('Error al cargar configuración de moneda:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarConfiguracion();
  }, []);

  // Función para cambiar moneda seleccionada
  const setMonedaSeleccionada = (moneda: Moneda) => {
    setMonedaSeleccionadaState(moneda);
    localStorage.setItem('ganado360_moneda_seleccionada', moneda);
  };

  // Función para actualizar tipo de cambio individual
  const actualizarTipoCambio = (moneda: Moneda, tasa: number) => {
    const nuevosTipos = { ...tiposCambio, [moneda]: tasa };
    setTiposCambio(nuevosTipos);
    updateTipoCambio(moneda, tasa);
  };

  // Función para actualizar todos los tipos de cambio
  const actualizarTodosTiposCambio = (tipos: Record<Moneda, number>) => {
    setTiposCambio(tipos);
    setTipoCambio(tipos);
  };

  // Función para formatear valor en la moneda seleccionada
  const formatearValor = (valor: number | string, mostrarSimbolo: boolean = true) => {
    return formatearMoneda(valor, monedaSeleccionada, mostrarSimbolo);
  };

  // Función para formatear valor con conversión automática
  const formatearValorConConversion = (
    valor: number | string, 
    monedaValor: Moneda, 
    mostrarSimbolo: boolean = true
  ) => {
    return formatearMonedaConConversion(valor, monedaValor, monedaSeleccionada, mostrarSimbolo);
  };

  // Función para convertir valor entre monedas
  const convertirValor = (valor: number, monedaOrigen: Moneda, monedaDestino: Moneda) => {
    return convertirMoneda(valor, monedaOrigen, monedaDestino);
  };

  // Función para obtener tipo de cambio entre monedas
  const obtenerTipoCambio = (monedaOrigen: Moneda, monedaDestino: Moneda) => {
    return calcularTipoCambio(monedaOrigen, monedaDestino);
  };

  // Función para formatear tipo de cambio como texto
  const formatearTipoCambioTexto = (monedaOrigen: Moneda, monedaDestino: Moneda) => {
    return formatearTipoCambio(monedaOrigen, monedaDestino);
  };

  // Función para obtener símbolo de moneda
  const obtenerSimbolo = (moneda: Moneda) => {
    return getSimboloMoneda(moneda);
  };

  // Función para obtener nombre de moneda
  const obtenerNombre = (moneda: Moneda) => {
    return getNombreMoneda(moneda);
  };

  const value: CurrencyContextType = {
    monedaSeleccionada,
    setMonedaSeleccionada,
    tiposCambio,
    actualizarTipoCambio,
    actualizarTodosTiposCambio,
    formatearValor,
    formatearValorConConversion,
    convertirValor,
    obtenerTipoCambio,
    formatearTipoCambioTexto,
    obtenerSimbolo,
    obtenerNombre,
    isLoading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook para usar el contexto de moneda
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency debe ser usado dentro de un CurrencyProvider');
  }
  return context;
}

// Hook simplificado para formateo rápido
export function useCurrencyFormat() {
  const { formatearValor, formatearValorConConversion, monedaSeleccionada, obtenerSimbolo } = useCurrency();
  
  return {
    format: formatearValor,
    formatWithConversion: formatearValorConConversion,
    currentCurrency: monedaSeleccionada,
    getSymbol: obtenerSimbolo
  };
}
