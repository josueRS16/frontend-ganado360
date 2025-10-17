import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const saved = (localStorage.getItem('app_lang') as 'es' | 'en' | null) ?? null;
const defaultLang = saved ?? 'es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
            app_name: 'Ganado360',
          app_subtitle: 'Sistema de Gestión Ganadera',
          abrir_menu: 'Abrir menú de navegación',
          recordatorios: 'Recordatorios',
          acciones_rapidas: 'Acciones Rápidas',
          gestionar_animales: 'Gestionar Animales',
          ver_y_editar_ganado: 'Ver y editar ganado',
          registrar_venta: 'Registrar Venta',
          nueva_transaccion: 'Nueva transacción',
          ver_recordatorios: 'Ver Recordatorios',
          proximas_tareas: 'Próximas tareas',
          gestionar_usuarios: 'Gestionar Usuarios',
          administracion: 'Administración',
          cerrar_sesion: 'Cerrar sesión',
          cambiar_a_ingles: 'Cambiar a inglés',
          cambiar_a_espanol: 'Cambiar a español',
          dashboard: 'Inicio',
          animales: 'Animales',
          ventas: 'Ventas',
          categorias: 'Categorías',
          editar: 'Editar',
          eliminar: 'Eliminar',
          guardar: 'Guardar'
        }
      },
      en: {
        translation: {
          app_name: 'Ganado360',
          app_subtitle: 'Livestock Management System',
          abrir_menu: 'Open navigation menu',
          recordatorios: 'Reminders',
          acciones_rapidas: 'Quick Actions',
          gestionar_animales: 'Manage Animals',
          ver_y_editar_ganado: 'View and edit livestock',
          registrar_venta: 'Register Sale',
          nueva_transaccion: 'New transaction',
          ver_recordatorios: 'View Reminders',
          proximas_tareas: 'Upcoming tasks',
          gestionar_usuarios: 'Manage Users',
          administracion: 'Administration',
          cerrar_sesion: 'Logout',
          cambiar_a_ingles: 'Switch to English',
          cambiar_a_espanol: 'Switch to Spanish'
        }
      }
    },
    lng: defaultLang,
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  });

// Mantener <html lang="..."> sincronizado
document.documentElement.lang = i18n.language;

export default i18n;
