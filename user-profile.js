// User Profile JavaScript - Real Web Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

let userProfile = {};

function initializeProfile() {
    loadUserProfile();
    setupNavigation();
    setupForms();
    setupAvatarUpload();
    loadActivityLog();
    updateProfileDisplay();
}

function loadUserProfile() {
    // Load from localStorage or set defaults
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    } else {
        userProfile = {
            personal: {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-15',
                gender: 'male',
                bio: 'Construction enthusiast with 5+ years of experience in home renovation projects.',
                avatar: null
            },
            contact: {
                email: 'john.doe@email.com',
                phone: '+1-555-0123',
                alternatePhone: '',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'US'
            },
            preferences: {
                language: 'en',
                timezone: 'EST',
                currency: 'USD',
                projectTypes: ['residential', 'renovation']
            },
            security: {
                twoFactorAuth: false,
                loginNotifications: true
            },
            notifications: {
                emailQuotes: true,
                emailUpdates: true,
                emailMarketing: false
            },
            stats: {
                totalRequests: 12,
                activeProjects: 3,
                completedProjects: 9,
                memberSince: '2023-01-15'
            }
        };
        saveUserProfile();
    }
}

function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function updateProfileDisplay() {
    // Update header information
    document.getElementById('profileName').textContent = `${userProfile.personal.firstName} ${userProfile.personal.lastName}`;
    document.getElementById('profileEmail').textContent = userProfile.contact.email;
    document.getElementById('profileLocation').textContent = `${userProfile.contact.city}, ${userProfile.contact.state}`;
    
    // Update stats
    document.getElementById('totalRequests').textContent = userProfile.stats.totalRequests;
    document.getElementById('activeProjects').textContent = userProfile.stats.activeProjects;
    document.getElementById('completedProjects').textContent = userProfile.stats.completedProjects;
    
    // Update avatar
    const avatarText = document.getElementById('avatarText');
    if (userProfile.personal.avatar) {
        avatarText.style.backgroundImage = `url(${userProfile.personal.avatar})`;
        avatarText.style.backgroundSize = 'cover';
        avatarText.textContent = '';
    } else {
        avatarText.textContent = `${userProfile.personal.firstName[0]}${userProfile.personal.lastName[0]}`;
    }
    
    // Populate forms
    populateForms();
}

