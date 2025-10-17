/**
 * Lee scripts/jsx-strings.json y genera:
 *  - scripts/i18n-map.json : { "Original Text": "key_name", ... }
 *  - src/i18n.ts : i18n config con ES y EN (EN usa mapeo automático limitado)
 *
 * Ejecutar:
 *   node scripts/generate-i18n-from-json.js
 *
 * Nota: EN se genera con un diccionario básico; revisa y ajusta src/i18n.ts después.
 */
const fs = require('fs-extra');
const path = require('path');

const SRC = path.join(process.cwd(), 'src');
const JSON_IN = path.join(process.cwd(), 'scripts', 'jsx-strings.json');
const MAP_OUT = path.join(process.cwd(), 'scripts', 'i18n-map.json');
const I18N_OUT = path.join(process.cwd(), 'src', 'i18n.ts');

if (!fs.existsSync(JSON_IN)) {
  console.error('No se encontró', JSON_IN, 'ejecuta primero extract-jsx-strings.js');
  process.exit(1);
}

// Basic EN dictionary for common terms (amplía según sea necesario)
const DICT = {
  'Ganado360': 'Ganado360',
  'Sistema de Gestión Ganadera': 'Livestock Management System',
  'Ventas': 'Sales',
  'Animales': 'Animals',
  'Recordatorios': 'Reminders',
  'Acciones Rápidas': 'Quick Actions',
  'Gestionar Animales': 'Manage Animals',
  'Ver y editar ganado': 'View and edit livestock',
  'Registrar Venta': 'Register Sale',
  'Nueva transacción': 'New transaction',
  'Ver Recordatorios': 'View Reminders',
  'Próximas tareas': 'Upcoming tasks',
  'Gestionar Usuarios': 'Manage Users',
  'Administración': 'Administration',
  'Cerrar sesión': 'Logout',
  'Cambiar a inglés': 'Switch to English',
  'Cambiar a español': 'Switch to Spanish',
  'Confirmar': 'Confirm',
  'Cancelar': 'Cancel',
  'Editar': 'Edit',
  'Eliminar': 'Delete',
  'Guardar': 'Save',
  'Nuevo': 'New',
  'Nombre': 'Name',
  'Sexo': 'Sex',
  'Categoría': 'Category',
  'Fecha de nacimiento': 'Birth date',
  'Acciones': 'Actions',
  'Buscar': 'Search',
  'Sin registros': 'No records'
};

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 60);
}

(async () => {
  const data = await fs.readJson(JSON_IN);
  const flat = {};
  Object.keys(data).forEach(file => {
    data[file].forEach(item => {
      flat[item.text] = true;
    });
  });
  const originals = Object.keys(flat).sort();

  const map = {};
  const esRes = {};
  const enRes = {};

  originals.forEach(txt => {
    let keyBase = slugify(txt) || 'key';
    let key = keyBase;
    let i = 1;
    while (Object.values(map).indexOf(key) !== -1) {
      key = `${keyBase}_${i++}`;
    }
    map[txt] = key;
    esRes[key] = txt;
    enRes[key] = DICT[txt] || txt; // fallback: same text (revisa después)
  });

  await fs.writeJson(MAP_OUT, map, { spaces: 2 });
  console.log('Wrote', MAP_OUT);

  // Generate src/i18n.ts
  const i18nTs = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const saved = (localStorage.getItem('app_lang') as 'es' | 'en' | null) ?? null;
const defaultLang = saved ?? 'es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: ${JSON.stringify(esRes, null, 2)}
      },
      en: {
        translation: ${JSON.stringify(enRes, null, 2)}
      }
    },
    lng: defaultLang,
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  });

document.documentElement.lang = i18n.language;

export default i18n;
`;

  await fs.writeFile(I18N_OUT, i18nTs, 'utf8');
  console.log('Wrote', I18N_OUT);
})();