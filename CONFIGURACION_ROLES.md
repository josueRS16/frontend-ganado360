# 🔐 Configuración de Roles y Autorización

## 📋 Especificaciones de Roles

### **Definición de Roles:**
- **RolID = 1** → **Veterinario**
- **RolID = 2** → **Administrador**

### **Permisos por Rol:**

#### **👨‍⚕️ Veterinario (RolID = 1)**
**Acceso permitido:**
- ✅ Dashboard
- ✅ Animales
- ✅ Vista Detallada
- ✅ Recordatorios
- ✅ Historial Veterinario

**Acceso DENEGADO:**
- ❌ Ventas
- ❌ Categorías
- ❌ Estados
- ❌ Roles
- ❌ Usuarios

#### **👨‍💼 Administrador (RolID = 2)**
**Acceso completo:**
- ✅ Dashboard
- ✅ Animales
- ✅ Vista Detallada
- ✅ Recordatorios
- ✅ Historial Veterinario
- ✅ Ventas
- ✅ Categorías
- ✅ Estados
- ✅ Roles
- ✅ Usuarios

---

## 🔧 Implementación Técnica

### **1. Sidebar (src/components/layout/Sidebar.tsx)**
```typescript
// Determinar si el usuario es Administrador
const isAdmin = user?.RolNombre?.toLowerCase() === 'administrador' || user?.RolID === 2;

// Menú dinámico basado en rol
const allMenuSections: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      { path: '/', label: 'Dashboard', description: 'Resumen general', icon: 'bi-speedometer2' },
      { path: '/animales', label: 'Animales', description: 'Gestión de ganado', icon: 'bi-diagram-3-fill' },
      { path: '/animales-detalle', label: 'Vista Detallada', description: 'Información completa', icon: 'bi-list-columns-reverse' },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { path: '/recordatorios', label: 'Recordatorios', description: 'Próximas tareas', icon: 'bi-calendar-check' },
      { path: '/historial', label: 'Historial Veterinario', description: 'Eventos veterinarios', icon: 'bi-heart-pulse' },
      // Ventas solo para Administrador
      ...(isAdmin ? [{ path: '/ventas', label: 'Ventas', description: 'Registro de ventas', icon: 'bi-cash-coin' }] : []),
    ]
  },
  // Sección de Configuración solo para Administrador
  ...(isAdmin ? [{
    title: 'Configuración',
    items: [
      { path: '/categorias', label: 'Categorías', description: 'Tipos de ganado', icon: 'bi-tags' },
      { path: '/estados', label: 'Estados', description: 'Estados del ganado', icon: 'bi-flag' },
      { path: '/roles', label: 'Roles', description: 'Roles de usuario', icon: 'bi-person-badge' },
      { path: '/usuarios', label: 'Usuarios', description: 'Gestión de usuarios', icon: 'bi-people' },
    ]
  }] : [])
];
```

### **2. Protección de Rutas (src/App.tsx)**
```typescript
{/* Rutas accesibles para todos los usuarios autenticados */}
<Route index element={<Dashboard />} />
<Route path="animales" element={<Animales />} />
<Route path="animales-detalle" element={<AnimalesDetalle />} />
<Route path="recordatorios" element={<Recordatorios />} />
<Route path="historial" element={<Historial />} />

{/* Rutas solo para Administradores */}
<Route path="ventas" element={
  <RoleRoute allowedRoles={['Administrador']}>
    <Ventas />
  </RoleRoute>
} />
<Route path="categorias" element={
  <RoleRoute allowedRoles={['Administrador']}>
    <Categorias />
  </RoleRoute>
} />
<Route path="roles" element={
  <RoleRoute allowedRoles={['Administrador']}>
    <Roles />
  </RoleRoute>
} />
<Route path="usuarios" element={
  <RoleRoute allowedRoles={['Administrador']}>
    <Usuarios />
  </RoleRoute>
} />
<Route path="estados" element={
  <RoleRoute allowedRoles={['Administrador']}>
    <Estados />
  </RoleRoute>
} />
```

### **3. Componente RoleRoute (src/components/RoleRoute.tsx)**
```typescript
export function RoleRoute({ children, allowedRoles, redirectTo = '/' }: RoleRouteProps) {
  const { user } = useAuth();

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasAccess = user?.RolNombre && allowedRoles.includes(user.RolNombre);

  if (!hasAccess) {
    // Redirigir al usuario a la página principal
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
```

---

## 🧪 Testing de Roles

