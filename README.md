# 🐄 Ganado 360 - Sistema de Gestión de Ganado

Frontend moderno para el sistema de gestión de ganado construido con React, TypeScript, Bootstrap 5 y React Query.

## 🚀 Características

- **Dashboard Intuitivo**: Resumen visual con métricas clave del ganado
- **Gestión de Animales**: CRUD completo con filtros avanzados
- **Seguimiento Veterinario**: Historial médico y recordatorios
- **Gestión de Ventas**: Registro y seguimiento de transacciones
- **Sistema de Roles y Usuarios**: Control de acceso
- **Responsive Design**: Optimizado para móviles y escritorio
- **Tema Claro/Oscuro**: Interfaz adaptable
- **Búsqueda y Filtros**: Filtros por categoría, sexo, fechas
- **Notificaciones Toast**: Feedback visual de operaciones

## 🛠️ Stack Tecnológico

- **React 18+** con **TypeScript**
- **Vite** como bundler
- **React Router v6** para navegación
- **React Query (TanStack Query)** para estado del servidor
- **Bootstrap 5** para estilos (exclusivamente)
- **Axios** para llamadas HTTP

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # Navbar, Sidebar, Layout principal
│   ├── ui/              # Componentes Bootstrap reutilizables
│   ├── tables/          # Tablas responsivas
│   └── forms/           # Formularios con validaciones
├── pages/               # Páginas principales
├── services/            # Servicios Axios por recurso
├── hooks/               # Hooks de React Query y utilidades
├── types/               # Tipos TypeScript
├── utils/               # Utilidades (params, fechas)
└── context/             # Context para toasts y tema
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Backend del sistema de ganado ejecutándose en `localhost:3000`

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd ganado360-react-vite
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 🌐 Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api
```

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Vista previa de producción
npm run preview

# Linting
npm run lint
```

## 🔗 Endpoints del Backend

El frontend está diseñado para conectarse con los siguientes endpoints:

### Animales
- `GET /animales` - Lista con filtros
- `GET /animales/:id` - Detalle individual
- `POST /animales` - Crear nuevo
- `PUT /animales/:id` - Actualizar
- `DELETE /animales/:id` - Eliminar

### Categorías
- `GET /categorias` - Lista completa
- `POST /categorias` - Crear categoría
- `PUT /categorias/:id` - Actualizar
- `DELETE /categorias/:id` - Eliminar

### Roles y Usuarios
- Gestión completa de roles de usuario
- CRUD de usuarios con asignación de roles

### Recordatorios
- `GET /recordatorios` - Con filtros por animal/fechas
- Gestión completa de recordatorios veterinarios

### Historial Veterinario
- Registro de eventos médicos
- Seguimiento de tratamientos

### Ventas
- Registro de transacciones
- Filtros por período y animal

## 🎨 Características de UI/UX

### Layout Responsivo
- **Navbar** superior con búsqueda y acciones rápidas
- **Sidebar** colapsable (offcanvas en móvil)
- **Dashboard** con cards de métricas y gráficos
- **Tablas** responsivas con paginación y filtros

### Componentes Bootstrap
- Formularios con validación nativa HTML5
- Modales para crear/editar entidades
- Toasts para notificaciones
- Cards y badges para información visual
- Botones y dropdowns para acciones

### Estados de la Aplicación
- **Loading**: Spinners durante carga de datos
- **Error**: Mensajes de error con opciones de reintento
- **Empty**: Estados vacíos con acciones sugeridas
- **Success**: Confirmaciones de operaciones exitosas

## 🔍 Filtros y Búsqueda

### Animales
- Filtro por categoría (dropdown)
- Filtro por sexo (Macho/Hembra)
- Rango de fechas de ingreso
- Los filtros se reflejan en la URL

### Query Parameters
Los filtros se sincronizan con la URL:
```
/animales?ID_Categoria=1&Sexo=Hembra&fechaIngresoDesde=2024-01-01
```

## 🔧 Configuración Avanzada

### React Query
- Cache de 5 minutos para queries
- Retry automático en caso de fallo
- Invalidación inteligente de cache

### Axios Interceptors
- Logging de requests/responses
- Manejo centralizado de errores
- Transformación de errores HTTP

### TypeScript
- Tipado estricto para API responses
- Interfaces para todas las entidades
- Validación de tipos en tiempo de compilación

## 📱 Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Móviles, tablets, escritorio
- **Resoluciones**: 320px - 4K+

## 🚨 Manejo de Errores

- Errores de red: Reintento automático
- Errores 404: Redirección a página de error
- Errores de validación: Mensajes contextuales
- Errores del servidor: Toast con mensaje descriptivo

## 🔄 Estado de Desarrollo

### ✅ Completado
- Dashboard principal con métricas
- Gestión de animales con filtros
- CRUD de categorías y roles
- Sistema de toasts y notificaciones
- Layout responsivo con tema claro/oscuro
- Integración completa con React Query

### 🚧 En Desarrollo
- Formularios de creación/edición de animales
- Páginas de historial veterinario
- Gestión de recordatorios
- Páginas de usuarios y ventas
- Reportes y exportación de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@ganado360.com
- GitHub Issues: [Crear issue](https://github.com/usuario/ganado360-react-vite/issues)

---

**¡Gestiona tu ganado de forma inteligente con Ganado 360! 🐄✨**