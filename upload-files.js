// File Upload Functionality
class FileUploadManager {
    constructor() {
        this.files = [];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/dwg',
            'text/plain'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProjects();
    }

    setupEventListeners() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');
        const clearBtn = document.getElementById('clear-btn');
        const uploadLink = document.querySelector('.upload-link');

        // Drag and drop events
        uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        uploadZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Button events
        uploadBtn.addEventListener('click', this.uploadFiles.bind(this));
        clearBtn.addEventListener('click', this.clearFiles.bind(this));
        uploadLink.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
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
                    status: 'pending'
                };
                this.files.push(fileObj);
            }
        });
        this.renderFileList();
        this.updateUploadButton();
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" is too large. Maximum size is 50MB.`, 'error');
            return false;
        }

        if (!this.allowedTypes.includes(file.type) && !this.isAllowedExtension(file.name)) {
            this.showNotification(`File type not supported: "${file.name}"`, 'error');
            return false;
        }

        return true;
    }

    isAllowedExtension(filename) {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.dwg', '.txt'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return allowedExtensions.includes(extension);
    }

    renderFileList() {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';

        if (this.files.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        
        this.files.forEach(fileObj => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${this.getFileIcon(fileObj.type)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${fileObj.name}</div>
                        <div class="file-size">${this.formatFileSize(fileObj.size)}</div>
                        <div class="file-progress">
                            <div class="progress-bar" style="width: ${fileObj.progress}%"></div>
                        </div>
                        <div class="file-status">${fileObj.status}</div>
                    </div>
                </div>
                <button class="file-remove" onclick="fileUploadManager.removeFile('${fileObj.id}')">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': 'fa-solid fa-file-pdf',
            'application/msword': 'fa-solid fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-solid fa-file-word',
            'image/jpeg': 'fa-solid fa-file-image',
            'image/png': 'fa-solid fa-file-image',
            'image/gif': 'fa-solid fa-file-image',
            'text/plain': 'fa-solid fa-file-text'
        };
        return iconMap[fileType] || 'fa-solid fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(fileId) {
        this.files = this.files.filter(file => file.id != fileId);
        this.renderFileList();
        this.updateUploadButton();
    }

    clearFiles() {
        this.files = [];
        this.renderFileList();
        this.updateUploadButton();
        document.getElementById('file-input').value = '';
    }

    updateUploadButton() {
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = this.files.length === 0;
        uploadBtn.textContent = this.files.length > 0 ? `Upload ${this.files.length} Files` : 'Upload Files';
    }

    async uploadFiles() {
        const projectSelect = document.getElementById('project-select');
        const categorySelect = document.getElementById('file-category');

        if (!projectSelect.value) {
            this.showNotification('Please select a project', 'error');
            return;
        }

        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

        for (let fileObj of this.files) {
            if (fileObj.status === 'pending') {
                await this.uploadSingleFile(fileObj, projectSelect.value, categorySelect.value);
            }
        }

        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Files';
        this.showNotification('Files uploaded successfully!', 'success');
        
        // Clear files after successful upload
        setTimeout(() => {
            this.clearFiles();
        }, 2000);
    }

    async uploadSingleFile(fileObj, projectId, category) {
        return new Promise((resolve) => {
            // Simulate file upload with progress
            fileObj.status = 'uploading';
            this.renderFileList();

            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 100) progress = 100;
                
                fileObj.progress = Math.round(progress);
                this.updateFileProgress(fileObj.id, fileObj.progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    fileObj.status = 'completed';
                    this.renderFileList();
                    
                    // Store file info in localStorage (simulating database)
                    this.saveFileToStorage(fileObj, projectId, category);
                    resolve();
                }
            }, 100);
        });
    }

    updateFileProgress(fileId, progress) {
        const fileItem = document.querySelector(`[onclick="fileUploadManager.removeFile('${fileId}')"]`).closest('.file-item');
        const progressBar = fileItem.querySelector('.progress-bar');
        const statusElement = fileItem.querySelector('.file-status');
        
        progressBar.style.width = progress + '%';
        statusElement.textContent = progress < 100 ? `Uploading ${progress}%` : 'Completed';
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
            uploadDate: new Date().toISOString(),
            url: URL.createObjectURL(fileObj.file) // In real app, this would be server URL
        };
        uploadedFiles.push(fileRecord);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    }

    loadProjects() {
        // In a real app, this would fetch from an API
        const projects = [
            { id: 'project1', name: 'Home Renovation - Mumbai' },
            { id: 'project2', name: 'Office Building - Delhi' },
            { id: 'project3', name: 'Warehouse - Bangalore' },
            { id: 'project4', name: 'Shopping Mall - Chennai' },
            { id: 'project5', name: 'Residential Complex - Pune' }
        ];

        const projectSelect = document.getElementById('project-select');
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// CSS for notifications
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
    
    .notification.success {
        border-left: 4px solid #27ae60;
    }
    
    .notification.error {
        border-left: 4px solid #e74c3c;
    }
    
    .notification.info {
        border-left: 4px solid #3498db;
    }
    
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
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .drag-over {
        border-color: #667eea !important;
        background: rgba(102, 126, 234, 0.2) !important;
        transform: scale(1.02);
    }
    
    .file-list {
        margin-top: 20px;
        display: none;
    }
    
    .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
    }
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 15px;
        flex: 1;
    }
    
    .file-icon i {
        font-size: 2rem;
        color: #667eea;
    }
    
    .file-details {
        flex: 1;
    }
    
    .file-name {
        color: white;
        font-weight: 600;
        margin-bottom: 5px;
    }
    
    .file-size {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
        margin-bottom: 8px;
    }
    
    .file-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 5px;
    }
    
    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.3s ease;
    }
    
    .file-status {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
    }
    
    .file-remove {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .file-remove:hover {
        background: rgba(231, 76, 60, 0.4);
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize file upload manager when page loads
let fileUploadManager;
document.addEventListener('DOMContentLoaded', () => {
    fileUploadManager = new FileUploadManager();
});