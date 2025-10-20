# Instrucciones para Implementar Sistema de Perfil y Roles

## ✅ Cambios Completados en Frontend

### 1. Modal de Perfil de Usuario
Se creó `src/components/modals/PerfilUsuarioModal.tsx` que permite:
- Editar nombre y correo del usuario
- Cambiar contraseña (opcional)
- Diseño responsive que reacciona al modo oscuro
- Sigue el diseño de los demales modales del sistema

### 2. Navbar Actualizado
Se actualizó `src/components/layout/Navbar.tsx`:
- ✅ Eliminado el dropdown de "Acciones Rápidas"
- ✅ Agregado dropdown de perfil de usuario que muestra:
  - Avatar del usuario
  - Nombre completo
  - Correo electrónico
  - Rol con badge
  - Botón "Editar Perfil" (abre el modal)
  - Botón "Cerrar sesión"

### 3. Autorización por Roles en Sidebar
Se actualizó `src/components/layout/Sidebar.tsx`:
- **Administrador**: Acceso completo a todas las secciones
  - Dashboard, Animales, Vista Detallada
  - Recordatorios, Historial Veterinario, Ventas
  - Categorías, Estados, Roles, Usuarios

- **Veterinario**: Acceso limitado a:
  - Dashboard
  - Animales
  - Vista Detallada
  - Recordatorios
  - Historial Veterinario
  - ❌ NO tiene acceso a: Ventas, Categorías, Estados, Roles, Usuarios

### 4. Contexto de Autenticación Actualizado
Se actualizó `src/context/AuthContextInstance.tsx`:
- Ahora incluye: `ID_Usuario`, `Nombre`, `Correo`, `RolID`, `RolNombre`

### 5. Login Actualizado
Se actualizó `src/pages/Login.tsx`:
- Guarda todos los datos del usuario en el contexto al iniciar sesión

### 6. Protección de Rutas por Rol (Frontend)
Se creó `src/components/RoleRoute.tsx`:
- Componente que protege rutas basadas en roles
- Redirige automáticamente si el usuario no tiene permisos

Se actualizó `src/App.tsx`:
- Rutas protegidas solo para Administradores: Ventas, Categorías, Roles, Usuarios, Estados
- Rutas accesibles para todos: Dashboard, Animales, Vista Detallada, Recordatorios, Historial

---

## 🔧 Cambios Requeridos en Backend

### 1. Actualizar Respuesta del Login
El endpoint de login debe devolver **todos** estos campos:

```javascript
// backend/controllers/authController.js o similar

exports.login = async (req, res) => {
  // ... validaciones y verificaciones ...
  
  // Buscar usuario con información de rol
  const usuario = await usuariosRepository.findByCorreo(correo);
  
  if (!usuario) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }
  
  // Verificar contraseña con bcrypt
  const isPasswordValid = await bcrypt.compare(password, usuario.Contraseña);
  
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }
  
  // Generar token JWT
  const token = jwt.sign(
    { 
      id: usuario.ID_Usuario,
      correo: usuario.Correo,
      rol: usuario.RolID 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // ✅ IMPORTANTE: Devolver estos campos exactos
  res.json({
    token,
    id: usuario.ID_Usuario,           // o ID_Usuario
    nombre: usuario.Nombre,
    rol: usuario.RolID,
    rolNombre: usuario.RolNombre,     // o RolNombre
    correo: usuario.Correo
  });
};
```

### 2. Verificar que UsuariosRepository.findByCorreo incluya RolNombre
Asegúrate de que el método `findByCorreo` haga un JOIN con la tabla `Rol`:

```javascript
// backend/repositories/usuariosRepository.js

async findByCorreo(correo) {
  return await getOne(`
    SELECT u.*, r.Nombre as RolNombre 
    FROM Usuario u 
    JOIN Rol r ON u.RolID = r.RolID 
    WHERE u.Correo = ?
  `, [correo]);
}
```

### 3. Endpoint para Actualizar Perfil
El frontend usa el endpoint `PUT /usuarios/:id` existente.

**IMPORTANTE**: El backend debe:
- ✅ Permitir actualizar: `Nombre`, `Correo`, `Contraseña` (opcional)
- ✅ Si se envía una nueva contraseña, debe hashearla con bcrypt antes de guardar
- ✅ Si NO se envía contraseña (o viene vacía/undefined), mantener la contraseña actual sin modificar
- ✅ NO permitir cambiar el `RolID` desde el perfil de usuario (solo desde gestión de usuarios)

**Nota**: El frontend enviará `Contraseña` solo cuando el usuario active el cambio de contraseña y la ingrese. En otros casos, el campo no estará presente en la petición.

