# Configuración del Backend para Subida de Imágenes

Para que la funcionalidad de subida de imágenes funcione correctamente, necesitas configurar el backend para manejar archivos. Aquí están las instrucciones:

## Endpoint Requerido

### POST /upload/image

El backend debe implementar un endpoint que reciba archivos multipart/form-data y los guarde en el directorio `uploads/`.

**Ejemplo de implementación (Node.js/Express con multer):**

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Endpoint para subir imagen
app.post('/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se recibió ningún archivo' 
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir la imagen' 
    });
  }
});
```

### Servir Archivos Estáticos

El backend debe servir los archivos del directorio `uploads/` como archivos estáticos:

```javascript
// Servir archivos estáticos del directorio uploads
app.use('/uploads', express.static('uploads'));
```

### DELETE /upload/image/:filename (Opcional)

Para eliminar imágenes que ya no se usan:

```javascript
app.delete('/upload/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Imagen eliminada exitosamente' });
    } else {
      res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar la imagen' 
    });
  }
});
```

## Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la variable `VITE_API_URL` configurada:

```env
VITE_API_URL=http://localhost:3000/api
```

## Estructura de Directorios

```
backend/
├── uploads/          # Directorio para imágenes subidas
├── routes/
│   └── upload.js     # Rutas de upload
└── server.js         # Servidor principal
```

## Consideraciones de Seguridad

1. **Validación de archivos**: Verificar tipo MIME y extensión
2. **Límite de tamaño**: Configurar límite máximo (5MB por defecto)
3. **Nombres únicos**: Evitar colisiones de nombres de archivo
4. **Sanitización**: Limpiar nombres de archivo de caracteres peligrosos
5. **Rate limiting**: Limitar cantidad de uploads por usuario/IP

## Respuesta del Backend

El endpoint debe devolver un JSON con esta estructura:

```json
{
  "success": true,
  "imageUrl": "http://localhost:3000/uploads/image-1234567890-123456789.jpg",
  "filename": "image-1234567890-123456789.jpg",
  "originalName": "mi-imagen.jpg",
  "size": 1024000
}
```

## Base de Datos

La columna `Imagen_URL` en la tabla de animales debe poder almacenar tanto URLs externas como URLs de archivos subidos:

```sql
ALTER TABLE animales MODIFY COLUMN Imagen_URL VARCHAR(500);
```

Ejemplos de valores:
- URL externa: `https://example.com/imagen.jpg`
- Archivo subido: `http://localhost:3000/uploads/image-1234567890-123456789.jpg`

## Pruebas

Puedes probar el endpoint con curl:

```bash
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  http://localhost:3000/api/upload/image
```

## Notas Adicionales

- Los archivos se guardan con nombres únicos para evitar colisiones
- El frontend maneja automáticamente la conversión entre URLs y archivos
- Las imágenes existentes (URLs externas) seguirán funcionando sin cambios
- El componente `ImageSelector` permite alternar entre URL y archivo local
