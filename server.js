require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Topic, Image, Video, sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');

[uploadsDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

// Configure Multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten videos (MP4, AVI, MOV, WMV, FLV, WEBM, MKV)'));
    }
  }
});

// Webhook notification function
async function sendWebhookNotification(data) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/upload';

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('Webhook notification sent to n8n');
    return { success: true, status: response.status };
  } catch (error) {
    console.error('Error sending webhook notification:', error.message);
    return { success: false, error: error.message };
  }
}

// Basic Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Topic Routes
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await Topic.findAll();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const { name, description } = req.body;
    const topic = await Topic.create({ name, description });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image upload endpoint
app.post('/api/upload/image', imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const { description, topicId } = req.body;

    // Save to Database
    const dbImage = await Image.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      filePath: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      topicId: topicId || null
    });

    const fileData = {
      id: dbImage.id,
      type: 'image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      topicId: topicId || null,
      uploadedAt: dbImage.createdAt
    };

    // Send webhook notification
    await sendWebhookNotification(fileData);

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      file: fileData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video upload endpoint
app.post('/api/upload/video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún video' });
    }

    const { description, topicId } = req.body;

    // Save to Database
    const dbVideo = await Video.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      filePath: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      topicId: topicId || null
    });

    const fileData = {
      id: dbVideo.id,
      type: 'video',
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: description || '',
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      topicId: topicId || null,
      uploadedAt: dbVideo.createdAt
    };

    // Send webhook notification
    await sendWebhookNotification(fileData);

    res.json({
      success: true,
      message: 'Video subido exitosamente',
      file: fileData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all content
app.get('/api/content', async (req, res) => {
  try {
    const images = await Image.findAll({ include: 'topic' });
    const videos = await Video.findAll({ include: 'topic' });
    res.json({ images, videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for n8n
app.post('/webhook/n8n', (req, res) => {
  console.log('Webhook received from n8n:', req.body);
  res.json({
    success: true,
    message: 'Webhook recibido correctamente',
    receivedData: req.body
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Initialize DB and Start server
const start = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL no está definida. La base de datos no estará disponible.');
      throw new Error('DATABASE_URL is missing');
    }

    await sequelize.authenticate();
    console.log('✅ Connection to PostgreSQL has been established successfully.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ All models were synchronized successfully.');

    // Create a default topic if none exist
    const count = await Topic.count();
    if (count === 0) {
      await Topic.create({ name: 'General', description: 'Categoría por defecto' });
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/n8n`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    // If DB fails, we still start the server but log the error
    // This is useful for initial setup where DB might not be ready
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en modo degradado (sin DB) en http://localhost:${PORT}`);
    });
  }
};

start();