```javascript
// backend/controllers/usuariosController.js

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Correo, Contraseña, RolID } = req.body;
    
    // Obtener usuario actual para mantener valores que no cambien
    const usuario = await usuariosRepository.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si el usuario está actualizando su propio perfil, 
    // verificar que solo actualice sus propios datos
    const isSelfUpdate = req.user && req.user.id === parseInt(id);
    
    let updateData = {
      Nombre: Nombre || usuario.Nombre,
      Correo: Correo || usuario.Correo,
      RolID: isSelfUpdate ? usuario.RolID : (RolID || usuario.RolID), // Mantener rol si es auto-actualización
      Contraseña: usuario.Contraseña // Mantener contraseña actual por defecto
    };
    
    // Si se proporciona nueva contraseña, hashearla
    if (Contraseña && Contraseña.trim().length > 0) {
      if (Contraseña.length < 6) {
        return res.status(400).json({ 
          message: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      const saltRounds = 12;
      updateData.Contraseña = await bcrypt.hash(Contraseña, saltRounds);
    }
    
    const updated = await usuariosRepository.update(id, updateData);
    
    if (!updated) {
      return res.status(404).json({ message: 'Error al actualizar usuario' });
    }
    
    res.json({
      message: 'Usuario actualizado correctamente',
      data: updated
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};
```

### 4. Protección de Rutas por Rol (Opcional pero Recomendado)
Aunque el frontend oculta las opciones según el rol, es importante proteger las rutas en el backend:

```javascript
// backend/middleware/roleAuth.js

const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    // req.user debe ser agregado por el middleware de autenticación JWT
    const userRole = req.user.rolNombre || req.user.RolNombre;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso' 
      });
    }
    
    next();
  };
};

module.exports = roleAuth;
```

Uso en rutas:

```javascript
// backend/routes/usuarios.js
const roleAuth = require('../middleware/roleAuth');

// Solo Administradores pueden gestionar usuarios
router.get('/usuarios', authenticate, roleAuth(['Administrador']), usuariosController.getAll);
router.post('/usuarios', authenticate, roleAuth(['Administrador']), usuariosController.create);
router.delete('/usuarios/:id', authenticate, roleAuth(['Administrador']), usuariosController.delete);

// Usuarios pueden actualizar su propio perfil
router.put('/usuarios/:id', authenticate, usuariosController.update);
```

---

## 🧪 Testing

### Probar el Sistema de Roles:
1. Inicia sesión como **Administrador**:
   - Verifica que veas todas las opciones del menú
   - Accede a Ventas, Categorías, Estados, Roles y Usuarios

2. Inicia sesión como **Veterinario**:
   - Verifica que NO veas: Ventas ni sección de Configuración
   - Verifica que SÍ veas: Dashboard, Animales, Vista Detallada, Recordatorios, Historial

### Probar el Perfil de Usuario:
1. Haz clic en tu nombre en el Navbar (arriba a la derecha)
2. Verifica que se muestre tu información correcta
3. Haz clic en "Editar Perfil"
4. Prueba actualizar:
   - ✅ Nombre
   - ✅ Correo
   - ✅ Contraseña (activa el toggle)
5. Verifica que los cambios se guarden correctamente

---

## 📝 Notas Importantes

1. **Seguridad de Contraseñas**: 
   - El backend DEBE usar bcrypt para hashear contraseñas
   - Se recomienda usar `saltRounds = 12` o superior

2. **Validación de Correos Únicos**:
   - Al actualizar el correo, verificar que no exista otro usuario con ese correo

3. **Tokens JWT**:
   - Los tokens deben incluir el `ID_Usuario`, `RolID` y `Correo`
   - Se recomienda usar una expiración de 24 horas

4. **Roles en Base de Datos**:
   - Asegúrate de que existan los roles:
     - `Administrador` (ID: 1)
     - `Veterinario` (ID: 2)

5. **Modo Oscuro**:
   - El modal de perfil reacciona automáticamente al tema del sistema
   - No requiere configuración adicional

---

## 🎨 Personalización

### Cambiar el Nombre de los Roles:
Si deseas cambiar los nombres de los roles, actualiza:

1. `src/components/layout/Sidebar.tsx` línea 29:
```typescript
const isAdmin = user?.RolNombre?.toLowerCase() === 'tu_nuevo_nombre_admin' || user?.RolID === 1;
```

2. Base de datos: Actualiza el nombre en la tabla `Rol`

### Agregar Más Roles:
Para agregar más roles con diferentes permisos:

1. Crea el rol en la base de datos
2. Actualiza la lógica en `Sidebar.tsx` para mostrar/ocultar menús
3. Agrega middleware de autorización en el backend

---

## ✅ Checklist de Implementación

- [x] Frontend: Modal de perfil creado
- [x] Frontend: Navbar actualizado con perfil de usuario
- [x] Frontend: Sidebar con autorización por roles
- [x] Frontend: Contexto de autenticación actualizado
- [x] Frontend: Login actualizado
- [ ] Backend: Actualizar respuesta de login con todos los campos
- [ ] Backend: Verificar que findByCorreo incluya RolNombre
- [ ] Backend: Endpoint de actualización de perfil funcional
- [ ] Backend: Hasheo de contraseñas con bcrypt
- [ ] Backend: Protección de rutas por rol (opcional)
- [ ] Testing: Probar con usuario Administrador
- [ ] Testing: Probar con usuario Veterinario
- [ ] Testing: Probar edición de perfil

---

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que el backend devuelva todos los campos requeridos en el login
2. Revisa la consola del navegador para errores
3. Verifica que los roles en la base de datos coincidan con los nombres esperados
4. Asegúrate de que el token JWT incluya la información del usuario

