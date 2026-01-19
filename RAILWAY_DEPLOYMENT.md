# 🚀 Railway & PostgreSQL Deployment Guide

Este documento detalla la nueva estructura de la aplicación y los pasos para desplegarla en Railway.

## ✨ Novedades

- **Base de Datos PostgreSQL**: Ahora toda la metadata se guarda en una BD relacional.
- **Descripciones**: Puedes añadir una descripción personalizada a cada imagen y video.
- **Temas/Categorías**: Organización del contenido por temas individuales.
- **Galería Integrada**: Sección para ver y filtrar el contenido subido.
- **Preparado para Railway**: Configuración lista para despliegue inmediato.

## 🛠️ Estructura de la Base de Datos

Se han creado tres modelos principales:
1. **Topic**: Para categorizar el contenido.
2. **Image**: Metadata de imágenes (nombre, descripción, ruta, tamaño, tema).
3. **Video**: Metadata de videos (nombre, descripción, ruta, tamaño, tema).

## 📁 Archivos de Configuración Railway

- `Procfile`: Define el comando de inicio para Railway.
- `railway.json`: Configuración de build (utiliza Nixpacks).
- `.env`: Variables de entorno para conexión local y producción.

---

## 🚀 Pasos para Desplegar en Railway

### 1. Preparar en GitHub
El proyecto ya está en tu repositorio: [Leonardohxb/Webhook](https://github.com/Leonardohxb/Webhook)

### 2. Crear Proyecto en Railway
1. Ve a [Railway.app](https://railway.app/) e inicia sesión.
2. Click en **"New Project"**.
3. Selecciona **"Deploy from GitHub repo"**.
4. Elige el repositorio `Webhook`.

### 3. Añadir PostgreSQL
1. Una vez creado el proyecto, haz click en el botón **"+"** (New).
2. Selecciona **"Database"** -> **"Add PostgreSQL"**.

### 4. Configurar Variables de Entorno
Railway debería detectar automáticamente la mayoría, pero asegúrate de que en el servicio de tu app (Webhook) existan estas variables:

- `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (Railway suele conectarlo solo).
- `PORT`: `3000`
- `NODE_ENV`: `production`
- `N8N_WEBHOOK_URL`: La URL de tu webhook de n8n.

### 5. Advertencia sobre Almacenamiento
> [!WARNING]
> Railway tiene un sistema de archivos efímero. Los archivos guardados en `uploads/` se borrarán si la app se reinicia.
> Para uso real en producción, deberías conectar un servicio como Cloudinary para las imágenes/videos. Para tus pruebas actuales con n8n, funciona perfectamente mientras el servicio esté activo.

---

## 💻 Uso Local con PostgreSQL

Si quieres probarlo localmente con una base de datos real:
1. Asegúrate de tener PostgreSQL instalado.
2. Crea una base de datos llamada `webhook_db`.
3. Edita el archivo `.env` con tus credenciales:
   ```
   DATABASE_URL=postgres://usuario:password@localhost:5432/webhook_db
   ```
4. Ejecuta `npm start`.

## 🔗 Integración con n8n

El JSON que recibe n8n ahora incluye los nuevos campos:
```json
{
  "id": 1,
  "type": "image",
  "filename": "...",
  "originalName": "...",
  "description": "Tu descripción aquí",
  "topicId": 2,
  "size": 12345,
  "uploadedAt": "..."
}
```

¡Ya puedes empezar a categorizar tus subidas y automatizarlas con n8n! 🚀
