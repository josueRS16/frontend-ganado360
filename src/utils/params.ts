/**
 * Construye URLSearchParams omitiendo valores undefined, null o string vacío
 */
export function buildParams<T extends Record<string, any>>(obj: T): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params;
}

/**
 * Convierte URLSearchParams a objeto
 */
export function parseParams(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

/**
 * Formatea fecha a YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parsea fecha desde string YYYY-MM-DD
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z');
}
