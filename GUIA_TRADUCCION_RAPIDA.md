# 🚀 Guía Rápida de Traducción - Módulos Restantes

## Estado Actual
- ✅ Infraestructura i18n: 100%
- ✅ Claves de traducción: 100% definidas en JSON
- 🔄 Aplicación en componentes: En proceso

## Cambios Necesarios por Módulo

### Patrón General (Aplicar en TODOS los módulos)

#### 1. Agregar import
```typescript
import { useTranslation } from 'react-i18next';
```

#### 2. Declarar hook en componente principal
```typescript
export function NombreComponente() {
  const { t } = useTranslation();
  // resto del código...
}
```

#### 3. Declarar hook en modales/subcomponentes
```typescript
function Modal() {
  const { t } = useTranslation();
  // resto del código...
}
```

---

## 📝 RECORDATORIOS (`src/pages/Recordatorios.tsx`)

### Cambios Principales
- ✅ Import agregado
- ✅ Hook declarado en modal
- ✅ Hook declarado en componente principal
- 🔄 Falta aplicar en textos restantes

### Reemplazos Pendientes
```typescript
// Breadcrumb
{ label: 'Dashboard', path: '/' }  →  { label: t('dashboard.title'), path: '/' }
{ label: 'Recordatorios', active: true }  →  { label: t('reminders.title'), active: true }

// Título
"Recordatorios Automáticos"  →  t('reminders.title')

// Botones
"Nuevo Recordatorio"  →  t('reminders.newReminder')
"Filtros"  →  t('common.filter')
"Limpiar Filtros"  →  t('animals.buttons.clearFilters')

// Labels
"Título"  →  t('reminders.form.type')
"Descripción"  →  t('reminders.form.description')
"Fecha Programada"  →  t('reminders.form.scheduledDate')

// Tabla
"Animal"  →  t('reminders.table.animal')
"Título"  →  t('reminders.table.type')
"Fecha Programada"  →  t('reminders.table.scheduledDate')
"Acciones"  →  t('reminders.table.actions')

// Botones de tabla
"Completar"  →  t('reminders.complete')
"Editar"  →  t('common.edit')
"Eliminar"  →  t('common.delete')

// Mensajes
showToast('Recordatorio creado exitosamente')  →  showToast(t('reminders.messages.createSuccess'))
showToast('Recordatorio actualizado exitosamente')  →  showToast(t('reminders.messages.updateSuccess'))
showToast('Recordatorio eliminado exitosamente')  →  showToast(t('reminders.messages.deleteSuccess'))
```

---

## 📖 HISTORIAL VETERINARIO (`src/pages/Historial.tsx`)

### Cambios Necesarios

```typescript
// 1. Agregar import
import { useTranslation } from 'react-i18next';

// 2. En componente principal
export function Historial() {
  const { t } = useTranslation();

// 3. En modal
function HistorialModal() {
  const { t } = useTranslation();

// 4. Reemplazos clave
"Historial Veterinario"  →  t('history.title')
"Nuevo Evento"  →  t('history.newEvent')
"Editar Evento"  →  t('history.editEvent')
"Tipo de Evento"  →  t('history.form.eventType')
"Descripción"  →  t('history.form.description')
"Fecha de Aplicación"  →  t('history.form.applicationDate')
"Próxima Fecha"  →  t('history.form.nextDate')
"Realizado por"  →  t('history.form.performedBy')

// Tabla
"Tipo de Evento"  →  t('history.table.eventType')
"Fecha Aplicación"  →  t('history.table.applicationDate')
"Próxima Fecha"  →  t('history.table.nextDate')

// Mensajes
'Evento creado exitosamente'  →  t('history.messages.createSuccess')
'Evento actualizado exitosamente'  →  t('history.messages.updateSuccess')
'Evento eliminado exitosamente'  →  t('history.messages.deleteSuccess')
```

---

## 💰 VENTAS (`src/pages/Ventas.tsx`)

### Cambios Necesarios

```typescript
// Import y hooks
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos
"Ventas"  →  t('sales.title')
"Nueva Venta"  →  t('sales.newSale')
"Editar Venta"  →  t('sales.editSale')
"Comprador"  →  t('sales.form.buyer')
"Fecha de Venta"  →  t('sales.form.saleDate')
"Monto"  →  t('sales.form.amount')
"Método de Pago"  →  t('sales.form.paymentMethod')
"Ver Factura"  →  t('sales.viewInvoice')

// Tabla
"Comprador"  →  t('sales.table.buyer')
"Fecha de Venta"  →  t('sales.table.saleDate')
"Monto"  →  t('sales.table.amount')
"Método de Pago"  →  t('sales.table.paymentMethod')

// Mensajes
'Venta creada exitosamente'  →  t('sales.messages.createSuccess')
'Venta actualizada exitosamente'  →  t('sales.messages.updateSuccess')
'Venta eliminada exitosamente'  →  t('sales.messages.deleteSuccess')
```

---

## 🏷️ CATEGORÍAS (`src/pages/Categorias.tsx`)

### Cambios Necesarios

