/**
 * Create Post Page Functionality
 * StoneBeam-NH Blog System
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('create-post-form');
    const excerptTextarea = document.getElementById('post-excerpt');
    const charCount = document.querySelector('.char-count');
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    const editor = document.getElementById('post-content');
    const saveDraftBtn = document.getElementById('save-draft');
    
    // Character counter for excerpt
    excerptTextarea.addEventListener('input', () => {
        const count = excerptTextarea.value.length;
        charCount.textContent = `${count}/200`;
        charCount.style.color = count > 180 ? '#e74c3c' : '#666';
    });
    
    // Image upload preview
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Drag and drop for image
    imagePreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreview.classList.add('drag-over');
    });
    
    imagePreview.addEventListener('dragleave', () => {
        imagePreview.classList.remove('drag-over');
    });
    
    imagePreview.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreview.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            imageInput.files = files;
            const event = new Event('change');
            imageInput.dispatchEvent(event);
        }
    });
    
    imagePreview.addEventListener('click', () => {
        imageInput.click();
    });
    
    // Rich text editor functionality
    const editorBtns = document.querySelectorAll('.editor-btn');
    editorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.getAttribute('data-command');
            
            if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            editor.focus();
        });
    });
    
    // Editor placeholder
    editor.addEventListener('focus', () => {
        if (editor.textContent.trim() === '') {
            editor.innerHTML = '';
        }
    });
    
    editor.addEventListener('blur', () => {
        if (editor.textContent.trim() === '') {
            editor.innerHTML = '';
        }
    });
    
    // Save draft functionality
    saveDraftBtn.addEventListener('click', () => {
        const postData = getFormData();
        postData.status = 'draft';
        postData.id = Date.now().toString();
        
        // Save to localStorage
        const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
        drafts.push(postData);
        localStorage.setItem('blog_drafts', JSON.stringify(drafts));
        
        showNotification('Draft saved successfully!', 'success');
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const postData = getFormData();
            postData.status = 'published';
            postData.id = Date.now().toString();
            postData.publishDate = new Date().toISOString();
            postData.views = 0;
            postData.likes = 0;
            postData.comments = 0;
            
            // Save to localStorage
            const posts = JSON.parse(localStorage.getItem('user_blog_posts') || '[]');
            posts.unshift(postData);
            localStorage.setItem('user_blog_posts', JSON.stringify(posts));
            
            showNotification('Post published successfully!', 'success');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'blog.html';
            }, 2000);
        }
    });
    
    function getFormData() {
        return {
            title: document.getElementById('post-title').value.trim(),
            category: document.getElementById('post-category').value,
            excerpt: document.getElementById('post-excerpt').value.trim(),
            content: editor.innerHTML,
            tags: document.getElementById('post-tags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag),
            image: imagePreview.querySelector('img')?.src || '',
            author: getCurrentUser() || 'Anonymous',
            createdAt: new Date().toISOString()
        };
    }
    
    function validateForm() {
        const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const excerpt = document.getElementById('post-excerpt').value.trim();
        const content = editor.textContent.trim();
        
        if (!title) {
            showNotification('Please enter a post title.', 'error');
            return false;
        }
        
        if (!category) {
            showNotification('Please select a category.', 'error');
            return false;
        }
        
        if (!excerpt) {
            showNotification('Please enter a post excerpt.', 'error');
            return false;
        }
        
        if (!content) {
            showNotification('Please enter post content.', 'error');
            return false;
        }
        
        if (content.length < 100) {
            showNotification('Post content should be at least 100 characters long.', 'error');
            return false;
        }
        
        return true;
    }
    
    function getCurrentUser() {
        const user = JSON.parse(sessionStorage.getItem('sb_currentUser') || '{}');
        return user.displayName || user.email || 'Anonymous';
    }
    
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fa-solid fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }
    
    // Load draft if editing
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('draft');
    if (draftId) {
        loadDraft(draftId);
    }
    
    function loadDraft(draftId) {
        const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
        const draft = drafts.find(d => d.id === draftId);
        
        if (draft) {
            document.getElementById('post-title').value = draft.title;
            document.getElementById('post-category').value = draft.category;
            document.getElementById('post-excerpt').value = draft.excerpt;
            document.getElementById('post-tags').value = draft.tags.join(', ');
            editor.innerHTML = draft.content;
            
            if (draft.image) {
                imagePreview.innerHTML = `<img src="${draft.image}" alt="Preview">`;
                imagePreview.classList.add('has-image');
            }
            
            excerptTextarea.dispatchEvent(new Event('input'));
        }
    }
});

// CSS Styles for Create Post Page
const createPostStyles = document.createElement('style');
createPostStyles.textContent = `
    .create-post-container {
        min-height: calc(100vh - 200px);
        padding: 40px 0;
        background: #f8f9fa;
    }
    
    .create-post-header {
        text-align: center;
        margin-bottom: 40px;
    }
    
    .create-post-header h1 {
        color: #333;
        margin-bottom: 10px;
        font-size: 2.5rem;
    }
    
    .create-post-header p {
        color: #666;
        font-size: 1.1rem;
    }
    
    .create-post-form {
        background: white;
        border-radius: 15px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        max-width: 800px;
        margin: 0 auto;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group {
        margin-bottom: 25px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s ease;
        outline: none;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        border-color: #8e44ad;
    }
    
    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }
    
    .char-count {
        display: block;
        text-align: right;
        font-size: 12px;
        color: #666;
        margin-top: 5px;
    }
    
    .image-upload {
        position: relative;
    }
    
    .image-upload input[type="file"] {
        display: none;
    }
    
    .image-preview {
        border: 2px dashed #e9ecef;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .image-preview:hover,
    .image-preview.drag-over {
        border-color: #8e44ad;
        background: #f8f9fa;
    }
    
    .image-preview i {
        font-size: 2rem;
        color: #8e44ad;
        margin-bottom: 10px;
    }
    
    .image-preview.has-image {
        padding: 0;
        border: none;
    }
    
    .image-preview img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .editor-toolbar {
        display: flex;
        gap: 5px;
        margin-bottom: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px 8px 0 0;
        border: 2px solid #e9ecef;
        border-bottom: none;
    }
    
    .editor-btn {
        background: white;
        border: 1px solid #ddd;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .editor-btn:hover {
        background: #8e44ad;
        color: white;
        border-color: #8e44ad;
    }
    
    .editor-content {
        min-height: 300px;
        padding: 15px;
        border: 2px solid #e9ecef;
        border-radius: 0 0 8px 8px;
        outline: none;
        line-height: 1.6;
    }
    
    .editor-content:focus {
        border-color: #8e44ad;
    }
    
    .editor-content:empty:before {
        content: "Write your post content here...";
        color: #999;
    }
    
    .form-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e9ecef;
    }
    
    .btn-secondary,
    .btn-draft,
    .btn-primary {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #5a6268;
    }
    
    .btn-draft {
        background: #ffc107;
        color: #212529;
    }
    
    .btn-draft:hover {
        background: #e0a800;
    }
    
    .btn-primary {
        background: #8e44ad;
        color: white;
    }
    
    .btn-primary:hover {
        background: #6c3483;
    }
    
    .blog-actions {
        display: flex;
        gap: 15px;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .write-post-btn {
        background: #8e44ad;
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .write-post-btn:hover {
        background: #6c3483;
        transform: translateY(-2px);
    }
    
    .blog-header-actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .create-post-form {
            padding: 20px;
            margin: 0 20px;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .editor-toolbar {
            flex-wrap: wrap;
        }
    }
`;
document.head.appendChild(createPostStyles);