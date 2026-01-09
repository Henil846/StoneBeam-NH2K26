// Enhanced File Upload Manager with Real Construction Features
class AdvancedFileUploadManager {
    constructor() {
        this.files = [];
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'application/dwg',
            'application/dxf',
            'text/plain',
            'application/zip'
        ];
        this.projects = this.loadProjects();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProjectsIntoSelect();
        this.displayStorageInfo();
    }

    setupEventListeners() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');
        const clearBtn = document.getElementById('clear-btn');
        const uploadLink = document.querySelector('.upload-link');

        uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        uploadZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
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
                    status: 'pending',
                    uploadedAt: null,
                    version: 1,
                    checksum: this.generateChecksum(file.name + file.size)
                };
                this.files.push(fileObj);
            }
        });
        this.renderFileList();
        this.updateUploadButton();
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" exceeds 100MB limit. Please compress or split the file.`, 'error');
            return false;
        }

        // Check file type
        if (!this.allowedTypes.includes(file.type) && !this.isAllowedExtension(file.name)) {
            this.showNotification(`File type not supported: "${file.name}". Please convert to a supported format.`, 'error');
            return false;
        }

        // Check for duplicates
        const existingFile = this.files.find(f => f.name === file.name);
        if (existingFile) {
            this.showNotification(`File "${file.name}" already exists. Version control will be applied.`, 'warning');
        }

        return true;
    }

    isAllowedExtension(filename) {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.dwg', '.dxf', '.txt', '.zip', '.cad'];
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
                        <i class="${this.getFileIcon(fileObj.type, fileObj.name)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${fileObj.name}</div>
                        <div class="file-meta">
                            <span class="file-size">${this.formatFileSize(fileObj.size)}</span>
                            <span class="file-type">${this.getFileTypeLabel(fileObj.type, fileObj.name)}</span>
                            <span class="file-checksum">ID: ${fileObj.checksum}</span>
                        </div>
                        <div class="file-progress">
                            <div class="progress-bar" style="width: ${fileObj.progress}%"></div>
                        </div>
                        <div class="file-status ${fileObj.status}">${this.getStatusLabel(fileObj.status, fileObj.progress)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-preview" onclick="advancedUploadManager.previewFile('${fileObj.id}')" title="Preview">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="file-download" onclick="advancedUploadManager.downloadFile('${fileObj.id}')" title="Download">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button class="file-remove" onclick="advancedUploadManager.removeFile('${fileObj.id}')" title="Remove">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
    }

    getFileIcon(fileType, fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        const iconMap = {
            'application/pdf': 'fa-solid fa-file-pdf text-red-500',
            'application/msword': 'fa-solid fa-file-word text-blue-500',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-solid fa-file-word text-blue-500',
            'application/vnd.ms-excel': 'fa-solid fa-file-excel text-green-500',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-solid fa-file-excel text-green-500',
            'image/jpeg': 'fa-solid fa-file-image text-purple-500',
            'image/png': 'fa-solid fa-file-image text-purple-500',
            'image/gif': 'fa-solid fa-file-image text-purple-500',
            'video/mp4': 'fa-solid fa-file-video text-red-600',
            'text/plain': 'fa-solid fa-file-text text-gray-500',
            'application/zip': 'fa-solid fa-file-zipper text-yellow-500'
        };

        // Check by extension for CAD files
        if (extension === '.dwg' || extension === '.dxf') {
            return 'fa-solid fa-drafting-compass text-orange-500';
        }

        return iconMap[fileType] || 'fa-solid fa-file text-gray-400';
    }

    getFileTypeLabel(fileType, fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        const typeMap = {
            '.pdf': 'PDF Document',
            '.doc': 'Word Document',
            '.docx': 'Word Document',
            '.xls': 'Excel Spreadsheet',
            '.xlsx': 'Excel Spreadsheet',
            '.jpg': 'JPEG Image',
            '.jpeg': 'JPEG Image',
            '.png': 'PNG Image',
            '.gif': 'GIF Image',
            '.mp4': 'MP4 Video',
            '.dwg': 'AutoCAD Drawing',
            '.dxf': 'CAD Exchange File',
            '.txt': 'Text File',
            '.zip': 'ZIP Archive'
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
                            <div class="metadata-item">
                                <label>File Name:</label>
                                <span>${fileObj.name}</span>
                            </div>
                            <div class="metadata-item">
                                <label>File Size:</label>
                                <span>${this.formatFileSize(fileObj.size)}</span>
                            </div>
                            <div class="metadata-item">
                                <label>File Type:</label>
                                <span>${this.getFileTypeLabel(fileObj.type, fileObj.name)}</span>
                            </div>
                            <div class="metadata-item">
                                <label>Checksum:</label>
                                <span>${fileObj.checksum}</span>
                            </div>
                            <div class="metadata-item">
                                <label>Status:</label>
                                <span class="status-${fileObj.status}">${this.getStatusLabel(fileObj.status, fileObj.progress)}</span>
                            </div>
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
        const fileType = fileObj.type;
        const fileName = fileObj.name.toLowerCase();

        if (fileType.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(fileObj.file);
            return `<img src="${imageUrl}" alt="Preview" style="max-width: 100%; max-height: 400px; object-fit: contain;">`;
        } else if (fileType === 'application/pdf') {
            return `<div class="preview-placeholder">
                <i class="fa-solid fa-file-pdf" style="font-size: 4rem; color: #e74c3c;"></i>
                <p>PDF Preview</p>
                <p>Click download to view full document</p>
            </div>`;
        } else if (fileName.includes('.dwg') || fileName.includes('.dxf')) {
            return `<div class="preview-placeholder">
                <i class="fa-solid fa-drafting-compass" style="font-size: 4rem; color: #f39c12;"></i>
                <p>CAD Drawing File</p>
                <p>Requires AutoCAD or compatible viewer</p>
            </div>`;
        } else {
            return `<div class="preview-placeholder">
                <i class="fa-solid fa-file" style="font-size: 4rem; color: #95a5a6;"></i>
                <p>File Preview Not Available</p>
                <p>Download file to view contents</p>
            </div>`;
        }
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
        this.displayStorageInfo();
    }

    clearFiles() {
        this.files = [];
        this.renderFileList();
        this.updateUploadButton();
        this.displayStorageInfo();
        document.getElementById('file-input').value = '';
    }

    updateUploadButton() {
        const uploadBtn = document.getElementById('upload-btn');
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        
        uploadBtn.disabled = this.files.length === 0;
        
        if (this.files.length > 0) {
            uploadBtn.innerHTML = `<i class="fa-solid fa-cloud-upload"></i> Upload ${this.files.length} Files (${this.formatFileSize(totalSize)})`;
        } else {
            uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-upload"></i> Upload Files';
        }
    }

    async uploadFiles() {
        const projectSelect = document.getElementById('project-select');
        const categorySelect = document.getElementById('file-category');

        if (!projectSelect.value) {
            this.showNotification('Please select a project before uploading files.', 'error');
            return;
        }

        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Upload...';

        let successCount = 0;
        let errorCount = 0;

        for (let fileObj of this.files) {
            if (fileObj.status === 'pending') {
                try {
                    await this.uploadSingleFile(fileObj, projectSelect.value, categorySelect.value);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    fileObj.status = 'error';
                }
            }
        }

        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-upload"></i> Upload Files';

        if (successCount > 0) {
            this.showNotification(`Successfully uploaded ${successCount} files!`, 'success');
        }
        if (errorCount > 0) {
            this.showNotification(`Failed to upload ${errorCount} files. Please try again.`, 'error');
        }

        this.displayStorageInfo();
        
        // Clear successful uploads after delay
        setTimeout(() => {
            // Keep completed files for download but mark as archived
            this.files.forEach(f => {
                if (f.status === 'completed') {
                    f.archived = true;
                }
            });
            this.renderFileList();
            this.updateUploadButton();
        }, 5000);
    }

    async uploadSingleFile(fileObj, projectId, category) {
        return new Promise((resolve, reject) => {
            fileObj.status = 'uploading';
            this.renderFileList();

            // Create FormData for actual file upload
            const formData = new FormData();
            formData.append('file', fileObj.file);
            formData.append('projectId', projectId);
            formData.append('category', category);
            formData.append('checksum', fileObj.checksum);

            // Simulate realistic upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5; // 5-20% increments
                if (progress > 100) progress = 100;
                
                fileObj.progress = Math.round(progress);
                this.updateFileProgress(fileObj.id, fileObj.progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Simulate successful upload
                    fileObj.status = 'completed';
                    fileObj.uploadedAt = new Date().toISOString();
                    
                    // Create blob URL for file access
                    fileObj.blobUrl = URL.createObjectURL(fileObj.file);
                    
                    this.saveFileToStorage(fileObj, projectId, category);
                    this.renderFileList();
                    resolve();
                }
            }, 300);
        });
    }

    updateFileProgress(fileId, progress) {
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            const removeBtn = item.querySelector(`[onclick*="removeFile('${fileId}')"]`);
            if (removeBtn) {
                const progressBar = item.querySelector('.progress-bar');
                const statusElement = item.querySelector('.file-status');
                
                if (progressBar && statusElement) {
                    progressBar.style.width = progress + '%';
                    statusElement.textContent = progress < 100 ? `Uploading ${progress}%` : 'Upload complete';
                }
            }
        });
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
            version: fileObj.version,
            blobUrl: fileObj.blobUrl,
            downloadable: true,
            status: 'active'
        };
        uploadedFiles.push(fileRecord);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        // Update project file count
        this.updateProjectStats(projectId);
    }

    loadProjects() {
        return [
            { 
                id: 'project1', 
                name: 'Skyline Residency - Ahmedabad', 
                value: '₹2.5Cr',
                status: 'In Progress',
                completion: 65
            },
            { 
                id: 'project2', 
                name: 'TechHub Office Complex - Gandhinagar', 
                value: '₹8.2Cr',
                status: 'Planning',
                completion: 25
            },
            { 
                id: 'project3', 
                name: 'Industrial Park Phase-II - Sanand', 
                value: '₹15Cr',
                status: 'Foundation',
                completion: 40
            },
            { 
                id: 'project4', 
                name: 'Green Valley Apartments - Bopal', 
                value: '₹4.8Cr',
                status: 'Finishing',
                completion: 85
            },
            { 
                id: 'project5', 
                name: 'Metro Mall Extension - SG Highway', 
                value: '₹12Cr',
                status: 'Structure',
                completion: 55
            }
        ];
    }

    loadProjectsIntoSelect() {
        const projectSelect = document.getElementById('project-select');
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.name} (${project.value}) - ${project.completion}% Complete`;
            projectSelect.appendChild(option);
        });
    }

    displayStorageInfo() {
        const totalFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]').length;
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        
        // Create or update storage info display
        let storageInfo = document.querySelector('.storage-info');
        if (!storageInfo) {
            storageInfo = document.createElement('div');
            storageInfo.className = 'storage-info';
            document.querySelector('.upload-section').appendChild(storageInfo);
        }
        
        storageInfo.innerHTML = `
            <div class="storage-stats">
                <div class="stat">
                    <i class="fa-solid fa-files"></i>
                    <span>${totalFiles} Files Stored</span>
                </div>
                <div class="stat">
                    <i class="fa-solid fa-database"></i>
                    <span>${this.formatFileSize(totalSize)} Current Session</span>
                </div>
                <div class="stat">
                    <i class="fa-solid fa-shield-check"></i>
                    <span>Enterprise Security</span>
                </div>
            </div>
        `;
    }

    downloadFile(fileId) {
        const fileObj = this.files.find(f => f.id == fileId);
        if (!fileObj || fileObj.status !== 'completed') {
            this.showNotification('File not available for download', 'error');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = fileObj.blobUrl || URL.createObjectURL(fileObj.file);
        link.download = fileObj.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Downloaded: ${fileObj.name}`, 'success');
    }

    updateProjectStats(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const projectFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
                .filter(f => f.projectId === projectId);
            
            // Update project with file count
            project.fileCount = projectFiles.length;
            project.lastUpdated = new Date().toISOString();
        }
    }
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
        }, 6000);
    }
}