```typescript
// Import y hooks
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos
"Categorías"  →  t('categories.title')
"Nueva Categoría"  →  t('categories.newCategory')
"Editar Categoría"  →  t('categories.editCategory')
"Tipo"  →  t('categories.form.type')
"Descripción"  →  t('categories.form.description')

// Tabla
"Tipo"  →  t('categories.table.type')
"Descripción"  →  t('categories.table.description')
"Acciones"  →  t('categories.table.actions')

// Mensajes
'Categoría creada exitosamente'  →  t('categories.messages.createSuccess')
'Categoría actualizada exitosamente'  →  t('categories.messages.updateSuccess')
'Categoría eliminada exitosamente'  →  t('categories.messages.deleteSuccess')
```

---

## 🚩 ESTADOS (`src/pages/Estados.tsx`)

### Cambios Necesarios

```typescript
// Import y hooks
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos
"Estados"  →  t('states.title')
"Nuevo Estado"  →  t('states.newState')
"Editar Estado"  →  t('states.editState')
"Nombre"  →  t('states.form.name')
"Descripción"  →  t('states.form.description')

// Tabla
"Nombre"  →  t('states.table.name')
"Descripción"  →  t('states.table.description')
"Acciones"  →  t('states.table.actions')

// Mensajes
'Estado creado exitosamente'  →  t('states.messages.createSuccess')
'Estado actualizado exitosamente'  →  t('states.messages.updateSuccess')
'Estado eliminado exitosamente'  →  t('states.messages.deleteSuccess')
```

---

## 👥 ROLES (`src/pages/Roles.tsx`)

### Cambios Necesarios

```typescript
// Import y hooks
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos
"Roles"  →  t('roles.title')
"Nuevo Rol"  →  t('roles.newRole')
"Editar Rol"  →  t('roles.editRole')
"Nombre"  →  t('roles.form.name')
"Descripción"  →  t('roles.form.description')

// Tabla
"Nombre"  →  t('roles.table.name')
"Descripción"  →  t('roles.table.description')
"Acciones"  →  t('roles.table.actions')

// Mensajes
'Rol creado exitosamente'  →  t('roles.messages.createSuccess')
'Rol actualizado exitosamente'  →  t('roles.messages.updateSuccess')
'Rol eliminado exitosamente'  →  t('roles.messages.deleteSuccess')
```

---

## 👤 USUARIOS (`src/pages/Usuarios.tsx`)

### Cambios Necesarios

```typescript
// Import y hooks
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos
"Usuarios"  →  t('users.title')
"Nuevo Usuario"  →  t('users.newUser')
"Editar Usuario"  →  t('users.editUser')
"Nombre"  →  t('users.form.name')
"Correo"  →  t('users.form.email')
"Contraseña"  →  t('users.form.password')
"Rol"  →  t('users.form.role')

// Tabla
"Nombre"  →  t('users.table.name')
"Correo"  →  t('users.table.email')
"Rol"  →  t('users.table.role')
"Acciones"  →  t('users.table.actions')

// Mensajes
'Usuario creado exitosamente'  →  t('users.messages.createSuccess')
'Usuario actualizado exitosamente'  →  t('users.messages.updateSuccess')
'Usuario eliminado exitosamente'  →  t('users.messages.deleteSuccess')
```

---

## ✅ Checklist de Verificación

Para cada módulo, verificar:

- [ ] Import de `useTranslation` agregado
- [ ] Hook declarado en componente principal
- [ ] Hook declarado en modales/subcomponentes
- [ ] Breadcrumb traducido
- [ ] Título principal traducido
- [ ] Botones traducidos
- [ ] Labels de formulario traducidos
- [ ] Columnas de tabla traducidas
- [ ] Mensajes de éxito/error traducidos
- [ ] Filtros traducidos (si aplica)
- [ ] No hay errores de linter
- [ ] Cambio de idioma funciona correctamente

---

## 🎯 Claves Comunes Reutilizables

Estas claves ya existen y pueden usarse en cualquier módulo:

```typescript
// Botones comunes
t('common.save')        // Guardar
t('common.cancel')      // Cancelar
t('common.close')       // Cerrar
t('common.edit')        // Editar
t('common.delete')      // Eliminar
t('common.confirm')     // Confirmar
t('common.search')      // Buscar
t('common.filter')      // Filtrar
t('common.clear')       // Limpiar
t('common.loading')     // Cargando...

// Paginación
t('pagination.itemsPerPage')
t('pagination.showing')
t('pagination.of')
t('pagination.results')

// Navegación
t('dashboard.title')    // Dashboard
```

---

## 📊 Estado de Implementación

| Módulo | Import | Hook Principal | Hook Modal | Textos | Estado |
|--------|---------|---------------|------------|--------|--------|
| Recordatorios | ✅ | ✅ | ✅ | 🔄 30% | En progreso |
| Historial | ❌ | ❌ | ❌ | ❌ | Pendiente |
| Ventas | ❌ | ❌ | ❌ | ❌ | Pendiente |
| Categorías | ❌ | ❌ | ❌ | ❌ | Pendiente |
| Estados | ❌ | ❌ | ❌ | ❌ | Pendiente |
| Roles | ❌ | ❌ | ❌ | ❌ | Pendiente |
| Usuarios | ❌ | ❌ | ❌ | ❌ | Pendiente |

---

*Todas las claves de traducción YA ESTÁN definidas en los archivos JSON. Solo falta aplicarlas.*


