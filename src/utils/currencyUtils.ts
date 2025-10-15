import type { Moneda } from '../types/api';

// Configuración de monedas
export const MONEDAS = {
  CRC: {
    codigo: 'CRC' as Moneda,
    nombre: 'Colón Costarricense',
    simbolo: '₡',
    locale: 'es-CR',
    decimales: 2
  },
  USD: {
    codigo: 'USD' as Moneda,
    nombre: 'Dólar Estadounidense',
    simbolo: '$',
    locale: 'en-US',
    decimales: 2
  }
} as const;

// Tipo de cambio por defecto (se puede actualizar desde API o configuración)
// 1 USD = 500 CRC (Colones Costarricenses)
const TIPO_CAMBIO_DEFAULT: Record<Moneda, number> = {
  CRC: 1, // Moneda base
  USD: 500 // 1 USD = 500 CRC
};

// Almacenamiento local para tipo de cambio
const TIPO_CAMBIO_KEY = 'ganado360_tipo_cambio';

/**
 * Obtiene el tipo de cambio actual desde localStorage o usa el por defecto
 */
export function getTipoCambio(): Record<Moneda, number> {
  try {
    const stored = localStorage.getItem(TIPO_CAMBIO_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validar que tenga las monedas necesarias
      if (parsed.CRC && parsed.USD) {
        // Si el tipo de cambio de USD es diferente al nuevo por defecto, actualizarlo
        if (parsed.USD !== TIPO_CAMBIO_DEFAULT.USD) {
          console.log(`Actualizando tipo de cambio de USD de ${parsed.USD} a ${TIPO_CAMBIO_DEFAULT.USD}`);
          const updated = { ...parsed, USD: TIPO_CAMBIO_DEFAULT.USD };
          setTipoCambio(updated);
          return updated;
        }
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error al cargar tipo de cambio desde localStorage:', error);
  }
  
  return TIPO_CAMBIO_DEFAULT;
}

/**
 * Guarda el tipo de cambio en localStorage
 */
export function setTipoCambio(tipoCambio: Record<Moneda, number>): void {
  try {
    localStorage.setItem(TIPO_CAMBIO_KEY, JSON.stringify(tipoCambio));
  } catch (error) {
    console.warn('Error al guardar tipo de cambio en localStorage:', error);
  }
}

/**
 * Actualiza el tipo de cambio para una moneda específica
 */
export function updateTipoCambio(moneda: Moneda, tasa: number): void {
  const current = getTipoCambio();
  current[moneda] = tasa;
  setTipoCambio(current);
}

/**
 * Inicializa el tipo de cambio con los valores por defecto
 */
export function initializeTipoCambio(): void {
  setTipoCambio(TIPO_CAMBIO_DEFAULT);
  console.log('Tipo de cambio inicializado:', TIPO_CAMBIO_DEFAULT);
}

/**
 * Convierte un valor de una moneda a otra
 */
export function convertirMoneda(
  valor: number, 
  monedaOrigen: Moneda, 
  monedaDestino: Moneda
): number {
  if (monedaOrigen === monedaDestino) {
    return valor;
  }

  const tipoCambio = getTipoCambio();
  
  // Convertir a CRC primero (moneda base)
  let valorEnCRC: number;
  if (monedaOrigen === 'CRC') {
    valorEnCRC = valor;
  } else {
    // Si el origen es USD, multiplicar por el tipo de cambio para obtener CRC
    valorEnCRC = valor * tipoCambio[monedaOrigen];
  }

  // Convertir de CRC a moneda destino
  if (monedaDestino === 'CRC') {
    return Math.round(valorEnCRC * 100) / 100; // Redondear a 2 decimales
  } else {
    // Si el destino es USD, dividir por el tipo de cambio
    const resultado = valorEnCRC / tipoCambio[monedaDestino];
    return Math.round(resultado * 100) / 100; // Redondear a 2 decimales
  }
}

/**
 * Formatea un valor monetario según la moneda especificada
 */
export function formatearMoneda(
  valor: number | string, 
  moneda: Moneda = 'CRC',
  mostrarSimbolo: boolean = true
): string {
  const numValue = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numValue)) {
    return mostrarSimbolo ? `${MONEDAS[moneda].simbolo}0.00` : '0.00';
  }

  const config = MONEDAS[moneda];
  const formatted = numValue.toLocaleString(config.locale, {
    minimumFractionDigits: config.decimales,
    maximumFractionDigits: config.decimales
  });

  return mostrarSimbolo ? `${config.simbolo}${formatted}` : formatted;
}

