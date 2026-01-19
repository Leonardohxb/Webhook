# 📤 Webhook Upload Application

Una aplicación web moderna para subir imágenes y videos con integración automática de webhooks para n8n.

## 🚀 Características

- ✨ Interfaz moderna con efectos glassmorphism
- 🖼️ Módulo de carga de imágenes (JPG, PNG, GIF, WEBP)
- 🎬 Módulo de carga de videos (MP4, AVI, MOV, WEBM, etc.)
- 📤 Drag & drop para ambos tipos de archivos
- 👁️ Vista previa en tiempo real
- 📊 Barra de progreso de carga
- 🔗 Integración automática con webhooks de n8n
- 🎨 Diseño responsive y animaciones suaves

## 📋 Requisitos

- Node.js (v14 o superior)
- npm

## 🛠️ Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor:
```bash
npm start
```

3. Abre tu navegador en:
```
http://localhost:3000
```

## 🔗 Configuración de n8n

### Paso 1: Crear un Webhook en n8n

1. Abre n8n (generalmente en `http://localhost:5678`)
2. Crea un nuevo workflow
3. Agrega un nodo **Webhook**
4. Configura el webhook:
   - **HTTP Method:** POST
   - **Path:** `upload` (o el que prefieras)
   - **Response Mode:** Immediately
   - **Response Code:** 200

### Paso 2: Configurar la URL del Webhook

Por defecto, la aplicación envía datos a:
```
http://localhost:5678/webhook/upload
```

Si necesitas cambiar esta URL, edita el archivo `server.js` en la línea 85:
```javascript
const webhookUrl = 'http://localhost:5678/webhook/upload';
```

### Paso 3: Datos que Recibe el Webhook

Cada vez que se sube un archivo, n8n recibirá un JSON con:

```json
{
  "type": "image",
  "filename": "image-1234567890-123456789.jpg",
  "originalName": "mi-foto.jpg",
  "size": 1048576,
  "mimetype": "image/jpeg",
  "path": "C:\\Users\\leona\\Documents\\Webhook\\uploads\\images\\image-1234567890-123456789.jpg",
  "uploadedAt": "2026-01-19T13:21:25.000Z"
}
```

### Ejemplo de Workflow en n8n

```
Webhook (Trigger) 
    ↓
Set Node (Procesar datos)
    ↓
IF Node (Verificar tipo: image o video)
    ↓
[Tu automatización aquí]
```

## 📁 Estructura del Proyecto

```
Webhook/
├── public/
│   ├── index.html      # Interfaz de usuario
│   ├── style.css       # Estilos y diseño
│   └── app.js          # Lógica del frontend
├── uploads/
│   ├── images/         # Imágenes subidas
│   └── videos/         # Videos subidos
├── server.js           # Servidor Express
├── package.json        # Dependencias
└── README.md           # Este archivo
```

## 🎯 API Endpoints

### POST /api/upload/image
Sube una imagen al servidor.

**Body:** FormData con campo `image`

**Response:**
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "file": { ... }
}
```

### POST /api/upload/video
Sube un video al servidor.

**Body:** FormData con campo `video`

**Response:**
```json
{
  "success": true,
  "message": "Video subido exitosamente",
  "file": { ... }
}
```

### POST /webhook/n8n
Endpoint para recibir datos desde n8n (opcional).

**Body:** JSON con cualquier estructura

**Response:**
```json
{
  "success": true,
  "message": "Webhook recibido correctamente",
  "receivedData": { ... }
}
```

## 🎨 Personalización

### Cambiar Límites de Tamaño

En `server.js`:
- Imágenes: Línea 37 (por defecto 10MB)
- Videos: Línea 60 (por defecto 100MB)

### Cambiar Puerto del Servidor

En `server.js`, línea 8:
```javascript
const PORT = 3000; // Cambia a tu puerto preferido
```

## 🐛 Solución de Problemas

### El webhook no envía datos a n8n

1. Verifica que n8n esté corriendo
2. Confirma que la URL del webhook sea correcta
3. Revisa la consola del servidor para ver errores
4. Asegúrate de que el firewall permita la conexión

### Los archivos no se suben

1. Verifica que la carpeta `uploads/` tenga permisos de escritura
2. Confirma que el tamaño del archivo no exceda el límite
3. Revisa que el formato del archivo sea compatible

## 📝 Notas

- Los archivos se guardan en `uploads/images/` y `uploads/videos/`
- Los nombres de archivo se generan automáticamente para evitar conflictos
- El servidor usa CORS para permitir peticiones desde cualquier origen

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de abrir issues o pull requests.

## 📄 Licencia

ISC
