# Funcionalidad: Asignar Estados a Animales

## 📋 Descripción

Esta funcionalidad permite asignar estados específicos a los animales en el sistema, con un manejo especial para el estado "Muerta" que requiere fecha de fallecimiento.

## 🚀 Características

### ✅ Modal de Asignación de Estados
- **Diseño profesional y responsive**
- **Soporte para modo oscuro**
- **Validaciones en tiempo real**
- **UX optimizada con transiciones suaves**

### ✅ Lógica Especial para Estado "Muerta"
- **ID_Estado = 8**: Detecta automáticamente el estado "Muerta"
- **Campo obligatorio**: Fecha de fallecimiento cuando se selecciona "Muerta"
- **Validación**: No permite fechas futuras
- **Campo opcional**: Para otros estados, la fecha se envía como `null`

### ✅ Integración Completa
- **Nueva columna**: "Reprod." en la tabla de animales
- **Botón de acción**: "Asignar Estado" con ícono de etiquetas
- **Actualización automática**: La tabla se refresca al asignar un estado

## 🔧 Componentes Implementados

### 1. **AsignarEstadoModal** (`src/components/modals/AsignarEstadoModal.tsx`)
```tsx
interface AsignarEstadoModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

### 2. **Hook useEstadoAnimal** (`src/hooks/useEstadoAnimal.ts`)
```tsx
const createMutation = useCreateEstadoAnimal();
```

### 3. **API Estado-Animal** (existente, actualizada)
- **POST** `/api/estado-animal`
- **Payload**:
```json
{
  "ID_Animal": 123,
  "ID_Estado": 8,
  "Fecha_Fallecimiento": "2025-09-17" // null para otros estados
}
```

## 🎨 Diseño y UX

### **Selección de Estado**
- Opciones en radio buttons organizados en grid responsive
- Indicador visual para estados que requieren fecha
- Preview del estado seleccionado con opción de cambio

### **Validaciones**
- ✅ Estado obligatorio
- ✅ Fecha obligatoria solo para "Muerta"
- ✅ Fecha no puede ser futura
- ✅ Confirmación antes de envío

### **Estados Visuales**
- 🔄 Loading spinner durante la carga de estados
- ⏳ Estado de envío con botón deshabilitado
- ✅ Feedback de éxito con toast
- ❌ Manejo de errores con mensajes claros

## 📱 Responsive Design

### **Desktop**
```css
.modal-dialog {
  max-width: 500px;
}
```

### **Mobile** 
```css
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  .btn-group {
    flex-direction: column;
  }
}
```

### **Dark Mode**
```css
@media (prefers-color-scheme: dark) {
  .form-check-input:checked {
    background-color: var(--color-base-green);
  }
}
```

## 🔄 Flujo de Usuario

1. **Abrir Modal**
   - Click en botón "Asignar Estado" (ícono de etiquetas)
   - Se muestra información del animal seleccionado

2. **Seleccionar Estado**
   - Lista de estados se carga desde `/api/estados`
   - Radio buttons con nombres de estado
   - Indicador especial para "Muerta"

3. **Fecha de Fallecimiento** (condicional)
   - Aparece solo si se selecciona estado "Muerta" (ID = 8)
   - Campo de fecha obligatorio
   - Validación: no fechas futuras

4. **Confirmación**
   - Botón "Asignar Estado" habilitado solo con datos válidos
   - Loading state durante el envío
   - Toast de confirmación al completar

5. **Actualización**
   - Tabla se refresca automáticamente
   - Nueva columna "Reprod." muestra el estado asignado

## 🛠️ Configuración del Backend

### **Endpoint Requerido**
```javascript
POST /api/estado-animal
Content-Type: application/json

{
  "ID_Animal": number,
  "ID_Estado": number,
  "Fecha_Fallecimiento": string | null
}
```

### **Estados Endpoint** (existente)
```javascript
GET /api/estados
Response: {
  "data": [
    {"ID_Estado": 6, "Nombre": "Ternero"},
    {"ID_Estado": 7, "Nombre": "Novillo"},
    {"ID_Estado": 8, "Nombre": "Muerta"}
  ],
  "count": number
}
```

### **Base de Datos**
- Tabla: `estado_animal`
- Campos:
  - `ID_Animal` (FK a animales)
  - `ID_Estado` (FK a estados) 
  - `Fecha_Fallecimiento` (NULLABLE DATE)

## 🔍 Validaciones Implementadas

### **Frontend**
- [x] Estado seleccionado obligatorio
- [x] Fecha obligatoria solo para "Muerta"
- [x] Fecha no puede ser futura
- [x] Deshabilitar envío durante loading

### **Lógica Especial**
```typescript
const isMuertaState = selectedEstado?.Nombre?.toLowerCase() === 'muerta' 
                   || selectedEstado?.ID_Estado === 8;

const payload: EstadoAnimalRequest = {
  ID_Animal: animal.ID_Animal,
  ID_Estado: selectedEstadoId,
  Fecha_Fallecimiento: isMuertaState ? fechaFallecimiento : null,
};
```

## 🎯 Accesibilidad

- ✅ Labels apropiados para screen readers
- ✅ Roles ARIA en botones
- ✅ Navegación por teclado
- ✅ Mensajes de error claros
- ✅ Estados de loading anunciados

## 🔧 Archivos Modificados/Creados

### **Nuevos**
- `src/components/modals/AsignarEstadoModal.tsx`
- `src/hooks/useEstadoAnimal.ts`
- `src/styles/modal-estados.css`

### **Modificados**
- `src/pages/Animales.tsx` - Integración del modal
- `src/types/api.ts` - Actualización de tipos

### **Estilos**
- Variables CSS personalizadas
- Animaciones suaves
- Responsive design
- Dark mode support

La funcionalidad está completamente implementada y lista para usar. La interfaz es intuitiva, accesible y mantiene la consistencia visual con el resto de la aplicación.
