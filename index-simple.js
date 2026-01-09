/**
 * StoneBeam-NH - Main Page Logic (Simplified)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Initialize user state
    initializeUserState();
    
    // Initialize user type modal
    initializeUserTypeModal();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize quick actions
    initializeQuickActions();
    
    // Initialize newsletter
    initializeNewsletter();
    
    // Initialize user dropdown
    initializeUserDropdown();
}

function initializeUserState() {
    const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
    const currentDealer = JSON.parse(sessionStorage.getItem('sb_currentDealer') || 'null');
    
    const userDisplayName = document.getElementById('user-display-name');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    const loginSignupLink = document.getElementById('login-signup-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (!userDisplayName) return;
    
    if (currentUser) {
        const displayName = currentUser.displayName || currentUser.name || 'User';
        const email = currentUser.email || 'user@example.com';
        
        userDisplayName.textContent = displayName;
        if (dropdownUserName) dropdownUserName.textContent = displayName;
        if (dropdownUserEmail) dropdownUserEmail.textContent = email;
        
        if (loginSignupLink) loginSignupLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
    } else if (currentDealer) {
        const displayName = currentDealer.name || currentDealer.businessName || 'Dealer';
        const email = currentDealer.email || 'dealer@example.com';
        
        userDisplayName.textContent = displayName;
        if (dropdownUserName) dropdownUserName.textContent = displayName;
        if (dropdownUserEmail) dropdownUserEmail.textContent = email;
        
        if (loginSignupLink) loginSignupLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        userDisplayName.textContent = 'Guest';
        if (dropdownUserName) dropdownUserName.textContent = 'Guest User';
        if (dropdownUserEmail) dropdownUserEmail.textContent = 'Please login to continue';
        
        if (loginSignupLink) loginSignupLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

function initializeUserTypeModal() {
    const modal = document.getElementById('user-type-modal');
    const userBtn = document.getElementById('user-btn');
    const dealerBtn = document.getElementById('dealer-btn');
    
    if (!modal) return;
    
    // Show modal only if no user is logged in (check sessionStorage only)
    const hasUser = sessionStorage.getItem('sb_currentUser');
    const hasDealer = sessionStorage.getItem('sb_currentDealer');
    
    if (!hasUser && !hasDealer) {
        modal.style.display = 'flex';
    }
    
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            window.location.href = 'login.html';
        });
    }
    
    if (dealerBtn) {
        dealerBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            window.location.href = 'dealer-login.html';
        });
    }
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.textContent.trim() === 'Home') {
                e.preventDefault();
                window.location.href = 'index.html';
                return;
            }
            
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initializeQuickActions() {
    const actionItems = document.querySelectorAll('.action-item');
    
    actionItems.forEach(item => {
        item.addEventListener('click', () => {
            const actionName = item.querySelector('span')?.innerText;
            handleQuickAction(actionName);
        });
    });
}

function handleQuickAction(action) {
    switch (action) {
        case 'Upload Files':
            window.location.href = 'upload-files.html';
            break;
        case 'Schedule':
            window.location.href = 'schedule.html';
            break;
        case 'Premium':
            window.location.href = 'premium.html';
            break;
        case 'Support':
            window.location.href = 'help_support.html';
            break;
        default:
            showNotification('Feature coming soon!', 'info');
    }
}

function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterEmail.value.trim();
        
        if (email && isValidEmail(email)) {
            showNotification('Thank you for subscribing!', 'success');
            newsletterEmail.value = '';
            
            const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
            }
        } else {
            showNotification('Please enter a valid email address.', 'error');
        }
    });
}

function initializeUserDropdown() {
    const userProfileBtn = document.getElementById('user-profile-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutLink = document.getElementById('logout-link');
    const loginSignupLink = document.getElementById('login-signup-link');
    
    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    if (loginSignupLink) {
        loginSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
}

function handleLogout() {
    // Clear all session data
    sessionStorage.clear();
    localStorage.removeItem('sb_isLoggedIn');
    localStorage.removeItem('sb_user_profile');
    
    // Show notification
    showNotification('Logged out successfully!', 'success');
    
    // Redirect after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: auto;">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialize hero buttons
document.addEventListener('DOMContentLoaded', () => {
    const findProjectBtn = document.querySelector('.btn-primary');
    const viewQuotesBtn = document.querySelector('.btn-secondary');
    
    if (findProjectBtn) {
        findProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'new-project.html';
        });
    }
    
    if (viewQuotesBtn) {
        viewQuotesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'view-quotations.html';
        });
    }
});

// Add basic CSS for notifications
const notificationCSS = `
.notification {
    font-family: inherit;
}
.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
    margin-top: 10px;
}
.user-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
.user-dropdown .dropdown-item {
    display: block;
    padding: 10px 15px;
    color: #333;
    text-decoration: none;
    transition: background 0.3s;
}
.user-dropdown .dropdown-item:hover {
    background: #f8f9fa;
}
.user-info {
    padding: 15px;
    border-bottom: 1px solid #eee;
}
.dropdown-divider {
    height: 1px;
    background: #eee;
    margin: 0;
}
`;

const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);