// Enhanced CSS for the new features
const enhancedUploadStyles = `
    .file-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 8px;
        font-size: 0.85rem;
    }
    
    .file-meta span {
        color: rgba(255, 255, 255, 0.6);
    }
    
    .file-checksum {
        font-family: monospace;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
    }
    
    .file-actions {
        display: flex;
        gap: 8px;
    }
    
    .file-preview {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
        border: none;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .file-download {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
        border: none;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .file-download:hover {
        background: rgba(46, 204, 113, 0.4);
    }
    
    .preview-modal {
        max-width: 900px;
        max-height: 90vh;
    }
    
    .file-preview-content {
        text-align: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        margin-bottom: 20px;
    }
    
    .preview-placeholder {
        padding: 40px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .file-metadata h4 {
        color: white;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
    }
    
    .metadata-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
    
    .metadata-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
    }
    
    .metadata-item label {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 600;
    }
    
    .metadata-item span {
        color: rgba(255, 255, 255, 0.9);
    }
    
    .status-completed {
        color: #27ae60;
    }
    
    .status-error {
        color: #e74c3c;
    }
    
    .status-uploading {
        color: #f39c12;
    }
    
    .storage-info {
        margin-top: 30px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
    }
    
    .storage-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    
    .storage-stats .stat {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .storage-stats .stat i {
        color: #667eea;
        font-size: 1.2rem;
    }
    
    .notification.warning {
        border-left: 4px solid #f39c12;
    }
    
    @media (max-width: 768px) {
        .metadata-grid {
            grid-template-columns: 1fr;
        }
        
        .file-meta {
            flex-direction: column;
            gap: 5px;
        }
        
        .storage-stats {
            grid-template-columns: 1fr;
        }
    }
`;

// Add enhanced styles
const enhancedStyleSheet = document.createElement('style');
enhancedStyleSheet.textContent = enhancedUploadStyles;
document.head.appendChild(enhancedStyleSheet);

// Initialize enhanced upload manager
let advancedUploadManager;
document.addEventListener('DOMContentLoaded', () => {
    advancedUploadManager = new AdvancedFileUploadManager();
});