### **Pruebas para Veterinario (RolID = 1):**

#### **Sidebar debe mostrar:**
- ✅ Dashboard
- ✅ Animales
- ✅ Vista Detallada
- ✅ Recordatorios
- ✅ Historial Veterinario
- ❌ NO debe mostrar: Ventas
- ❌ NO debe mostrar: Sección "Configuración"

#### **Navegación directa:**
- ✅ `/` → Dashboard (acceso permitido)
- ✅ `/animales` → Animales (acceso permitido)
- ✅ `/animales-detalle` → Vista Detallada (acceso permitido)
- ✅ `/recordatorios` → Recordatorios (acceso permitido)
- ✅ `/historial` → Historial Veterinario (acceso permitido)
- ❌ `/ventas` → Redirige a `/` (acceso denegado)
- ❌ `/categorias` → Redirige a `/` (acceso denegado)
- ❌ `/estados` → Redirige a `/` (acceso denegado)
- ❌ `/roles` → Redirige a `/` (acceso denegado)
- ❌ `/usuarios` → Redirige a `/` (acceso denegado)

### **Pruebas para Administrador (RolID = 2):**

#### **Sidebar debe mostrar:**
- ✅ Dashboard
- ✅ Animales
- ✅ Vista Detallada
- ✅ Recordatorios
- ✅ Historial Veterinario
- ✅ Ventas
- ✅ Categorías
- ✅ Estados
- ✅ Roles
- ✅ Usuarios

#### **Navegación directa:**
- ✅ Todas las rutas deben ser accesibles
- ✅ No debe haber redirecciones

---

## 🔍 Verificación de Implementación

### **Archivos Modificados:**
1. **src/components/layout/Sidebar.tsx** ✅
   - `isAdmin = user?.RolID === 2` (correcto)

2. **src/App.tsx** ✅
   - Usa `allowedRoles={['Administrador']}` (correcto)

3. **src/components/RoleRoute.tsx** ✅
   - Usa `user.RolNombre` (correcto)

### **Lógica de Autorización:**
```typescript
// En Sidebar.tsx
const isAdmin = user?.RolNombre?.toLowerCase() === 'administrador' || user?.RolID === 2;

// En RoleRoute.tsx
const hasAccess = user?.RolNombre && allowedRoles.includes(user.RolNombre);
```

---

## 📊 Matriz de Permisos

| Funcionalidad | Veterinario (RolID=1) | Administrador (RolID=2) |
|---------------|----------------------|------------------------|
| Dashboard | ✅ | ✅ |
| Animales | ✅ | ✅ |
| Vista Detallada | ✅ | ✅ |
| Recordatorios | ✅ | ✅ |
| Historial Veterinario | ✅ | ✅ |
| Ventas | ❌ | ✅ |
| Categorías | ❌ | ✅ |
| Estados | ❌ | ✅ |
| Roles | ❌ | ✅ |
| Usuarios | ❌ | ✅ |

---

## 🚨 Consideraciones Importantes

### **Backend:**
- Asegurar que el login devuelva `RolNombre` correcto
- Verificar que los roles en BD coincidan:
  - RolID = 1 → Nombre = "Veterinario"
  - RolID = 2 → Nombre = "Administrador"

### **Frontend:**
- La lógica usa tanto `RolID` como `RolNombre` para mayor robustez
- Si `RolNombre` no está disponible, usa `RolID` como fallback
- Las rutas protegidas solo verifican `RolNombre`

### **Seguridad:**
- ⚠️ **IMPORTANTE:** El backend también debe validar permisos
- El frontend solo oculta/muestra opciones, no es seguridad real
- Implementar middleware de autorización en el backend

---

## ✅ Estado Actual

```
╔════════════════════════════════════════════╗
║  SIDEBAR: ✅ CORREGIDO                    ║
║  RUTAS: ✅ CONFIGURADAS                   ║
║  ROLE ROUTE: ✅ FUNCIONAL                 ║
║  LÓGICA: ✅ ACTUALIZADA                   ║
║  TESTING: ⏳ PENDIENTE                    ║
╚════════════════════════════════════════════╝
```

---

## 🎯 Próximos Pasos

1. **Probar con usuario Veterinario (RolID=1)**
2. **Probar con usuario Administrador (RolID=2)**
3. **Verificar que el backend devuelva RolNombre correcto**
4. **Implementar protección de rutas en el backend**

---

*Configuración actualizada: ${new Date().toLocaleDateString('es-ES')}*
