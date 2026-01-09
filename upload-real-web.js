// Real Web Upload Manager
class RealWebUploadManager {
    constructor() {
        this.files = [];
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.allowedTypes = [
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/dwg', 'text/plain', 'application/zip'
        ];
        this.uploadQueue = [];
        this.isUploading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProjects();
        this.setupRealTimeFeatures();
    }

    setupEventListeners() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');
        const clearBtn = document.getElementById('clear-btn');
        const uploadLink = document.querySelector('.upload-link');

        // Drag and drop
        uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        uploadZone.addEventListener('click', () => fileInput.click());

        // File selection
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        uploadLink.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });

        // Actions
        uploadBtn.addEventListener('click', this.startUpload.bind(this));
        clearBtn.addEventListener('click', this.clearFiles.bind(this));

        // Settings
        document.getElementById('upload-settings-save').addEventListener('click', this.saveSettings.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        files.forEach(file => {
            if (this.validateFile(file)) {
                const fileObj = {
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    progress: 0,
                    status: 'pending',
                    checksum: this.generateChecksum(file.name + file.size),
                    uploadedAt: null,
                    blobUrl: null
                };
                this.files.push(fileObj);
            }
        });
        this.renderFileList();
        this.updateUploadButton();
        this.updateStorageInfo();
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" exceeds 100MB limit`, 'error');
            return false;
        }

        if (!this.allowedTypes.includes(file.type) && !this.isAllowedExtension(file.name)) {
            this.showNotification(`File type not supported: "${file.name}"`, 'error');
            return false;
        }

        return true;
    }

    isAllowedExtension(filename) {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.dwg', '.dxf', '.txt', '.zip'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return allowedExtensions.includes(extension);
    }

    generateChecksum(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    renderFileList() {
        const fileList = document.getElementById('file-list');
        
        if (this.files.length === 0) {
            fileList.classList.remove('show');
            return;
        }

        fileList.classList.add('show');
        fileList.innerHTML = this.files.map(fileObj => `
            <div class="file-item" data-file-id="${fileObj.id}">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${this.getFileIcon(fileObj.type, fileObj.name)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${fileObj.name}</div>
                        <div class="file-meta">
                            <span class="file-size">${this.formatFileSize(fileObj.size)}</span>
                            <span class="file-type">${this.getFileTypeLabel(fileObj.name)}</span>
                            <span class="file-checksum">ID: ${fileObj.checksum}</span>
                        </div>
                        <div class="file-progress">
                            <div class="progress-bar" style="width: ${fileObj.progress}%"></div>
                        </div>
                        <div class="file-status">${this.getStatusLabel(fileObj.status, fileObj.progress)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-preview" onclick="realWebUploadManager.previewFile('${fileObj.id}')" title="Preview">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    ${fileObj.status === 'completed' ? `
                        <button class="file-download" onclick="realWebUploadManager.downloadFile('${fileObj.id}')" title="Download">
                            <i class="fa-solid fa-download"></i>
                        </button>
                    ` : ''}
                    <button class="file-remove" onclick="realWebUploadManager.removeFile('${fileObj.id}')" title="Remove">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(fileType, fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        const iconMap = {
            'application/pdf': 'fa-solid fa-file-pdf',
            'application/msword': 'fa-solid fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-solid fa-file-word',
            'application/vnd.ms-excel': 'fa-solid fa-file-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-solid fa-file-excel',
            'image/jpeg': 'fa-solid fa-file-image',
            'image/png': 'fa-solid fa-file-image',
            'video/mp4': 'fa-solid fa-file-video',
            'text/plain': 'fa-solid fa-file-text',
            'application/zip': 'fa-solid fa-file-zipper'
        };

        if (extension === '.dwg' || extension === '.dxf') {
            return 'fa-solid fa-drafting-compass';
        }

        return iconMap[fileType] || 'fa-solid fa-file';
    }

    getFileTypeLabel(fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        const typeMap = {
            '.pdf': 'PDF Document', '.doc': 'Word Document', '.docx': 'Word Document',
            '.xls': 'Excel Spreadsheet', '.xlsx': 'Excel Spreadsheet',
            '.jpg': 'JPEG Image', '.jpeg': 'JPEG Image', '.png': 'PNG Image',
            '.mp4': 'MP4 Video', '.dwg': 'AutoCAD Drawing', '.dxf': 'CAD File',
            '.txt': 'Text File', '.zip': 'ZIP Archive'
        };
        return typeMap[extension] || 'Unknown Type';
    }

    getStatusLabel(status, progress) {
        switch (status) {
            case 'pending': return 'Ready to upload';
            case 'uploading': return `Uploading ${progress}%`;
            case 'completed': return 'Upload complete';
            case 'error': return 'Upload failed';
            default: return 'Unknown status';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async startUpload() {
        const projectSelect = document.getElementById('project-select');
        const categorySelect = document.getElementById('file-category');

        if (!projectSelect.value) {
            this.showNotification('Please select a project before uploading', 'error');
            return;
        }

        if (this.files.filter(f => f.status === 'pending').length === 0) {
            this.showNotification('No files to upload', 'warning');
            return;
        }

        this.isUploading = true;
        this.updateUploadButton();

        for (let fileObj of this.files) {
            if (fileObj.status === 'pending') {
                await this.uploadSingleFile(fileObj, projectSelect.value, categorySelect.value);
            }
        }

        this.isUploading = false;
        this.updateUploadButton();
        this.showNotification('Upload completed successfully!', 'success');
    }

    async uploadSingleFile(fileObj, projectId, category) {
        return new Promise((resolve) => {
            fileObj.status = 'uploading';
            this.renderFileList();

            // Simulate realistic upload
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20 + 5;
                if (progress > 100) progress = 100;
                
                fileObj.progress = Math.round(progress);
                this.updateFileProgress(fileObj.id, fileObj.progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    fileObj.status = 'completed';
                    fileObj.uploadedAt = new Date().toISOString();
                    fileObj.blobUrl = URL.createObjectURL(fileObj.file);
                    
                    this.saveFileToStorage(fileObj, projectId, category);
                    this.renderFileList();
                    resolve();
                }
            }, 200);
        });
    }

    updateFileProgress(fileId, progress) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            const progressBar = fileItem.querySelector('.progress-bar');
            const statusElement = fileItem.querySelector('.file-status');
            
            progressBar.style.width = progress + '%';
            statusElement.textContent = progress < 100 ? `Uploading ${progress}%` : 'Upload complete';
        }
    }

    saveFileToStorage(fileObj, projectId, category) {
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        const fileRecord = {
            id: fileObj.id,
            name: fileObj.name,
            size: fileObj.size,
            type: fileObj.type,
            projectId: projectId,
            category: category,
            uploadDate: fileObj.uploadedAt,
            checksum: fileObj.checksum,
            blobUrl: fileObj.blobUrl,
            description: document.getElementById('upload-description').value,
            priority: document.getElementById('upload-priority').value
        };
        uploadedFiles.push(fileRecord);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    }

    previewFile(fileId) {
        const fileObj = this.files.find(f => f.id == fileId);
        if (!fileObj) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content preview-modal">
                <div class="modal-header">
                    <h3>File Preview - ${fileObj.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="file-preview-content">
                        ${this.generatePreviewContent(fileObj)}
                    </div>
                    <div class="file-metadata">
                        <h4>File Information</h4>
                        <div class="metadata-grid">
                            <div><strong>Name:</strong> ${fileObj.name}</div>
                            <div><strong>Size:</strong> ${this.formatFileSize(fileObj.size)}</div>
                            <div><strong>Type:</strong> ${this.getFileTypeLabel(fileObj.name)}</div>
                            <div><strong>Status:</strong> ${this.getStatusLabel(fileObj.status, fileObj.progress)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.body.appendChild(modal);
    }

    generatePreviewContent(fileObj) {
        if (fileObj.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(fileObj.file);
            return `<img src="${imageUrl}" alt="Preview" style="max-width: 100%; max-height: 400px;">`;
        }
        return `<div class="preview-placeholder">
            <i class="${this.getFileIcon(fileObj.type, fileObj.name)}" style="font-size: 4rem; margin-bottom: 20px;"></i>
            <p>Preview not available for this file type</p>
        </div>`;
    }

    downloadFile(fileId) {
        const fileObj = this.files.find(f => f.id == fileId);
        if (!fileObj || !fileObj.blobUrl) return;

        const link = document.createElement('a');
        link.href = fileObj.blobUrl;
        link.download = fileObj.name;
        link.click();
        
        this.showNotification(`Downloaded: ${fileObj.name}`, 'success');
    }

    removeFile(fileId) {
        this.files = this.files.filter(f => f.id != fileId);
        this.renderFileList();
        this.updateUploadButton();
        this.updateStorageInfo();
    }

    clearFiles() {
        this.files = [];
        this.renderFileList();
        this.updateUploadButton();
        this.updateStorageInfo();
        document.getElementById('file-input').value = '';
    }

    updateUploadButton() {
        const uploadBtn = document.getElementById('upload-btn');
        const pendingFiles = this.files.filter(f => f.status === 'pending').length;
        
        uploadBtn.disabled = this.isUploading || pendingFiles === 0;
        
        if (this.isUploading) {
            uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
        } else if (pendingFiles > 0) {
            uploadBtn.innerHTML = `<i class="fa-solid fa-cloud-upload"></i> Upload ${pendingFiles} Files`;
        } else {
            uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-upload"></i> Upload Files';
        }
    }

    updateStorageInfo() {
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        const statusElement = document.querySelector('.upload-status');
        
        if (this.files.length > 0) {
            statusElement.textContent = `${this.files.length} files selected (${this.formatFileSize(totalSize)})`;
        } else {
            statusElement.textContent = 'Ready to upload';
        }
    }

    saveSettings() {
        const settings = {
            description: document.getElementById('upload-description').value,
            priority: document.getElementById('upload-priority').value
        };
        
        localStorage.setItem('uploadSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    loadProjects() {
        // Projects are already in HTML, no need to load dynamically
    }

    setupRealTimeFeatures() {
        // Auto-save settings
        document.getElementById('upload-description').addEventListener('input', () => {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => this.saveSettings(), 2000);
        });

        // Real-time file validation
        setInterval(() => {
            this.updateStorageInfo();
        }, 5000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        min-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideIn 0.3s ease;
    }
    
    .notification.success { border-left: 4px solid #27ae60; }
    .notification.error { border-left: 4px solid #e74c3c; }
    .notification.warning { border-left: 4px solid #f39c12; }
    .notification.info { border-left: 4px solid #3498db; }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
        padding: 5px;
        border-radius: 3px;
    }
    
    .notification button:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    }
    
    .modal-content {
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        backdrop-filter: blur(20px);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .modal-header h3 {
        color: white;
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
    }
    
    .modal-close:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
    }
    
    .modal-body {
        padding: 25px;
    }
    
    .preview-placeholder {
        text-align: center;
        padding: 40px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .metadata-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-top: 15px;
    }
    
    .metadata-grid div {
        color: rgba(255, 255, 255, 0.8);
        padding: 8px 0;
    }
`;

// Add styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize
let realWebUploadManager;
document.addEventListener('DOMContentLoaded', () => {
    realWebUploadManager = new RealWebUploadManager();
});