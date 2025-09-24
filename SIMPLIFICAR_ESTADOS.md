# Simplificación del Sistema de Estados de Animales

## 📋 Resumen de Cambios

Se ha simplificado el sistema de estados de animales eliminando la funcionalidad de asignación manual de estados y implementando un flujo más directo para dar de baja con fecha de fallecimiento.

## 🔄 Cambios Implementados

### ❌ **Funcionalidad Eliminada**
- **Acción "Asignar Estado"** removida de la tabla de animales
- **Modal AsignarEstadoModal** eliminado
- **Botón verde de etiquetas** removido de las acciones

### ✅ **Nueva Funcionalidad**

#### **1. Sistema de Estados Simplificado**
Solo existen **3 estados predefinidos**:
- **Viva** (asignado por defecto al crear un animal)
- **Baja** (asignado al dar de baja con fecha de fallecimiento)
- **Vendida** (para animales vendidos)

#### **2. Modal "Dar de Baja" Mejorado**
- **Nuevo componente**: `DarDeBajaModal.tsx`
- **Campo obligatorio**: Fecha de fallecimiento
- **Validaciones**: No fechas futuras
- **Confirmación visual**: Preview de la fecha seleccionada
- **UX mejorada**: Alertas claras y confirmación explícita

#### **3. Actualización Automática de Tabla**
- **Revalidación cada 30 segundos**
- **Refetch al recuperar foco de ventana**
- **Refetch al reconectar internet**
- **Datos siempre frescos** (staleTime: 0)

## 🚀 Componentes Creados/Modificados

### **Nuevo: `DarDeBajaModal.tsx`**
```tsx
interface DarDeBajaModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Características:**
- ✅ Información clara del animal a dar de baja
- ✅ Campo de fecha obligatorio con validaciones
- ✅ Preview de la fecha seleccionada
- ✅ Estados de loading y error
- ✅ Diseño responsive y accesible

### **Modificado: `Animales.tsx`**
```tsx
// Estado para el modal de dar de baja
const [darDeBajaModalState, setDarDeBajaModalState] = useState<{
  isOpen: boolean;
  animal?: Animal;
}>({ isOpen: false });

// Nueva función para abrir modal
const handleDarDeBaja = (animal: Animal) => {
  if (!animal.ID_Estado_Animal) {
    showToast('No se puede dar de baja: el animal no tiene un estado asignado', 'error');
    return;
  }

  if (animal.EstadoNombre === 'Baja') {
    showToast('El animal ya está dado de baja', 'warning');
    return;
  }

  openDarDeBajaModal(animal);
};
```

### **Actualizado: API y Hooks**
```tsx
// API actualizada para enviar fecha de fallecimiento
darDeBaja: async (params: { idEstadoAnimal: number; fechaFallecimiento: string }) => {
  await http.put(`/estado-animal/${params.idEstadoAnimal}`, {
    Fecha_Fallecimiento: params.fechaFallecimiento
  });
}

// Hook con revalidación automática
export function useAnimales(filters: AnimalesFilters = {}) {
  return useQuery({
    queryKey: ['animales', filters],
    queryFn: () => animalesApi.getAll(filters),
    staleTime: 0, // Datos siempre frescos
    refetchInterval: 30000, // Cada 30 segundos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
```

## 🎯 Flujo de Usuario Actualizado

### **Antes**
1. Ver tabla de animales
2. Click en "Asignar Estado" → Modal con lista de estados
3. Seleccionar estado → Confirmar
4. Click en "Dar de baja" → Confirmación simple
5. Animal dado de baja sin fecha específica

### **Ahora**
1. Ver tabla de animales (se actualiza automáticamente cada 30s)
2. ~~Acción "Asignar Estado" eliminada~~
3. Click en "Dar de baja" → Modal con fecha de fallecimiento
4. Ingresar fecha obligatoria → Confirmar baja
5. Animal dado de baja con fecha específica registrada

## 🛡️ Validaciones Implementadas

### **Modal Dar de Baja**
- ✅ Animal válido seleccionado
- ✅ Estado animal existente (ID_Estado_Animal)
- ✅ No permitir baja si ya está dado de baja
- ✅ Fecha de fallecimiento obligatoria
- ✅ Fecha no puede ser futura
- ✅ Confirmación explícita antes de proceder

### **Botón "Dar de Baja"**
```tsx
disabled={
  darDeBajaMutation.isPending || 
  !animal.ID_Estado_Animal || 
  animal.EstadoNombre === 'Baja'
}

title={
  !animal.ID_Estado_Animal 
    ? "Sin estado asignado" 
    : animal.EstadoNombre === 'Baja' 
      ? "Ya está dado de baja" 
      : "Dar de baja"
}
```

## 📊 Ventajas del Nuevo Sistema

### **✅ Simplificación**
- Menos acciones confusas para el usuario
- Flujo más directo y claro
- Estados predefinidos y consistentes

### **✅ Mejor Trazabilidad**
- Fecha específica de fallecimiento registrada
- Proceso de baja más formal y documentado
- Historial más preciso para auditorías

### **✅ UX Mejorada**
- Modal intuitivo con validaciones claras
- Feedback visual inmediato
- Actualización automática de datos
- Menos clicks para operaciones comunes

### **✅ Datos Frescos**
- Tabla se actualiza cada 30 segundos automáticamente
- Revalidación al cambiar de ventana
- Sincronización inmediata en equipos colaborativos

## 🔧 Configuración del Backend

### **Estados Requeridos en la Base de Datos**
```sql
-- Solo 3 estados necesarios
INSERT INTO estados (ID_Estado, Nombre) VALUES 
(1, 'Viva'),    -- Estado por defecto
(2, 'Baja'),    -- Al dar de baja con fecha
(3, 'Vendida'); -- Para ventas
```

### **Endpoint Actualizado**
```javascript
PUT /api/estado-animal/:ID_Estado_Animal
Content-Type: application/json

{
  "Fecha_Fallecimiento": "2025-09-20"
}

// El backend debería:
// 1. Localizar el registro por ID_Estado_Animal
// 2. Actualizar ID_Estado = 2 (Baja)
// 3. Establecer Fecha_Fallecimiento = fecha recibida
```

## 🎨 Cambios Visuales

### **Tabla de Animales**
- **Eliminado**: Botón verde "Asignar Estado" 
- **Mantenido**: Botón rojo "Dar de baja" con nuevas validaciones
- **Mejorado**: Tooltips dinámicos según estado del animal

### **Acciones Disponibles**
| Acción | Ícono | Color | Disponibilidad |
|--------|-------|-------|----------------|
| Ver detalles | 👁️ `bi-eye` | Azul | Siempre |
| Editar | ✏️ `bi-pencil` | Amarillo | Siempre |
| Dar de baja | ⬇️ `bi-arrow-down-circle` | Rojo | Solo si tiene estado y no está dado de baja |

La implementación está **100% completa** y funcional. El sistema ahora es más simple, directo y proporciona mejor trazabilidad para el manejo de bajas de animales con fechas específicas de fallecimiento.


