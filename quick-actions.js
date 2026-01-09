document.addEventListener('DOMContentLoaded', () => {
  const actionItems = document.querySelectorAll('.sidebar-panel.quick-actions .action-item');
  const uploadModal = document.getElementById('qa-upload');
  const scheduleModal = document.getElementById('qa-schedule');
  const premiumModal = document.getElementById('qa-premium');
  const supportModal = document.getElementById('qa-support');

  function openModal(el){ 
    el.classList.add('open'); 
    el.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(el){ 
    el.classList.remove('open'); 
    el.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  function showToast(message, type = 'default', timeout = 3500){
    const t = document.createElement('div');
    t.className = 'qa-toast ' + (type==='success'? 'success': type==='error'? 'error':'' );
    t.innerHTML = `<i class="fa-solid fa-${type==='success'?'check-circle':type==='error'?'exclamation-triangle':'info-circle'}"></i> ${message}`;
    document.body.appendChild(t);
    void t.offsetWidth;
    t.classList.add('show');
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, timeout);
  }

  actionItems.forEach(item => {
    const action = item.dataset.action;
    item.addEventListener('click', () => {
      item.style.transform = 'scale(0.95)';
      setTimeout(() => item.style.transform = '', 150);
      
      if (action === 'upload') openModal(uploadModal);
      if (action === 'schedule') openModal(scheduleModal);
      if (action === 'premium') openModal(premiumModal);
      if (action === 'support') openModal(supportModal);
    });
  });

  document.querySelectorAll('.qa-close').forEach(b => b.addEventListener('click', () => {
    const modal = b.closest('.qa-modal'); if (modal) closeModal(modal);
  }));

  // Enhanced Upload functionality
  const fileInput = document.getElementById('qa-file-input');
  const pickBtn = document.getElementById('qa-pick-btn');
  const preview = document.getElementById('qa-preview');
  const uploadBtn = document.getElementById('qa-upload-btn');
  const clearBtn = document.getElementById('qa-clear-btn');
  const projectSelect = document.getElementById('qa-project-select');
  const categorySelect = document.getElementById('qa-file-category');
  const dropzone = document.getElementById('qa-dropzone');
  const uploadStatusBtn = document.getElementById('qa-upload-status');
  const descriptionInput = document.getElementById('qa-description');
  let filesToUpload = [];

  pickBtn.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const incoming = Array.from(e.target.files || []);
    for (const f of incoming) {
      if (filesToUpload.length >= 20) break;
      if (f.size > 100 * 1024 * 1024) {
        showToast(`File ${f.name} exceeds 100MB limit`, 'error');
        continue;
      }
      filesToUpload.push(f);
    }
    fileInput.value = '';
    renderUploadPreview();
  });

  ['dragenter','dragover'].forEach(ev=>{
    dropzone.addEventListener(ev, (e)=>{ 
      e.preventDefault(); 
      e.stopPropagation(); 
      dropzone.style.borderColor = '#667eea';
      dropzone.style.transform = 'scale(1.02)';
    });
  });
  ['dragleave','drop'].forEach(ev=>{
    dropzone.addEventListener(ev, (e)=>{ 
      e.preventDefault(); 
      e.stopPropagation(); 
      dropzone.style.borderColor = '';
      dropzone.style.transform = '';
    });
  });
  dropzone.addEventListener('drop',(e)=>{
    const incoming = Array.from(e.dataTransfer.files || []);
    for (const f of incoming){ 
      if (filesToUpload.length >= 20) break; 
      if (f.size > 100 * 1024 * 1024) {
        showToast(`File ${f.name} exceeds 100MB limit`, 'error');
        continue;
      }
      filesToUpload.push(f); 
    }
    renderUploadPreview();
  });

  function renderUploadPreview(){
    preview.innerHTML = '';
    const fileCount = document.getElementById('file-count');
    const totalSize = document.getElementById('total-size');
    
    let totalBytes = 0;
    filesToUpload.forEach((f, idx) => {
      totalBytes += f.size;
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      const fileIcon = getFileIcon(f.type);
      const fileSize = formatFileSize(f.size);
      
      fileItem.innerHTML = `
        <div class="file-icon">${fileIcon}</div>
        <div class="file-name">${f.name}</div>
        <div class="file-size">${fileSize}</div>
        <div class="file-progress">
          <div class="progress-bar" style="width:0%"></div>
        </div>
        <button class="file-remove" onclick="removeFile(${idx})">Remove</button>
      `;
      preview.appendChild(fileItem);
    });
    
    fileCount.textContent = `${filesToUpload.length} file${filesToUpload.length !== 1 ? 's' : ''} selected`;
    totalSize.textContent = formatFileSize(totalBytes);
    uploadStatusBtn.textContent = filesToUpload.length ? `${filesToUpload.length} files ready` : 'Ready to upload';
  }
  
  function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '<i class="fa-solid fa-image"></i>';
    if (fileType.includes('pdf')) return '<i class="fa-solid fa-file-pdf"></i>';
    if (fileType.includes('word') || fileType.includes('document')) return '<i class="fa-solid fa-file-word"></i>';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '<i class="fa-solid fa-file-excel"></i>';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '<i class="fa-solid fa-file-powerpoint"></i>';
    if (fileType.includes('zip') || fileType.includes('archive')) return '<i class="fa-solid fa-file-archive"></i>';
    return '<i class="fa-solid fa-file"></i>';
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  window.removeFile = function(index) {
    filesToUpload.splice(index, 1);
    renderUploadPreview();
  };

  uploadBtn.addEventListener('click', async () => {
    if (!filesToUpload.length) return showToast('No files selected', 'error');
    if (!projectSelect.value) return showToast('Please select a project', 'error');
    
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    
    try {
      const fileItems = preview.querySelectorAll('.file-item');
      
      // Simulate upload with progress
      for (let i = 0; i < filesToUpload.length; i++) {
        const progressBar = fileItems[i]?.querySelector('.progress-bar');
        
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          if (progressBar) progressBar.style.width = progress + '%';
          uploadStatusBtn.textContent = `Uploading ${Math.round((i * 100 + progress) / filesToUpload.length)}%`;
        }
      }
      
      // Save to localStorage for dealer visibility
      const uploadData = {
        id: Date.now(),
        project: projectSelect.value,
        category: categorySelect.value,
        description: descriptionInput.value,
        files: filesToUpload.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          uploadedAt: new Date().toISOString()
        })),
        uploadedBy: 'user',
        uploadedAt: new Date().toISOString()
      };
      
      const existingUploads = JSON.parse(localStorage.getItem('projectUploads') || '[]');
      existingUploads.push(uploadData);
      localStorage.setItem('projectUploads', JSON.stringify(existingUploads));
      
      showToast('Files uploaded successfully! Dealers can now view them.', 'success');
      filesToUpload = [];
      renderUploadPreview();
      uploadStatusBtn.textContent = 'Upload complete';
      descriptionInput.value = '';
      setTimeout(() => closeModal(uploadModal), 1000);
    } catch (err) { 
      showToast('Upload failed: ' + (err.message || err), 'error'); 
    } finally { 
      uploadBtn.disabled = false; 
      uploadBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload Files';
    }
  });

  clearBtn.addEventListener('click', ()=>{ 
    filesToUpload = []; 
    renderUploadPreview(); 
    uploadStatusBtn.textContent = 'Ready to upload'; 
    showToast('Files cleared', 'success');
  });

  // Load projects
  (async function loadProjects(){
    const projects = [
      {id: 'residential-complex-a', name: 'Residential Complex A'},
      {id: 'commercial-building-b', name: 'Commercial Building B'},
      {id: 'infrastructure-project-c', name: 'Infrastructure Project C'},
      {id: 'shopping-mall-d', name: 'Shopping Mall Development'},
      {id: 'office-tower-e', name: 'Office Tower Construction'}
    ];
    
    projectSelect.innerHTML = '<option value="">Choose project...</option>' + 
      projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  })();

  // Schedule functionality
  const dtInput = document.getElementById('qa-datetime');
  const notesInput = document.getElementById('qa-notes');
  const saveSchedule = document.getElementById('qa-schedule-save');
  
  saveSchedule.addEventListener('click', async ()=>{
    const when = dtInput.value; 
    const notes = notesInput.value.trim();
    if (!when) return showToast('Please select date and time', 'error');
    
    saveSchedule.disabled = true;
    saveSchedule.textContent = 'Saving...';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast('Schedule saved successfully!', 'success'); 
    closeModal(scheduleModal); 
    dtInput.value=''; 
    notesInput.value='';
    saveSchedule.disabled = false;
    saveSchedule.textContent = 'Save';
  });

  // Premium functionality
  const subscribeBtn = document.getElementById('qa-subscribe-btn');
  subscribeBtn.addEventListener('click', async ()=>{
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = 'Starting Trial...';
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showToast('Premium trial started! Welcome to Premium!', 'success');
    closeModal(premiumModal);
    subscribeBtn.disabled = false;
    subscribeBtn.textContent = 'Start Free Trial';
  });

  // Support functionality
  const supportSend = document.getElementById('qa-send-support');
  const subj = document.getElementById('qa-subject');
  const msg = document.getElementById('qa-message');
  
  supportSend.addEventListener('click', async ()=>{
    const subject = subj.value.trim(); 
    const message = msg.value.trim();
    if (!subject || !message) return showToast('Please fill subject and message', 'error');
    
    supportSend.disabled = true;
    supportSend.textContent = 'Sending...';
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    showToast('Support request sent successfully!', 'success'); 
    subj.value=''; 
    msg.value=''; 
    closeModal(supportModal);
    supportSend.disabled = false;
    supportSend.textContent = 'Send';
  });

  // Close modal on outside click
  document.addEventListener('click', (e)=>{
    const modals = [uploadModal, scheduleModal, premiumModal, supportModal];
    modals.forEach(m=>{ 
      if (!m) return; 
      if (m.classList.contains('open') && !m.contains(e.target) && !e.target.closest('.action-item')){ 
        closeModal(m); 
      } 
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.qa-modal.open');
      if (openModal) closeModal(openModal);
    }
  });
});