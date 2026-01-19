// Upload Module Class
class UploadModule {
    constructor(type) {
        this.type = type;
        this.dropZone = document.getElementById(`${type}DropZone`);
        this.input = document.getElementById(`${type}Input`);
        this.uploadBtn = document.getElementById(`${type}UploadBtn`);
        this.preview = document.getElementById(`${type}Preview`);
        this.progressContainer = document.getElementById(`${type}Progress`);
        this.progressFill = document.getElementById(`${type}ProgressFill`);
        this.progressText = document.getElementById(`${type}ProgressText`);
        this.selectedFile = null;

        this.init();
    }

    init() {
        // Click on drop zone to open file selector
        this.dropZone.addEventListener('click', () => this.input.click());

        // File input change
        this.input.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            this.handleFileSelect(file);
        });

        // Upload button click
        this.uploadBtn.addEventListener('click', () => this.uploadFile());
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const validTypes = this.type === 'image'
            ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            : ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska'];

        if (!validTypes.includes(file.type)) {
            showNotification('Error', `Tipo de archivo no válido para ${this.type}`, 'error');
            return;
        }

        // Validate file size
        const maxSize = this.type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            showNotification('Error', `El archivo excede el tamaño máximo de ${maxSizeMB}MB`, 'error');
            return;
        }

        this.selectedFile = file;
        this.showPreview(file);
        this.uploadBtn.disabled = false;
        this.uploadBtn.querySelector('.btn-text').textContent = `Subir ${this.type === 'image' ? 'Imagen' : 'Video'}`;
    }

    showPreview(file) {
        this.preview.classList.remove('empty');
        this.preview.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'preview-content';

        if (this.type === 'image') {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = 'Preview';
            container.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.style.maxWidth = '100%';
            container.appendChild(video);
        }

        const info = document.createElement('div');
        info.className = 'file-info';
        info.innerHTML = `
      <strong>Archivo:</strong> ${file.name}<br>
      <strong>Tamaño:</strong> ${this.formatFileSize(file.size)}<br>
      <strong>Tipo:</strong> ${file.type}
    `;
        container.appendChild(info);

        this.preview.appendChild(container);
    }

    async uploadFile() {
        if (!this.selectedFile) return;

        const formData = new FormData();
        formData.append(this.type, this.selectedFile);

        this.uploadBtn.disabled = true;
        this.uploadBtn.querySelector('.btn-text').innerHTML = '<span class="loading"></span>';
        this.progressContainer.classList.add('active');
        this.progressFill.style.width = '0%';

        try {
            // Simulate progress (since we can't track real upload progress easily with fetch)
            this.simulateProgress();

            const response = await fetch(`/api/upload/${this.type}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.progressFill.style.width = '100%';
                this.progressText.textContent = '¡Completado!';

                showNotification(
                    '✅ Éxito',
                    `${this.type === 'image' ? 'Imagen' : 'Video'} subido correctamente. Webhook enviado a n8n.`,
                    'success'
                );

                // Reset after delay
                setTimeout(() => {
                    this.reset();
                }, 2000);
            } else {
                throw new Error(data.error || 'Error al subir el archivo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('❌ Error', error.message, 'error');
            this.reset();
        }
    }

    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) {
                clearInterval(interval);
                progress = 90;
            }
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `Subiendo... ${Math.round(progress)}%`;
        }, 200);
    }

    reset() {
        this.selectedFile = null;
        this.input.value = '';
        this.uploadBtn.disabled = true;
        this.uploadBtn.querySelector('.btn-text').textContent = `Selecciona ${this.type === 'image' ? 'una imagen' : 'un video'}`;
        this.progressContainer.classList.remove('active');
        this.progressFill.style.width = '0%';

        // Keep preview visible but could reset if desired
        // this.preview.classList.add('empty');
        // this.preview.innerHTML = '<div class="preview-placeholder"><p>La vista previa aparecerá aquí</p></div>';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

// Notification System
function showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Initialize upload modules
const imageUpload = new UploadModule('image');
const videoUpload = new UploadModule('video');

// Log initialization
console.log('🚀 Upload & Webhook App initialized');
console.log('📡 Webhook endpoint: http://localhost:3000/webhook/n8n');
