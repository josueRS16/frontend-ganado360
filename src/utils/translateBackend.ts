import type { TFunction } from 'i18next';

type MapRecord = Record<string, Record<string, string>>;

/**
 * Mapas por campo: backend value -> i18n key
 * Añade aquí los campos/valores que tu API retorna (sexo, estado, categoria, tipo, etc).
 */
export const backendMappings: MapRecord = {
  sexo: { M: 'sexo_m', F: 'sexo_f', m: 'sexo_m', f: 'sexo_f' },
  estado: { activo: 'estado_activo', inactivo: 'estado_inactivo', vendido: 'estado_vendido' },
  // ejemplo categoría por id (ajusta según tu API)
  categoria: { '1': 'categoria_1', '2': 'categoria_2' }
};

/**
 * Traduce un valor proveniente del backend usando t() y los mapas definidos.
 * Si no hay map, intenta t(value) (útil si value ya es clave) o devuelve value.
 */
export function translateBackendValue(field: string, value: any, t: TFunction): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const map = backendMappings[field];
  if (map && map[str]) return t(map[str]);
  // si value ya es una clave i18n, devolver t(str), si no existe fallback al propio value
  const translated = t(str);
  if (translated !== str) return translated;
  return str;
}