function populateForms() {
    // Personal form
    Object.keys(userProfile.personal).forEach(key => {
        const element = document.getElementById(key);
        if (element && key !== 'avatar') {
            element.value = userProfile.personal[key];
        }
    });
    
    // Contact form
    Object.keys(userProfile.contact).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = userProfile.contact[key];
        }
    });
    
    // Preferences form
    Object.keys(userProfile.preferences).forEach(key => {
        if (key === 'projectTypes') {
            const checkboxes = document.querySelectorAll('input[name=\"projectTypes\"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = userProfile.preferences.projectTypes.includes(checkbox.value);
            });
        } else {
            const element = document.getElementById(key);
            if (element) {
                element.value = userProfile.preferences[key];
            }
        }
    });
    
    // Security settings
    document.getElementById('twoFactorAuth').checked = userProfile.security.twoFactorAuth;
    document.getElementById('loginNotifications').checked = userProfile.security.loginNotifications;
    
    // Notification settings
    Object.keys(userProfile.notifications).forEach(key => {
        const element = document.querySelector(`input[name=\"${key}\"]`);
        if (element) {
            element.checked = userProfile.notifications[key];
        }
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items and sections
            navItems.forEach(ni => ni.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.dataset.section;
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function setupForms() {
    // Personal form
    document.getElementById('personalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        Object.keys(userProfile.personal).forEach(key => {
            if (key !== 'avatar' && formData.has(key)) {
                userProfile.personal[key] = formData.get(key);
            }
        });
        
        saveUserProfile();
        updateProfileDisplay();
        showNotification('Personal information updated successfully!', 'success');
    });
    
    // Contact form
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        Object.keys(userProfile.contact).forEach(key => {
            if (formData.has(key)) {
                userProfile.contact[key] = formData.get(key);
            }
        });
        
        saveUserProfile();
        updateProfileDisplay();
        showNotification('Contact details updated successfully!', 'success');
    });
    
    // Preferences form
    document.getElementById('preferencesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Handle regular fields
        ['language', 'timezone', 'currency'].forEach(key => {
            if (formData.has(key)) {
                userProfile.preferences[key] = formData.get(key);
            }
        });
        
        // Handle project types checkboxes
        const projectTypes = [];
        const checkboxes = document.querySelectorAll('input[name=\"projectTypes\"]:checked');
        checkboxes.forEach(checkbox => {
            projectTypes.push(checkbox.value);
        });
        userProfile.preferences.projectTypes = projectTypes;
        
        saveUserProfile();
        showNotification('Preferences saved successfully!', 'success');
    });
    
    // Password form
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        const currentPassword = formData.get('currentPassword');\n        const newPassword = formData.get('newPassword');\n        const confirmPassword = formData.get('confirmPassword');\n        \n        if (!currentPassword || !newPassword || !confirmPassword) {\n            showNotification('Please fill in all password fields.', 'error');\n            return;\n        }\n        \n        if (newPassword !== confirmPassword) {\n            showNotification('New passwords do not match.', 'error');\n            return;\n        }\n        \n        if (newPassword.length < 8) {\n            showNotification('Password must be at least 8 characters long.', 'error');\n            return;\n        }\n        \n        // Simulate password update\n        setTimeout(() => {\n            showNotification('Password updated successfully!', 'success');\n            this.reset();\n        }, 1000);\n    });\n    \n    // Notification form\n    document.getElementById('notificationForm').addEventListener('submit', function(e) {\n        e.preventDefault();\n        \n        const emailQuotes = document.querySelector('input[name=\"emailQuotes\"]').checked;\n        const emailUpdates = document.querySelector('input[name=\"emailUpdates\"]').checked;\n        const emailMarketing = document.querySelector('input[name=\"emailMarketing\"]').checked;\n        \n        userProfile.notifications = {\n            emailQuotes,\n            emailUpdates,\n            emailMarketing\n        };\n        \n        saveUserProfile();\n        showNotification('Notification settings updated!', 'success');\n    });\n    \n    // Security toggles\n    document.getElementById('twoFactorAuth').addEventListener('change', function() {\n        userProfile.security.twoFactorAuth = this.checked;\n        saveUserProfile();\n        \n        if (this.checked) {\n            showNotification('Two-factor authentication enabled!', 'success');\n            // In a real app, this would trigger 2FA setup\n        } else {\n            showNotification('Two-factor authentication disabled.', 'info');\n        }\n    });\n    \n    document.getElementById('loginNotifications').addEventListener('change', function() {\n        userProfile.security.loginNotifications = this.checked;\n        saveUserProfile();\n        showNotification('Login notification settings updated!', 'success');\n    });\n}\n\nfunction setupAvatarUpload() {\n    const avatarInput = document.getElementById('avatarInput');\n    \n    avatarInput.addEventListener('change', function(e) {\n        const file = e.target.files[0];\n        if (!file) return;\n        \n        // Validate file type\n        if (!file.type.startsWith('image/')) {\n            showNotification('Please select a valid image file.', 'error');\n            return;\n        }\n        \n        // Validate file size (max 5MB)\n        if (file.size > 5 * 1024 * 1024) {\n            showNotification('Image size must be less than 5MB.', 'error');\n            return;\n        }\n        \n        const reader = new FileReader();\n        reader.onload = function(e) {\n            userProfile.personal.avatar = e.target.result;\n            saveUserProfile();\n            updateProfileDisplay();\n            showNotification('Profile picture updated!', 'success');\n        };\n        reader.readAsDataURL(file);\n    });\n}\n\nfunction loadActivityLog() {\n    const activityList = document.getElementById('activityList');\n    \n    // Generate sample activity data\n    const activities = [\n        {\n            icon: 'fa-file-invoice-dollar',\n            title: 'New quotation request submitted',\n            description: 'Kitchen renovation project - $25K budget',\n            time: '2 hours ago',\n            type: 'request'\n        },\n        {\n            icon: 'fa-user-check',\n            title: 'Profile information updated',\n            description: 'Contact details and preferences modified',\n            time: '1 day ago',\n            type: 'profile'\n        },\n        {\n            icon: 'fa-quote-left',\n            title: 'Quote received',\n            description: 'Elite Kitchen Solutions - $42,000',\n            time: '2 days ago',\n            type: 'quote'\n        },\n        {\n            icon: 'fa-sign-in-alt',\n            title: 'Account login',\n            description: 'Logged in from New York, NY',\n            time: '3 days ago',\n            type: 'security'\n        },\n        {\n            icon: 'fa-check-circle',\n            title: 'Project completed',\n            description: 'Bathroom renovation project finished',\n            time: '1 week ago',\n            type: 'project'\n        }\n    ];\n    \n    activityList.innerHTML = activities.map(activity => `\n        <div class=\"activity-item\">\n            <div class=\"activity-icon\">\n                <i class=\"fa-solid ${activity.icon}\"></i>\n            </div>\n            <div class=\"activity-content\">\n                <h4>${activity.title}</h4>\n                <p>${activity.description}</p>\n            </div>\n            <div class=\"activity-time\">${activity.time}</div>\n        </div>\n    `).join('');\n}\n\nfunction confirmDeleteAccount() {\n    const confirmation = prompt('Type \"DELETE\" to confirm account deletion:');\n    \n    if (confirmation === 'DELETE') {\n        // Simulate account deletion\n        showNotification('Account deletion initiated. You will receive a confirmation email.', 'info');\n        \n        setTimeout(() => {\n            if (confirm('This is a demo. Account deletion cancelled. Continue?')) {\n                showNotification('Account deletion cancelled.', 'success');\n            }\n        }, 3000);\n    } else if (confirmation !== null) {\n        showNotification('Account deletion cancelled.', 'info');\n    }\n}\n\nfunction showNotification(message, type = 'info') {\n    const notification = document.createElement('div');\n    notification.className = `toast-notification toast-${type}`;\n    notification.innerHTML = `\n        <div class=\"toast-content\">\n            <i class=\"fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}\"></i>\n            <span>${message}</span>\n        </div>\n        <button class=\"toast-close\" onclick=\"this.parentElement.remove()\">\n            <i class=\"fa-solid fa-times\"></i>\n        </button>\n    `;\n    \n    document.body.appendChild(notification);\n    \n    setTimeout(() => notification.classList.add('show'), 100);\n    setTimeout(() => {\n        notification.classList.remove('show');\n        setTimeout(() => notification.remove(), 300);\n    }, 5000);\n}\n\n// Export profile data\nfunction exportProfileData() {\n    const dataStr = JSON.stringify(userProfile, null, 2);\n    const dataBlob = new Blob([dataStr], {type: 'application/json'});\n    const url = URL.createObjectURL(dataBlob);\n    \n    const link = document.createElement('a');\n    link.href = url;\n    link.download = 'profile-data.json';\n    link.click();\n    \n    URL.revokeObjectURL(url);\n    showNotification('Profile data exported successfully!', 'success');\n}\n\n// Add toast notification styles\nconst toastCSS = `\n.toast-notification {\n    position: fixed;\n    top: 20px;\n    right: 20px;\n    background: #1a1a1a;\n    border: 1px solid #333;\n    border-radius: 8px;\n    padding: 15px;\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    z-index: 10000;\n    transform: translateX(100%);\n    transition: transform 0.3s ease;\n    max-width: 400px;\n    box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n}\n\n.toast-notification.show {\n    transform: translateX(0);\n}\n\n.toast-success { border-left: 4px solid #27ae60; }\n.toast-error { border-left: 4px solid #e74c3c; }\n.toast-info { border-left: 4px solid #3498db; }\n\n.toast-content {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    flex: 1;\n    color: #fff;\n}\n\n.toast-close {\n    background: none;\n    border: none;\n    color: #666;\n    cursor: pointer;\n    padding: 5px;\n    border-radius: 4px;\n    transition: all 0.3s ease;\n}\n\n.toast-close:hover {\n    color: #fff;\n    background: rgba(255,255,255,0.1);\n}\n`;\n\nconst style = document.createElement('style');\nstyle.textContent = toastCSS;\ndocument.head.appendChild(style);