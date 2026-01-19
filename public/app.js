// Global State
let topics = [];
let selectedTopicId = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTopics();
    loadContent();

    // Topic Form
    document.getElementById('addTopicBtn').addEventListener('click', createTopic);
});

// Load Topics from API
async function loadTopics() {
    try {
        const response = await fetch('/api/topics');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        // Ensure data is an array
        topics = Array.isArray(data) ? data : [];

        updateTopicSelectors();
        updateTopicTabs();
    } catch (error) {
        console.error('Error loading topics:', error);
        topics = []; // Reset on error
    }
}

// Update Dropdowns in form
function updateTopicSelectors() {
    const selectors = ['imageTopic', 'videoTopic'];
    selectors.forEach(id => {
        const select = document.getElementById(id);
        const currentValue = select.value;
        select.innerHTML = '';

        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.name;
            select.appendChild(option);
        });

        if (currentValue) select.value = currentValue;
    });
}

// Update Tabs in gallery filter
function updateTopicTabs() {
    const tabsContainer = document.getElementById('topicTabs');
    const allBtn = tabsContainer.querySelector('[data-topic-id="all"]');
    tabsContainer.innerHTML = '';
    tabsContainer.appendChild(allBtn);

    topics.forEach(topic => {
        const btn = document.createElement('button');
        btn.className = 'topic-tab';
        btn.textContent = topic.name;
        btn.dataset.topicId = topic.id;
        if (selectedTopicId == topic.id) btn.classList.add('active');

        btn.addEventListener('click', () => {
            document.querySelectorAll('.topic-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            selectedTopicId = topic.id;
            loadContent();
        });

        tabsContainer.appendChild(btn);
    });

    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.topic-tab').forEach(t => t.classList.remove('active'));
        allBtn.classList.add('active');
        selectedTopicId = 'all';
        loadContent();
    });
}

// Create New Topic
async function createTopic() {
    const input = document.getElementById('newTopicName');
    const name = input.value.trim();
    if (!name) return;

    try {
        const response = await fetch('/api/topics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            input.value = '';
            await loadTopics();
            showNotification('Success', 'Tema creado correctamente', 'success');
        }
    } catch (error) {
        showNotification('Error', 'No se pudo crear el tema', 'error');
    }
}

// Load Content for Gallery
async function loadContent() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        const images = Array.isArray(data.images) ? data.images : [];
        const videos = Array.isArray(data.videos) ? data.videos : [];

        const grid = document.getElementById('contentGrid');
        grid.innerHTML = '';

        const allContent = [
            ...images.map(i => ({ ...i, type: 'image' })),
            ...videos.map(v => ({ ...v, type: 'video' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const filteredContent = selectedTopicId === 'all'
            ? allContent
            : allContent.filter(item => item.topicId == selectedTopicId);

        if (filteredContent.length === 0) {
            grid.innerHTML = '<p class="text-muted">No hay contenido en este tema.</p>';
            return;
        }

        filteredContent.forEach(item => {
            const card = document.createElement('div');
            card.className = 'content-card';

            let mediaHtml = '';
            if (item.type === 'image') {
                mediaHtml = `<img src="/uploads/images/${item.filename}" alt="${item.originalName}">`;
            } else {
                mediaHtml = `<video src="/uploads/videos/${item.filename}" controls></video>`;
            }

            card.innerHTML = `
        <div class="content-media">${mediaHtml}</div>
        <div class="content-info">
          <div class="content-title">${item.originalName}</div>
          <div class="content-desc">${item.description || 'Sin descripción'}</div>
          <div class="content-footer">
            <span class="tag">${item.topic ? item.topic.name : 'General'}</span>
            <span>${new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

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
        this.descriptionInput = document.getElementById(`${type}Description`);
        this.topicSelect = document.getElementById(`${type}Topic`);
        this.selectedFile = null;

        this.init();
    }

    init() {
        this.dropZone.addEventListener('click', () => this.input.click());
        this.input.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('dragover'));

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        this.uploadBtn.addEventListener('click', () => this.uploadFile());
    }

    handleFileSelect(file) {
        if (!file) return;
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
            container.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            container.appendChild(video);
        }
        this.preview.appendChild(container);
    }

    async uploadFile() {
        if (!this.selectedFile) return;

        const formData = new FormData();
        formData.append(this.type, this.selectedFile);
        formData.append('description', this.descriptionInput.value);
        formData.append('topicId', this.topicSelect.value);

        this.uploadBtn.disabled = true;
        this.progressContainer.classList.add('active');
        this.progressFill.style.width = '0%';

        try {
            const response = await fetch(`/api/upload/${this.type}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.progressFill.style.width = '100%';
                showNotification('✅ Éxito', 'Archivo subido correctamente', 'success');
                setTimeout(() => this.reset(), 1000);
                loadContent();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Error en la subida');
            }
        } catch (error) {
            showNotification('❌ Error', error.message, 'error');
            this.uploadBtn.disabled = false;
        }
    }

    reset() {
        this.selectedFile = null;
        this.input.value = '';
        this.descriptionInput.value = '';
        this.uploadBtn.disabled = true;
        this.uploadBtn.querySelector('.btn-text').textContent = `Selecciona ${this.type === 'image' ? 'una imagen' : 'un video'}`;
        this.progressContainer.classList.remove('active');
        this.preview.classList.add('empty');
        this.preview.innerHTML = '<div class="preview-placeholder"><p>La vista previa aparecerá aquí</p></div>';
    }
}

// Notification System
function showNotification(title, message, type = 'success') {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.innerHTML = `<strong>${title}</strong>: ${message}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// Initialize Modules
const imageUpload = new UploadModule('image');
const videoUpload = new UploadModule('video');
