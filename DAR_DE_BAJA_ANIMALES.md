# Funcionalidad: Dar de Baja Animales

## 📋 Descripción

Se ha reemplazado la acción "Eliminar" por "Dar de baja" en la gestión de animales. Esta nueva funcionalidad actualiza el estado del animal a través del endpoint de estado-animal.

## 🔄 Cambios Implementados

### ❌ **Funcionalidad Anterior**
- **Acción**: Eliminar animal
- **Endpoint**: `DELETE /api/animales/:id`
- **Ícono**: 🗑️ (`bi-trash`)
- **Efecto**: Eliminaba completamente el animal de la base de datos

### ✅ **Nueva Funcionalidad**
- **Acción**: Dar de baja animal
- **Endpoint**: `PUT /api/estado-animal/:ID_Estado_Animal`
- **Ícono**: ⬇️ (`bi-arrow-down-circle`)
- **Efecto**: Cambia el estado del animal (el backend maneja la lógica para asignar ID_Estado = 10)

## 🚀 Implementación

### **1. Actualización de Tipos**
```typescript
// src/types/api.ts
export interface Animal {
  ID_Animal: number;
  Nombre: string;
  EstadoNombre: string;
  ID_Estado_Animal?: number; // ← Nueva propiedad para dar de baja
  // ... otros campos
}
```

### **2. Nueva API**
```typescript
// src/api/estado-animal.ts
export const estadoAnimalApi = {
  // PUT /estado-animal/:id (cambiar estado a "Dar de baja" - ID_Estado = 10)
  darDeBaja: async (idEstadoAnimal: number): Promise<void> => {
    await http.put(`/estado-animal/${idEstadoAnimal}`);
  },
};
```

### **3. Hook Personalizado**
```typescript
// src/hooks/useEstadoAnimal.ts
export function useDarDeBajaAnimal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (idEstadoAnimal: number) => estadoAnimalApi.darDeBaja(idEstadoAnimal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      queryClient.invalidateQueries({ queryKey: ['estado-animal'] });
    },
  });
}
```

### **4. Lógica en el Componente**
```typescript
// src/pages/Animales.tsx
const handleDarDeBaja = async (animal: Animal) => {
  if (!animal.ID_Estado_Animal) {
    showToast('No se puede dar de baja: el animal no tiene un estado asignado', 'error');
    return;
  }

  if (window.confirm(`¿Estás seguro de dar de baja al animal "${animal.Nombre}"?`)) {
    try {
      await darDeBajaMutation.mutateAsync(animal.ID_Estado_Animal);
      showToast('Animal dado de baja exitosamente', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al dar de baja el animal';
      showToast(errorMessage, 'error');
    }
  }
};
```

## 🎯 Flujo de Usuario

### **Antes**
1. Click en 🗑️ "Eliminar"
2. Confirmación: "¿Eliminar animal?"
3. `DELETE /api/animales/:id`
4. Animal eliminado de la base de datos

### **Ahora**
1. Click en ⬇️ "Dar de baja"
2. Confirmación: "¿Dar de baja animal?"
3. `PUT /api/estado-animal/:ID_Estado_Animal`
4. Animal cambia de estado (preserva datos históricos)

## ✅ Validaciones

### **Frontend**
- ✅ Verificar que `animal.ID_Estado_Animal` existe
- ✅ Botón deshabilitado si no hay `ID_Estado_Animal`
- ✅ Mensaje de error específico si falta el estado
- ✅ Confirmación antes de ejecutar la acción

### **Botón de Acción**
```typescript
<button
  className="btn btn-sm btn-outline-danger"
  onClick={() => handleDarDeBaja(animal)}
  disabled={darDeBajaMutation.isPending || !animal.ID_Estado_Animal}
  title={!animal.ID_Estado_Animal ? "Sin estado asignado" : "Dar de baja"}
  aria-label="Dar de baja animal"
>
  <i className="bi bi-arrow-down-circle"></i>
</button>
```

## 🔧 Endpoint del Backend

### **URL Pattern**
```
PUT /api/estado-animal/:ID_Estado_Animal
```

### **Ejemplo de Llamada**
```javascript
// Si animal.ID_Estado_Animal = 123
PUT http://localhost:3000/api/estado-animal/123

// El backend internamente:
// 1. Localiza el registro con ID_Estado_Animal = 123
// 2. Actualiza ID_Estado = 10 (estado "Dar de baja")
// 3. Mantiene otros campos como Fecha_Fallecimiento, etc.
```

### **Respuesta Esperada**
```json
// 200 OK - Animal dado de baja exitosamente
// 404 Not Found - ID_Estado_Animal no encontrado
// 500 Internal Server Error - Error del servidor
```

## 🎨 Cambios Visuales

### **Ícono**
- **Antes**: `bi-trash` (🗑️ Eliminar)
- **Ahora**: `bi-arrow-down-circle` (⬇️ Dar de baja)

### **Color**
- **Mantenido**: `btn-outline-danger` (rojo) para indicar acción crítica

### **Tooltip**
- **Dinámico**: Muestra "Sin estado asignado" o "Dar de baja" según disponibilidad

### **Estado del Botón**
- **Habilitado**: Cuando `animal.ID_Estado_Animal` existe
- **Deshabilitado**: Cuando falta `ID_Estado_Animal` o está procesando

## 📊 Ventajas del Cambio

### **✅ Preservación de Datos**
- Los animales no se eliminan físicamente
- Se mantiene el historial completo
- Posibilidad de reactivar en el futuro

### **✅ Auditoría**
- Trazabilidad completa de cambios de estado
- Fechas de baja registradas
- Responsable de la acción

### **✅ Integridad Referencial**
- No se rompen relaciones con otras tablas
- Historial veterinario preservado
- Ventas y recordatorios mantenidos

## 🔍 Consideraciones Técnicas

### **Campo Requerido del Backend**
El GET de animales debe incluir `ID_Estado_Animal`:

```json
{
  "data": [
    {
      "ID_Animal": 123,
      "Nombre": "Vaca Lola",
      "EstadoNombre": "Activa",
      "ID_Estado_Animal": 456, // ← Este campo es crucial
      // ... otros campos
    }
  ]
}
```

### **Manejo de Casos Edge**
- **Sin estado asignado**: Botón deshabilitado + mensaje explicativo
- **Estado ya de baja**: Backend maneja duplicados
- **Errores de red**: Toast de error con mensaje específico

La implementación está completa y funcional. El cambio de "Eliminar" a "Dar de baja" mejora la integridad de los datos y proporciona mejor trazabilidad en el sistema de gestión ganadera.
