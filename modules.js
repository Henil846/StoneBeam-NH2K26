/**
 * Notification, Search, and Profile Modules
 * StoneBeam-NH Construction Management
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Notification System ---
    let notifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');

    function initNotifications() {
        const notificationBell = document.getElementById('notification-bell');
        const notificationBadge = document.getElementById('notification-badge');
        const notificationDropdown = document.getElementById('notification-dropdown');
        const notificationList = document.getElementById('notification-list');
        const markAllReadBtn = document.getElementById('mark-all-read');

        if (!notificationBell) return;

        updateNotificationBadge();
        renderNotifications();

        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        markAllReadBtn.addEventListener('click', () => {
            if (!markAllReadBtn) return;
            notifications.forEach(n => n.read = true);
            localStorage.setItem('user_notifications', JSON.stringify(notifications));
            updateNotificationBadge();
            renderNotifications();
        });

        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBell.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }

    function updateNotificationBadge() {
        const notificationBadge = document.getElementById('notification-badge');
        if (!notificationBadge) return;

        const unreadCount = notifications.filter(n => !n.read).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    function renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <i class="fa-regular fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = notifications.slice(0, 5).map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon ${notification.type}">
                    <i class="fa-solid ${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${formatTime(notification.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    function addNotification(title, message, type = 'info') {
        const notification = {
            id: Date.now().toString(),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        notifications.unshift(notification);
        localStorage.setItem('user_notifications', JSON.stringify(notifications));
        updateNotificationBadge();
        showToast(title, message, type);
    }

    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }

    function formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    function showToast(title, message, type) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="toast-close"><i class="fa-solid fa-times"></i></button>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- Search System ---
    function initSearch() {
        const searchIcon = document.getElementById('search-icon');
        const searchDropdown = document.getElementById('search-dropdown');
        const searchInput = document.getElementById('search-input');
        const searchContent = document.getElementById('search-content');
        const searchCategories = document.querySelectorAll('.search-category');

        if (!searchIcon) return;

        let currentCategory = 'all';

        searchIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            searchDropdown.classList.toggle('show');
            if (searchDropdown.classList.contains('show')) {
                searchInput.focus();
            }
        });

        searchInput.addEventListener('input', performSearch);

        searchCategories.forEach(btn => {
            btn.addEventListener('click', () => {
                searchCategories.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                performSearch();
            });
        });

        document.addEventListener('click', (e) => {
            if (!searchDropdown.contains(e.target) && !searchIcon.contains(e.target)) {
                searchDropdown.classList.remove('show');
            }
        });

        function performSearch() {
            const query = searchInput.value.toLowerCase().trim();

            if (!query) {
                searchContent.innerHTML = `
                    <div class="search-placeholder">
                        <i class="fa-solid fa-search"></i>
                        <p>Start typing to search...</p>
                    </div>
                `;
                return;
            }

            const results = getSearchResults(query, currentCategory);
            renderSearchResults(results);
        }

        function getSearchResults(query, category) {
            // Get real data from localStorage
            const userRequests = JSON.parse(localStorage.getItem('user_requests') || '[]');
            const userQuotations = JSON.parse(localStorage.getItem('user_quotations') || '[]');

            let results = [];

            if (category === 'all' || category === 'projects') {
                const projectResults = userRequests.filter(p =>
                    p.projectTitle.toLowerCase().includes(query) ||
                    p.projectType.toLowerCase().includes(query) ||
                    p.projectLocation.toLowerCase().includes(query)
                ).map(p => ({
                    ...p,
                    category: 'project',
                    title: p.projectTitle,
                    type: p.projectType,
                    location: p.projectLocation
                }));
                results.push(...projectResults);
            }

            if (category === 'all' || category === 'contractors') {
                const contractorResults = [...new Set(userQuotations.map(q => q.dealerName))].filter(Boolean)
                    .filter(name => name.toLowerCase().includes(query))
                    .map(name => ({
                        name,
                        category: 'contractor',
                        rating: '4.2',
                        projects: Math.floor(Math.random() * 50) + 10
                    }));
                results.push(...contractorResults);
            }

            if (category === 'all' || category === 'quotes') {
                const quoteResults = userQuotations.filter(q =>
                    q.dealerName?.toLowerCase().includes(query) ||
                    q.projectType?.toLowerCase().includes(query)
                ).map(q => ({
                    ...q,
                    category: 'quote',
                    title: `Quote from ${q.dealerName || 'Dealer'}`,
                    cost: `₹${q.estimatedCost?.toLocaleString()}`,
                    status: q.status || 'Pending'
                }));
                results.push(...quoteResults);
            }

            return results.slice(0, 8);
        }

        function renderSearchResults(results) {
            if (results.length === 0) {
                searchContent.innerHTML = `
                    <div class="no-results">
                        <i class="fa-regular fa-frown"></i>
                        <p>No results found</p>
                    </div>
                `;
                return;
            }

            searchContent.innerHTML = `
                <div class="search-results-list">
                    ${results.map(result => createSearchItem(result)).join('')}
                </div>
            `;
        }

        function createSearchItem(result) {
            switch (result.category) {
                case 'project':
                    return `
                        <div class="search-result-item" onclick="window.location.href='view-quotations.html'">
                            <div class="result-icon project"><i class="fa-solid fa-building"></i></div>
                            <div class="result-content">
                                <h4>${result.title}</h4>
                                <p>${result.type} • ${result.location}</p>
                            </div>
                        </div>
                    `;
                case 'contractor':
                    return `
                        <div class="search-result-item">
                            <div class="result-icon contractor"><i class="fa-solid fa-user-tie"></i></div>
                            <div class="result-content">
                                <h4>${result.name}</h4>
                                <p>${result.projects} projects • ${result.rating}★</p>
                            </div>
                        </div>
                    `;
                case 'quote':
                    return `
                        <div class="search-result-item" onclick="window.location.href='view-quotations.html'">
                            <div class="result-icon quote"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                            <div class="result-content">
                                <h4>${result.title}</h4>
                                <p>${result.cost} • ${result.status}</p>
                            </div>
                        </div>
                    `;
                default:
                    return '';
            }
        }
    }

    // --- Profile System ---
    function initProfile() {
        const profilePanel = document.getElementById('profile-panel');
        const profileOverlay = document.getElementById('profile-overlay');
        const closeProfileBtn = document.getElementById('close-profile-panel');
        const menuItems = document.querySelectorAll('.menu-item:not(.logout-item)');
        const profileSections = document.querySelectorAll('.profile-section');
        const profileForm = document.querySelector('.profile-form');
        const preferencesForm = document.querySelector('.preferences-form');
        const logoutItem = document.querySelector('.logout-item');

        if (!profilePanel) return;

        // Close profile panel
        closeProfileBtn.addEventListener('click', closeProfile);
        profileOverlay.addEventListener('click', closeProfile);

        function closeProfile() {
            profilePanel.classList.remove('active');
            profileOverlay.classList.remove('active');
        }

        // Menu navigation
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');

                profileSections.forEach(section => section.classList.remove('active'));
                const sectionId = item.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
            });
        });

        // Profile form submission
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    displayName: document.getElementById('panel-displayName').value,
                    phone: document.getElementById('panel-phone').value,
                    bio: document.getElementById('panel-bio').value
                };

                localStorage.setItem('user_profile', JSON.stringify(formData));
                addNotification('Profile Updated', 'Your profile information has been saved successfully.', 'success');
            });
        }

        // Preferences form submission
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const preferences = {
                    emailNotifications: document.getElementById('email-notifications').checked,
                    smsNotifications: document.getElementById('sms-notifications').checked,
                    language: document.getElementById('language').value
                };

                localStorage.setItem('user_preferences', JSON.stringify(preferences));
                addNotification('Preferences Saved', 'Your preferences have been updated.', 'success');
            });
        }

        // Logout functionality
        if (logoutItem) {
            logoutItem.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('sb_currentUser');
                    sessionStorage.clear();
                    window.location.reload();
                }
            });
        }

        // Load saved profile data
        loadProfileData();
    }

    function loadProfileData() {
        const savedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        const savedPreferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');

        // Load profile data
        if (savedProfile.displayName) {
            document.getElementById('panel-displayName').value = savedProfile.displayName;
            document.getElementById('panel-profile-name').textContent = savedProfile.displayName;
        }
        if (savedProfile.phone) {
            document.getElementById('panel-phone').value = savedProfile.phone;
        }
        if (savedProfile.bio) {
            document.getElementById('panel-bio').value = savedProfile.bio;
        }

        // Load preferences
        if (savedPreferences.emailNotifications !== undefined) {
            document.getElementById('email-notifications').checked = savedPreferences.emailNotifications;
        }
        if (savedPreferences.smsNotifications !== undefined) {
            document.getElementById('sms-notifications').checked = savedPreferences.smsNotifications;
        }
        if (savedPreferences.language) {
            document.getElementById('language').value = savedPreferences.language;
        }
    }

    // Make profile accessible from login link
    function setupProfileAccess() {
        const loginLink = document.getElementById('login-link');
        if (loginLink) {
            // Check if user is logged in (simulate)
            const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';

            if (isLoggedIn) {
                loginLink.innerHTML = '<i class="fa-solid fa-user"></i> Profile';
                loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('profile-panel').classList.add('active');
                    document.getElementById('profile-overlay').classList.add('active');
                });
            }
        }
    }

    // Initialize all modules
    initNotifications();
    initSearch();
    initProfile();
    setupProfileAccess();

    // Add sample notifications if none exist
    if (notifications.length === 0) {
        addNotification('Welcome!', 'Welcome to StoneBeam-NH construction platform', 'success');
        addNotification('Complete Profile', 'Add your details to get better quotes', 'info');
        addNotification('New Feature', 'Check out our new schedule management system', 'info');
    }

    // Simulate login for demo
    if (!localStorage.getItem('user_logged_in')) {
        setTimeout(() => {
            localStorage.setItem('user_logged_in', 'true');
            setupProfileAccess();
        }, 2000);
    }

    // Global function to add notifications (can be called from other modules)
    window.addNotification = addNotification;
});