/**
 * Formatea un valor monetario con conversión automática
 * Si el valor está en una moneda diferente a la solicitada, lo convierte
 */
export function formatearMonedaConConversion(
  valor: number | string,
  monedaValor: Moneda,
  monedaMostrar: Moneda,
  mostrarSimbolo: boolean = true
): string {
  const numValue = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numValue)) {
    return formatearMoneda(0, monedaMostrar, mostrarSimbolo);
  }

  const valorConvertido = convertirMoneda(numValue, monedaValor, monedaMostrar);
  return formatearMoneda(valorConvertido, monedaMostrar, mostrarSimbolo);
}

/**
 * Obtiene el símbolo de una moneda
 */
export function getSimboloMoneda(moneda: Moneda): string {
  return MONEDAS[moneda].simbolo;
}

/**
 * Obtiene el nombre completo de una moneda
 */
export function getNombreMoneda(moneda: Moneda): string {
  return MONEDAS[moneda].nombre;
}

/**
 * Valida si una moneda es válida
 */
export function esMonedaValida(moneda: string): moneda is Moneda {
  return moneda === 'CRC' || moneda === 'USD';
}

/**
 * Obtiene todas las monedas disponibles
 */
export function getMonedasDisponibles() {
  return Object.values(MONEDAS);
}

/**
 * Hook para obtener información de moneda (para usar en componentes)
 */
export function useMonedaInfo(moneda: Moneda) {
  return {
    simbolo: MONEDAS[moneda].simbolo,
    nombre: MONEDAS[moneda].nombre,
    locale: MONEDAS[moneda].locale,
    decimales: MONEDAS[moneda].decimales
  };
}

/**
 * Calcula el tipo de cambio entre dos monedas
 */
export function calcularTipoCambio(monedaOrigen: Moneda, monedaDestino: Moneda): number {
  if (monedaOrigen === monedaDestino) {
    return 1;
  }

  const tipoCambio = getTipoCambio();
  
  if (monedaOrigen === 'CRC') {
    return 1 / tipoCambio[monedaDestino];
  } else if (monedaDestino === 'CRC') {
    return tipoCambio[monedaOrigen];
  } else {
    // Conversión entre monedas no base
    return tipoCambio[monedaOrigen] / tipoCambio[monedaDestino];
  }
}

/**
 * Formatea el tipo de cambio para mostrar
 */
export function formatearTipoCambio(
  monedaOrigen: Moneda, 
  monedaDestino: Moneda
): string {
  if (monedaOrigen === monedaDestino) {
    return '1.00';
  }

  const tasa = calcularTipoCambio(monedaOrigen, monedaDestino);
  return `1 ${monedaOrigen} = ${tasa.toFixed(4)} ${monedaDestino}`;
}

/**
 * Muestra ejemplos de conversión con el tipo de cambio actual
 */
export function mostrarEjemplosConversion(): void {
  const tipoCambio = getTipoCambio();
  console.log('=== Ejemplos de Conversión de Moneda ===');
  console.log(`Tipo de cambio actual: 1 USD = ${tipoCambio.USD} CRC`);
  console.log('');
  
  // Ejemplos de conversión
  const ejemplos = [
    { valor: 100, moneda: 'USD' as Moneda, descripcion: '$100 USD' },
    { valor: 50000, moneda: 'CRC' as Moneda, descripcion: '₡50,000 CRC' },
    { valor: 1000, moneda: 'USD' as Moneda, descripcion: '$1,000 USD' },
    { valor: 250000, moneda: 'CRC' as Moneda, descripcion: '₡250,000 CRC' },
    { valor: 1500, moneda: 'USD' as Moneda, descripcion: '$1,500 USD' }
  ];

  ejemplos.forEach(ejemplo => {
    const convertido = convertirMoneda(ejemplo.valor, ejemplo.moneda, ejemplo.moneda === 'USD' ? 'CRC' : 'USD');
    const simboloDestino = ejemplo.moneda === 'USD' ? '₡' : '$';
    console.log(`${ejemplo.descripcion} → ${simboloDestino}${convertido.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  });
  
  console.log('');
  console.log('=== Caso Específico: $1,500 USD ===');
  const valor1500USD = 1500;
  const convertido1500 = convertirMoneda(valor1500USD, 'USD', 'CRC');
  console.log(`$1,500 USD → ₡${convertido1500.toLocaleString('en-US', { minimumFractionDigits: 2 })} CRC`);
  console.log(`Verificación: ${valor1500USD} × ${tipoCambio.USD} = ${valor1500USD * tipoCambio.USD}`);
  console.log('==========================================');
}
