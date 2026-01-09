// Press Center JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Press form handling
    const pressForm = document.getElementById('press-form');
    
    if (pressForm) {
        pressForm.addEventListener('submit', handlePressInquiry);
    }
    
    // Download button functionality
    setupDownloadButtons();
    
    // Press release interactions
    setupPressReleases();
    
    function handlePressInquiry(e) {
        e.preventDefault();
        
        const formData = new FormData(pressForm);
        const inquiryData = {
            name: formData.get('name') || pressForm.querySelector('input[type="text"]').value,
            email: formData.get('email') || pressForm.querySelector('input[type="email"]').value,
            outlet: formData.get('outlet') || pressForm.querySelector('input[placeholder*="Media"]').value,
            type: formData.get('type') || pressForm.querySelector('select').value,
            message: formData.get('message') || pressForm.querySelector('textarea').value,
            timestamp: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = pressForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Create email content
        const emailSubject = `Press Inquiry - ${inquiryData.type}`;
        const emailBody = `New Press Inquiry:

Name: ${inquiryData.name}
Email: ${inquiryData.email}
Media Outlet: ${inquiryData.outlet}
Inquiry Type: ${inquiryData.type}
Message: ${inquiryData.message}

Submitted: ${new Date().toLocaleString()}`;
        
        // Send email using mailto
        const mailtoLink = `mailto:press@stonebeamnh.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        setTimeout(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            showToast('Press inquiry prepared! Your email client will open to send the request.', 'success');
            
            // Reset form
            pressForm.reset();
            
            // Store inquiry locally
            storeInquiry(inquiryData);
            
        }, 1000);
    }
    
    function setupDownloadButtons() {
        const downloadBtns = document.querySelectorAll('.download-btn, .download-pdf');
        
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const btnText = btn.textContent.trim();
                
                // Simulate download process
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    
                    if (btnText.includes('Images')) {
                        showToast('High-resolution images package prepared for download.', 'info');
                    } else if (btnText.includes('Assets')) {
                        showToast('Brand assets package prepared for download.', 'info');
                    } else if (btnText.includes('PDF')) {
                        showToast('Company fact sheet prepared for download.', 'info');
                    } else if (btnText.includes('Gallery')) {
                        showToast('Redirecting to video gallery...', 'info');
                    } else {
                        showToast('Media resource prepared for download.', 'info');
                    }
                }, 1500);
            });
        });
    }
    
    function setupPressReleases() {
        const pressItems = document.querySelectorAll('.press-item');
        
        pressItems.forEach(item => {
            const readMoreBtn = item.querySelector('.read-more');
            
            if (readMoreBtn) {
                readMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const title = item.querySelector('h3').textContent;
                    showToast(`Opening full press release: "${title}"`, 'info');
                    
                    // In a real application, this would open the full press release
                    setTimeout(() => {
                        window.open('#', '_blank');
                    }, 500);
                });
            }
        });
    }
    
    function storeInquiry(inquiryData) {
        // Store press inquiries locally
        const existingInquiries = JSON.parse(localStorage.getItem('sb_press_inquiries') || '[]');
        existingInquiries.push(inquiryData);
        localStorage.setItem('sb_press_inquiries', JSON.stringify(existingInquiries));
        
        console.log('Press inquiry stored:', inquiryData);
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
        }, 4000);
    }
    
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.press-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
            const suffix = stat.textContent.replace(/[0-9]/g, '');
            let current = 0;
            const increment = target / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current) + suffix;
            }, 50);
        });
    }
    
    console.log('Press Center initialized successfully');
});