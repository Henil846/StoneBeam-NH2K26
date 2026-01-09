// Services Page - Professional Construction Services JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Service data for dynamic content
    const servicesData = {
        residential: {
            title: 'Residential Construction',
            description: 'Custom homes and residential projects',
            basePrice: 1500000,
            features: ['Custom Design', 'Premium Materials', 'Interior Design', 'Landscaping']
        },
        commercial: {
            title: 'Commercial Construction',
            description: 'Office buildings and commercial spaces',
            basePrice: 5000000,
            features: ['Modern Architecture', 'HVAC Systems', 'Security Systems', 'Parking Facilities']
        },
        industrial: {
            title: 'Industrial Construction',
            description: 'Manufacturing and industrial facilities',
            basePrice: 20000000,
            features: ['Heavy Infrastructure', 'Specialized Equipment', 'Safety Systems', 'Utility Connections']
        },
        renovation: {
            title: 'Renovation & Remodeling',
            description: 'Transform existing spaces',
            basePrice: 800000,
            features: ['Space Planning', 'Modern Upgrades', 'Energy Efficiency', 'Quality Finishes']
        },
        infrastructure: {
            title: 'Infrastructure Development',
            description: 'Roads, bridges, and public infrastructure',
            basePrice: 50000000,
            features: ['Road Construction', 'Bridge Engineering', 'Drainage Systems', 'Traffic Management']
        },
        consulting: {
            title: 'Project Management & Consulting',
            description: 'Expert guidance and project management',
            basePrice: 200000,
            features: ['Project Planning', 'Cost Management', 'Quality Control', 'Timeline Management']
        }
    };

    // DOM Elements
    const serviceButtons = document.querySelectorAll('.service-btn');
    const quoteForm = document.getElementById('service-quote-form');
    const modalQuoteForm = document.getElementById('modal-quote-form');
    const quoteModal = document.getElementById('quote-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const cancelQuoteBtn = document.getElementById('cancel-quote');
    const modalServiceTitle = document.getElementById('modal-service-title');

    // Initialize page
    init();

    function init() {
        setupEventListeners();
        animateOnScroll();
        updateStats();
    }

    function setupEventListeners() {
        // Service quote buttons
        serviceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceType = e.target.dataset.service;
                openQuoteModal(serviceType);
            });
        });

        // Main quote form
        if (quoteForm) {
            quoteForm.addEventListener('submit', handleQuoteSubmission);
        }

        // Modal quote form
        if (modalQuoteForm) {
            modalQuoteForm.addEventListener('submit', handleModalQuoteSubmission);
        }

        // Close modal buttons
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        // Cancel quote button
        if (cancelQuoteBtn) {
            cancelQuoteBtn.addEventListener('click', closeModal);
        }

        // Close modal on outside click
        if (quoteModal) {
            quoteModal.addEventListener('click', (e) => {
                if (e.target === quoteModal) closeModal();
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Contact method interactions
        setupContactMethods();

        // Service card hover effects
        setupServiceCardEffects();
    }

    function openQuoteModal(serviceType) {
        const service = servicesData[serviceType];
        if (!service) return;

        modalServiceTitle.textContent = `Request Quote - ${service.title}`;
        
        // Pre-fill service type in modal form
        const serviceSelect = modalQuoteForm.querySelector('select');
        if (serviceSelect) {
            serviceSelect.value = serviceType;
        }

        quoteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        quoteModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function handleQuoteSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(quoteForm);
        const quoteData = {
            name: formData.get('name') || quoteForm.querySelector('input[type=\"text\"]').value,
            email: formData.get('email') || quoteForm.querySelector('input[type=\"email\"]').value,
            phone: formData.get('phone') || quoteForm.querySelector('input[type=\"tel\"]').value,
            service: formData.get('service') || quoteForm.querySelector('select').value,
            location: formData.get('location') || quoteForm.querySelector('input[placeholder*=\"Location\"]').value,
            details: formData.get('details') || quoteForm.querySelector('textarea').value,
            timestamp: new Date().toISOString()
        };

        // Simulate form submission
        submitQuoteRequest(quoteData);
    }

    function handleModalQuoteSubmission(e) {
        e.preventDefault();
        
        const inputs = modalQuoteForm.querySelectorAll('input, select, textarea');
        const quoteData = {
            name: inputs[0].value,
            email: inputs[1].value,
            phone: inputs[2].value,
            location: inputs[3].value,
            budget: inputs[4].value,
            timeline: inputs[5].value,
            details: inputs[6].value,
            service: modalServiceTitle.textContent.split(' - ')[1] || 'General',
            timestamp: new Date().toISOString()
        };

        submitQuoteRequest(quoteData);
        closeModal();
    }

    function submitQuoteRequest(quoteData) {
        // Show loading state
        const submitBtn = document.activeElement;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class=\"fa-solid fa-spinner fa-spin\"></i> Submitting...';
        submitBtn.disabled = true;

        // Create email content
        const emailSubject = `Quote Request - ${quoteData.service || 'General'}`;
        const emailBody = `New Quote Request:

Name: ${quoteData.name}
Email: ${quoteData.email}
Phone: ${quoteData.phone}
Service: ${quoteData.service || 'General'}
Location: ${quoteData.location}
Budget: ${quoteData.budget || 'Not specified'}
Timeline: ${quoteData.timeline || 'Not specified'}
Details: ${quoteData.details}

Submitted: ${new Date().toLocaleString()}`;

        // Send email using mailto
        const mailtoLink = `mailto:stonebeamnh@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        setTimeout(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            showToast('Quote request prepared! Your email client will open to send the request.', 'success');
            
            // Reset forms
            if (quoteForm) quoteForm.reset();
            if (modalQuoteForm) modalQuoteForm.reset();

            // Store quote request locally
            storeQuoteRequest(quoteData);

        }, 1000);
    }

    function storeQuoteRequest(quoteData) {
        // In a real application, this would send data to a server
        const existingQuotes = JSON.parse(localStorage.getItem('sb_quote_requests') || '[]');
        existingQuotes.push(quoteData);
        localStorage.setItem('sb_quote_requests', JSON.stringify(existingQuotes));
        
        console.log('Quote request stored:', quoteData);
    }

    function setupContactMethods() {
        const contactMethods = document.querySelectorAll('.contact-method');
        
        contactMethods.forEach(method => {
            method.addEventListener('click', () => {
                const icon = method.querySelector('i');
                const info = method.querySelector('.method-info p').textContent;
                
                if (icon.classList.contains('fa-phone')) {
                    window.open(`tel:${info.replace(/[^0-9+]/g, '')}`);
                } else if (icon.classList.contains('fa-envelope')) {
                    window.open(`mailto:${info}`);
                } else if (icon.classList.contains('fa-map-marker-alt')) {
                    window.open(`https://maps.google.com/?q=${encodeURIComponent(info)}`);
                }
            });
            
            // Add hover effect
            method.style.cursor = 'pointer';
            method.addEventListener('mouseenter', () => {
                method.style.transform = 'translateX(10px)';
                method.style.transition = 'transform 0.3s ease';
            });
            
            method.addEventListener('mouseleave', () => {
                method.style.transform = 'translateX(0)';
            });
        });
    }

    function setupServiceCardEffects() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            // Add click effect
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('service-btn')) {
                    const btn = card.querySelector('.service-btn');
                    if (btn) btn.click();
                }
            });

            // Add parallax effect on mouse move
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    function animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Animate service cards
        document.querySelectorAll('.service-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });

        // Animate process steps
        document.querySelectorAll('.process-step').forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(30px)';
            step.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(step);
        });

        // Animate specialty items
        document.querySelectorAll('.specialty-item').forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(item);
        });
    }

    function updateStats() {
        // Animate counter numbers
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

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class=\"fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}\"></i>
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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl/Cmd + Enter to submit forms
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeForm = document.querySelector('form:focus-within');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Add loading states to buttons
    document.querySelectorAll('button[type=\"submit\"]').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.form && this.form.checkValidity()) {
                this.style.position = 'relative';
                this.classList.add('loading');
            }
        });
    });

    // Price calculator (simple estimation)
    function calculateEstimate(serviceType, budget, timeline) {
        const service = servicesData[serviceType];
        if (!service) return null;

        let multiplier = 1;
        
        // Budget-based multiplier
        if (budget === '5-15') multiplier = 0.8;
        else if (budget === '15-50') multiplier = 1.0;
        else if (budget === '50-100') multiplier = 1.3;
        else if (budget === '100+') multiplier = 1.8;

        // Timeline-based adjustment
        if (timeline === '1-3') multiplier *= 1.2; // Rush job
        else if (timeline === '3-6') multiplier *= 1.0;
        else if (timeline === '6-12') multiplier *= 0.9;
        else if (timeline === '12+') multiplier *= 0.8;

        return {
            basePrice: service.basePrice,
            estimatedPrice: Math.round(service.basePrice * multiplier),
            timeline: timeline,
            features: service.features
        };
    }

    // Export functions for potential use by other scripts
    window.ServicesPage = {
        openQuoteModal,
        closeModal,
        calculateEstimate,
        showToast
    };

    // Initialize smooth scrolling for navigation
    const navLinks = document.querySelectorAll('.nav-links a[href^=\"#\"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll-based navbar background
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(44, 62, 80, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '';
            navbar.style.backdropFilter = '';
        }
    });

    console.log('Services page initialized successfully');
});