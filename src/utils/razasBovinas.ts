/**
 * Lista de razas bovinas más comunes
 * Incluye razas para carne, leche y doble propósito
 */

export interface RazaBovina {
  nombre: string;
  categoria: 'Carne' | 'Leche' | 'Doble Propósito';
  origen: string;
}

export const razasBovinas: RazaBovina[] = [
  // Razas de Carne
  { nombre: 'Angus', categoria: 'Carne', origen: 'Escocia' },
  { nombre: 'Hereford', categoria: 'Carne', origen: 'Inglaterra' },
  { nombre: 'Charolais', categoria: 'Carne', origen: 'Francia' },
  { nombre: 'Limousin', categoria: 'Carne', origen: 'Francia' },
  { nombre: 'Brahman', categoria: 'Carne', origen: 'Estados Unidos' },
  { nombre: 'Nelore', categoria: 'Carne', origen: 'Brasil' },
  { nombre: 'Brangus', categoria: 'Carne', origen: 'Estados Unidos' },
  { nombre: 'Santa Gertrudis', categoria: 'Carne', origen: 'Estados Unidos' },
  { nombre: 'Beefmaster', categoria: 'Carne', origen: 'Estados Unidos' },
  { nombre: 'Chianina', categoria: 'Carne', origen: 'Italia' },
  { nombre: 'Blonde d\'Aquitaine', categoria: 'Carne', origen: 'Francia' },
  { nombre: 'Maine-Anjou', categoria: 'Carne', origen: 'Francia' },
  { nombre: 'Gelbvieh', categoria: 'Carne', origen: 'Alemania' },
  { nombre: 'Wagyu', categoria: 'Carne', origen: 'Japón' },

  // Razas de Leche
  { nombre: 'Holstein', categoria: 'Leche', origen: 'Holanda' },
  { nombre: 'Jersey', categoria: 'Leche', origen: 'Jersey' },
  { nombre: 'Guernsey', categoria: 'Leche', origen: 'Guernsey' },
  { nombre: 'Ayrshire', categoria: 'Leche', origen: 'Escocia' },
  { nombre: 'Pardo Suizo', categoria: 'Leche', origen: 'Suiza' },
  { nombre: 'Shorthorn Lechero', categoria: 'Leche', origen: 'Inglaterra' },

  // Razas de Doble Propósito
  { nombre: 'Simmental', categoria: 'Doble Propósito', origen: 'Suiza' },
  { nombre: 'Shorthorn', categoria: 'Doble Propósito', origen: 'Inglaterra' },
  { nombre: 'Devon', categoria: 'Doble Propósito', origen: 'Inglaterra' },
  { nombre: 'Red Poll', categoria: 'Doble Propósito', origen: 'Inglaterra' },
  { nombre: 'Senepol', categoria: 'Doble Propósito', origen: 'Islas Vírgenes' },
  { nombre: 'Pinzgauer', categoria: 'Doble Propósito', origen: 'Austria' },

  // Razas Criollas y Adaptadas
  { nombre: 'Criollo', categoria: 'Doble Propósito', origen: 'América Latina' },
  { nombre: 'Romosinuano', categoria: 'Carne', origen: 'Colombia' },
  { nombre: 'Blanco Orejinegro (BON)', categoria: 'Doble Propósito', origen: 'Colombia' },
  { nombre: 'Costeño con Cuernos', categoria: 'Doble Propósito', origen: 'Colombia' },
  { nombre: 'Sanmartinero', categoria: 'Carne', origen: 'Colombia' },
  { nombre: 'Lucerna', categoria: 'Doble Propósito', origen: 'Colombia' },
  { nombre: 'Hartón del Valle', categoria: 'Doble Propósito', origen: 'Colombia' },

  // Razas Cebuínas
  { nombre: 'Gyr', categoria: 'Leche', origen: 'India' },
  { nombre: 'Guzerat', categoria: 'Doble Propósito', origen: 'India' },
  { nombre: 'Indubrasil', categoria: 'Carne', origen: 'Brasil' },
  { nombre: 'Tabapuã', categoria: 'Carne', origen: 'Brasil' },
  { nombre: 'Sindi', categoria: 'Leche', origen: 'Pakistán' },

  // Otras razas importantes
  { nombre: 'Mixtec', categoria: 'Doble Propósito', origen: 'México' },
  { nombre: 'Otra', categoria: 'Doble Propósito', origen: 'Especificar' },
];

/**
 * Obtiene la lista de nombres de razas ordenada alfabéticamente
 */
export const getRazasNombres = (): string[] => {
  return razasBovinas
    .map(raza => raza.nombre)
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
};

/**
 * Obtiene las razas agrupadas por categoría
 */
export const getRazasPorCategoria = () => {
  const grouped = razasBovinas.reduce((acc, raza) => {
    if (!acc[raza.categoria]) {
      acc[raza.categoria] = [];
    }
    acc[raza.categoria].push(raza.nombre);
    return acc;
  }, {} as Record<string, string[]>);

  // Ordenar cada categoría alfabéticamente
  Object.keys(grouped).forEach(categoria => {
    grouped[categoria].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  });

  return grouped;
};

/**
 * Busca una raza por nombre (búsqueda flexible)
 */
export const buscarRaza = (termino: string): RazaBovina[] => {
  const terminoLower = termino.toLowerCase();
  return razasBovinas.filter(raza => 
    raza.nombre.toLowerCase().includes(terminoLower) ||
    raza.categoria.toLowerCase().includes(terminoLower) ||
    raza.origen.toLowerCase().includes(terminoLower)
  );
};


