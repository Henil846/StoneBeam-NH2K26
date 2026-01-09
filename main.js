/**
 * Main Application Controller
 * StoneBeam-NH Construction Management
 * Handles core application functionality, routing, and initialization
 */

class MainApp {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.authManager = null;
        this.notifications = [];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupAuthManager();
            this.initializePage();
            this.setupEventListeners();
            this.highlightCurrentNavItem();
            this.initializeMobileNav();
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    setupAuthManager() {
        if (window.authManager) {
            this.authManager = authManager;

            // Listen for auth state changes
            authManager.onAuthStateChanged((user, userType) => {
                this.updatePageForAuth(user, userType);
                this.updateUserInterface(user, userType);
            });
        }
    }

    initializePage() {
        switch (this.currentPage) {
            case 'index':
                this.initializeHomePage();
                break;
            case 'login':
            case 'signup':
                this.initializeAuthPage();
                break;
            case 'profile':
                this.initializeProfilePage();
                break;
            case 'dealer-dashboard':
                this.initializeDealerDashboard();
                break;
            default:
                console.log('Page initialized:', this.currentPage);
        }
    }

    initializeHomePage() {
        console.log('Home page initialized');
        // Home-specific initialization
        this.loadRecentActivity();
        this.initializeNotifications();
    }

    initializeAuthPage() {
        console.log('Auth page initialized');
        // Auth-specific initialization
        this.setupAuthForms();
    }

    initializeProfilePage() {
        console.log('Profile page initialized');
        // Profile-specific initialization
        this.setupProfileForms();
    }

    initializeDealerDashboard() {
        console.log('Dealer dashboard initialized');
        // Dashboard-specific initialization
        this.loadDealerStats();
        this.loadRecentOrders();
    }

    setupEventListeners() {
        // Global event listeners
        this.setupNavigationEvents();
        this.setupNotificationEvents();
        this.setupSearchEvents();
    }

    setupNavigationEvents() {
        // Navigation click handlers
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    // Smooth page transition
                    e.preventDefault();
                    this.navigateWithTransition(href);
                }
            });
        });
    }

    setupNotificationEvents() {
        // Notification bell click
        const notificationBell = document.getElementById('notification-bell');
        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationDropdown();
            });
        }

        // Close notifications on outside click
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notification-dropdown');
            if (dropdown && !dropdown.contains(e.target) && !notificationBell.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    setupSearchEvents() {
        // Search functionality
        const searchIcon = document.getElementById('search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                this.toggleSearchDropdown();
            });
        }
    }

    setupAuthForms() {
        // Form validation and submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    }

    setupProfileForms() {
        // Profile form handling
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate(profileForm);
            });
        }
    }

    updatePageForAuth(user, userType) {
        // Page-specific auth updates
        if (this.currentPage === 'dealer-dashboard' && userType !== 'dealer') {
            // Redirect non-dealers away from dealer dashboard
            window.location.href = 'index.html';
        }
    }

    updateUserInterface(user, userType) {
        // Update UI elements based on auth state
        const userDisplayName = document.getElementById('user-display-name');
        const loginSignupLink = document.getElementById('login-signup-link');
        const logoutLink = document.getElementById('logout-link');

        if (user) {
            // User is logged in
            const displayName = user.displayName || user.name || 'User';

            if (userDisplayName) {
                userDisplayName.textContent = displayName;
            }

            if (loginSignupLink) {
                loginSignupLink.style.display = 'none';
            }

            if (logoutLink) {
                logoutLink.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (userDisplayName) {
                userDisplayName.textContent = 'Guest';
            }

            if (loginSignupLink) {
                loginSignupLink.style.display = 'block';
            }

            if (logoutLink) {
                logoutLink.style.display = 'none';
            }
        }
    }

    highlightCurrentNavItem() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath ||
                (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    initializeMobileNav() {
        // Add mobile navigation toggle if needed
        const navbar = document.querySelector('.navbar');
        if (navbar && window.innerWidth <= 768) {
            this.createMobileNavToggle();
        }
    }

    createMobileNavToggle() {
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelector('.nav-links');

        if (!navbar || !navLinks) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-nav-toggle';
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        toggleBtn.style.cssText = `
            display: none;
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 10px;
        `;

        navbar.appendChild(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            const icon = toggleBtn.querySelector('i');
            icon.className = navLinks.classList.contains('mobile-open')
                ? 'fa-solid fa-times'
                : 'fa-solid fa-bars';
        });

        // Show toggle on mobile
        if (window.innerWidth <= 768) {
            toggleBtn.style.display = 'block';
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                toggleBtn.style.display = 'block';
            } else {
                toggleBtn.style.display = 'none';
                navLinks.classList.remove('mobile-open');
            }
        });
    }

    navigateWithTransition(href) {
        // Add page transition effect
        document.body.style.opacity = '0.7';
        document.body.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }

    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    toggleSearchDropdown() {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    handleFormSubmit(form) {
        // Generic form submission handler
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        console.log('Form submitted:', data);

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        // Simulate API call
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }

            this.showNotification('Form submitted successfully!', 'success');
        }, 1500);
    }

    handleProfileUpdate(form) {
        // Profile update handler
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        console.log('Profile update:', data);

        if (this.authManager) {
            this.authManager.updateProfile(data)
                .then((result) => {
                    if (result.success) {
                        this.showNotification('Profile updated successfully!', 'success');
                    } else {
                        this.showNotification(result.error || 'Profile update failed', 'error');
                    }
                })
                .catch((error) => {
                    console.error('Profile update error:', error);
                    this.showNotification('Profile update failed', 'error');
                });
        }
    }

    loadRecentActivity() {
        // Load and display recent user activity
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
        this.displayActivities(activities);
    }

    loadDealerStats() {
        // Load dealer statistics
        const stats = JSON.parse(localStorage.getItem('dealer_stats') || '{}');
        this.displayDealerStats(stats);
    }

    loadRecentOrders() {
        // Load recent orders for dealer
        const orders = JSON.parse(localStorage.getItem('dealer_orders') || '[]');
        this.displayOrders(orders);
    }

    displayActivities(activities) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p>No recent activity</p>';
            return;
        }

        container.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <i class="fa-solid ${this.getActivityIcon(activity.type)}"></i>
                <div>
                    <strong>${activity.title}</strong>
                    <span>${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    displayDealerStats(stats) {
        const container = document.getElementById('dealer-stats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-item">
                <h3>${stats.totalProjects || 0}</h3>
                <p>Total Projects</p>
            </div>
            <div class="stat-item">
                <h3>${stats.activeQuotations || 0}</h3>
                <p>Active Quotations</p>
            </div>
            <div class="stat-item">
                <h3>${stats.completedOrders || 0}</h3>
                <p>Completed Orders</p>
            </div>
        `;
    }

    displayOrders(orders) {
        const container = document.getElementById('recent-orders');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p>No recent orders</p>';
            return;
        }

        container.innerHTML = orders.slice(0, 5).map(order => `
            <div class="order-item">
                <h4>${order.projectTitle}</h4>
                <p>Status: ${order.status}</p>
                <span>${order.createdAt}</span>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        switch (type) {
            case 'login': return 'fa-sign-in-alt';
            case 'logout': return 'fa-sign-out-alt';
            case 'quote': return 'fa-file-invoice';
            case 'order': return 'fa-shopping-cart';
            case 'profile': return 'fa-user-edit';
            default: return 'fa-circle';
        }
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `app-notification app-notification-${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    initializeNotifications() {
        // Initialize notification system
        this.notifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        const unreadCount = this.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Create global instance
const mainApp = new MainApp();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.mainApp = mainApp;
}
