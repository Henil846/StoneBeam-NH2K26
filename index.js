/**
 * StoneBeam-NH - Main Page Logic
 * Version: 1.0.0
 * Date: 2025
 */
// index.js

// Firebase is initialized in firebase.js included in HTML

// YOUR EXISTING CODE BELOW...
// document.querySelector('.login-btn').addEventListener...
document.addEventListener('DOMContentLoaded', () => {

    // Initialize user state first
    initializeUserState();
    
    // Check for existing login state on page load
    const isLoggedIn = localStorage.getItem('sb_isLoggedIn');
    const hasUser = sessionStorage.getItem('sb_currentUser');
    const hasDealer = sessionStorage.getItem('sb_currentDealer');
    
    // If localStorage says logged in but no session data, clear the flag
    if (isLoggedIn && !hasUser && !hasDealer) {
        localStorage.removeItem('sb_isLoggedIn');
    }

    // --- User Type Modal Logic ---
    const modal = document.getElementById('user-type-modal');
    const userBtn = document.getElementById('user-btn');
    const dealerBtn = document.getElementById('dealer-btn');

    // Enhanced check - only show modal if no user is logged in
    function shouldShowModal() {
        const hasUser = sessionStorage.getItem('sb_currentUser');
        const hasDealer = sessionStorage.getItem('sb_currentDealer');
        const isLoggedIn = localStorage.getItem('sb_isLoggedIn');
        
        // Don't show modal if user is logged in or if there's an active session
        return !hasUser && !hasDealer && !isLoggedIn;
    }

    if (modal && shouldShowModal()) {
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

    // Initialize user profile dropdown
    initializeUserDropdown();
    
    // Listen for storage changes to sync login state across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'sb_isLoggedIn') {
            // Refresh user state when login status changes in another tab
            initializeUserState();
            
            // Hide modal if user logged in from another tab
            if (e.newValue === 'true' && modal) {
                modal.style.display = 'none';
            }
            // Show modal if user logged out from another tab and no session exists
            else if (e.newValue === null && shouldShowModal() && modal) {
                modal.style.display = 'flex';
            }
        }
    });

    function initializeUserState() {
        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
        const currentDealer = JSON.parse(sessionStorage.getItem('sb_currentDealer') || 'null');

        const userDisplayName = document.getElementById('user-display-name');
        const dropdownUserName = document.getElementById('dropdown-user-name');
        const dropdownUserEmail = document.getElementById('dropdown-user-email');
        const loginSignupLink = document.getElementById('login-signup-link');
        const logoutLink = document.getElementById('logout-link');
        const userAvatar = document.querySelector('.user-avatar');

        // Add click handler for login/signup link
        if (loginSignupLink) {
            loginSignupLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }

        if (currentUser) {
            // User is logged in
            const displayName = currentUser.displayName || currentUser.name || 'User';
            const email = currentUser.email || 'user@example.com';

            userDisplayName.textContent = displayName;
            dropdownUserName.textContent = displayName;
            dropdownUserEmail.textContent = email;
            userAvatar.textContent = displayName.charAt(0).toUpperCase();

            loginSignupLink.style.display = 'none';
            logoutLink.style.display = 'block';
            
            // Set login state in localStorage for cross-tab persistence
            localStorage.setItem('sb_isLoggedIn', 'true');
        } else if (currentDealer) {
            // Dealer is logged in
            const displayName = currentDealer.name || currentDealer.businessName || 'Dealer';
            const email = currentDealer.email || 'dealer@example.com';

            userDisplayName.textContent = displayName;
            dropdownUserName.textContent = displayName;
            dropdownUserEmail.textContent = email;
            userAvatar.textContent = displayName.charAt(0).toUpperCase();

            loginSignupLink.style.display = 'none';
            logoutLink.style.display = 'block';
            
            // Set login state in localStorage for cross-tab persistence
            localStorage.setItem('sb_isLoggedIn', 'true');

            // Update profile link for dealers
            const profileLink = document.querySelector('.dropdown-item[href="real-profile.html"]');
            if (profileLink) {
                profileLink.href = 'dealer-profile.html';
                profileLink.innerHTML = '<i class="fa-solid fa-user-tie"></i> View Dealer Profile';
            }
        } else {
            // No user logged in
            userDisplayName.textContent = 'Guest';
            dropdownUserName.textContent = 'Guest User';
            dropdownUserEmail.textContent = 'Please login to continue';
            userAvatar.textContent = 'G';

            loginSignupLink.style.display = 'block';
            logoutLink.style.display = 'none';
            
            // Clear login state
            localStorage.removeItem('sb_isLoggedIn');
        }
    }

    function initializeUserDropdown() {
        const userProfileBtn = document.getElementById('user-profile-btn');
        const userDropdown = document.getElementById('user-dropdown');
        const logoutLink = document.getElementById('logout-link');

        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();

                // Use the improved logout function from logout.js if available
                if (window.logout) {
                    await logout();
                } else {
                    // Fallback logout logic
                    if (window.authManager) {
                        const result = await authManager.signOut();
                        if (result.success) {
                            console.log('Logged out successfully via AuthManager');
                        } else {
                            console.error('Logout error:', result.error);
                        }
                    }

                    // Clear all data
                    sessionStorage.clear();
                    localStorage.removeItem('sb_isLoggedIn');
                    localStorage.removeItem('sb_user_profile');

                    // Redirect to index page
                    window.location.href = 'index.html';
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfileBtn?.contains(e.target) && !userDropdown?.contains(e.target)) {
                userDropdown?.classList.remove('show');
            }
        });
    }

    // Profile Panel Functions
    function populateProfilePanel(user) {
        // Set basic info from sessionStorage first
        document.getElementById('panel-profile-name').textContent = user.displayName || 'User';
        document.getElementById('panel-profile-email').textContent = user.email;
        document.getElementById('panel-displayName').value = user.displayName || '';
        document.getElementById('panel-email').value = user.email;

        // Fetch additional data from Firestore
        if (user.uid) {
            db.collection("users").doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        console.log("Loaded user data from Firestore:", userData);

                        // Populate additional fields
                        if (userData.phone) {
                            document.getElementById('panel-phone').value = userData.phone;
                        }
                        if (userData.bio) {
                            document.getElementById('panel-bio').value = userData.bio;
                        }

                        // Set member since date
                        if (userData.createdAt) {
                            const createdDate = new Date(userData.createdAt);
                            document.getElementById('panel-member-since').textContent = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        } else {
                            document.getElementById('panel-member-since').textContent = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        }
                    } else {
                        console.log("No user document found in Firestore");
                        document.getElementById('panel-member-since').textContent = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }
                })
                .catch((error) => {
                    console.error("Error loading user data from Firestore:", error);
                    document.getElementById('panel-member-since').textContent = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                });
        } else {
            document.getElementById('panel-member-since').textContent = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
    }

    // Attach close listeners once on page load
    attachCloseListeners();

    // Function to attach close listeners (using event delegation)
    function attachCloseListeners() {
        // Add event delegation for close functionality
        document.addEventListener('click', handleCloseClick);
    }

    // Handle close clicks
    function handleCloseClick(event) {
        if (event.target.classList.contains('close-panel-btn') || event.target === profileOverlay) {
            console.log('Close triggered by:', event.target.classList.contains('close-panel-btn') ? 'close button' : 'overlay');
            profilePanel.classList.remove('active');
            profileOverlay.classList.remove('active');
        }
    }

    // Profile menu navigation
    const menuItems = document.querySelectorAll('.menu-item:not(.logout-item)');
    const profileSections = document.querySelectorAll('.profile-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            profileSections.forEach(section => section.classList.remove('active'));
            const sectionId = item.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Logout functionality
    if (document.querySelector('.logout-item')) {
        document.querySelector('.logout-item').addEventListener('click', () => {
            // Clear all session data and login state
            sessionStorage.clear();
            localStorage.removeItem('sb_user_profile');
            localStorage.removeItem('sb_isLoggedIn');
            // Redirect to index page
            window.location.href = 'index.html';
        });
    }

    // Form handling
    if (document.querySelector('.profile-form')) {
        document.querySelector('.profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const displayName = document.getElementById('panel-displayName').value;
            const phone = document.getElementById('panel-phone').value;
            const bio = document.getElementById('panel-bio').value;
            const user = auth.currentUser;

            if (user) {
                // Update Firebase Auth profile
                const updatePromises = [user.updateProfile({ displayName })];

                // Update Firestore data
                const firestoreData = {};
                if (phone) firestoreData.phone = phone;
                if (bio) firestoreData.bio = bio;

                if (Object.keys(firestoreData).length > 0) {
                    updatePromises.push(db.collection("users").doc(user.uid).update(firestoreData));
                }

                Promise.all(updatePromises)
                    .then(() => {
                        // Update sessionStorage
                        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser'));
                        currentUser.displayName = displayName;
                        sessionStorage.setItem('sb_currentUser', JSON.stringify(currentUser));

                        // Update UI
                        document.getElementById('panel-profile-name').textContent = displayName;

                        // Show success message
                        alert('Profile updated successfully!');
                    })
                    .catch((error) => {
                        console.error("Error updating profile:", error);
                        alert('Error updating profile: ' + error.message);
                    });
            }
        });
    }

    if (document.querySelector('.preferences-form')) {
        document.querySelector('.preferences-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Preferences saved!');
        });
    }

    // Security buttons
    const changePasswordBtn = document.querySelector('.security-item button');
    if (changePasswordBtn && changePasswordBtn.textContent === 'Change Password') {
        changePasswordBtn.addEventListener('click', () => {
            alert('Redirecting to change password page...');
            // window.location.href = 'change-password.html';
        });
    }

    const enable2FABtn = document.querySelectorAll('.security-item button')[1];
    if (enable2FABtn && enable2FABtn.textContent === 'Enable 2FA') {
        enable2FABtn.addEventListener('click', () => {
            alert('Two-Factor Authentication enabled!');
        });
    }

    // --- 1. Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Handle home link specially
            if (this.textContent.trim() === 'Home') {
                e.preventDefault();
                window.location.href = 'index.html';
                return;
            }

            // Remove active class from all and add to clicked
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- 2. Search Functionality ---
    const searchIcon = document.querySelector('.fa-magnifying-glass');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const query = prompt("Search for projects, contractors, or quotations:");
            if (query) {
                console.log(`Searching for: ${query}`);
                alert(`Searching for "${query}"... This feature will be available soon!`);
            }
        });
    }

    // --- 3. Notification Logic ---
    const bellIcon = document.querySelector('.fa-bell');
    let notificationCount = 3;

    if (bellIcon) {
        bellIcon.addEventListener('click', () => {
            alert(`You have ${notificationCount} new notifications regarding your quotations.`);
            bellIcon.style.color = "white";
        });
    }

    // --- 4. Hero Button Actions ---
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

    // --- 5. Quick Action Hover/Click Effects ---
    const actionItems = document.querySelectorAll('.action-item');

    actionItems.forEach(item => {
        item.addEventListener('click', () => {
            const actionName = item.querySelector('span').innerText;
            handleQuickAction(actionName);
        });
    });

    function handleQuickAction(action) {
        switch (action) {
            case 'Upload Files':
                if (document.querySelector('[href="upload-files.html"]')) {
                    window.location.href = 'upload-files.html';
                } else {
                    alert('Upload Files feature coming soon!');
                }
                break;
            case 'Schedule':
                if (document.querySelector('[href="schedule.html"]')) {
                    window.location.href = 'schedule.html';
                } else {
                    alert('Schedule feature coming soon!');
                }
                break;
            case 'Premium':
                window.location.href = 'premium.html';
                break;
            case 'Support':
                window.location.href = 'help_support.html';
                break;
            default:
                alert('Feature coming soon!');
        }
    }

    // --- 6. Live Updates Auto-Refresh Simulation ---
    // This simulates real-time data coming in without reloading the page
    const updateList = document.querySelector('.update-list');

    function addLiveUpdate(title, subtitle) {
        const newUpdate = document.createElement('li');
        newUpdate.style.animation = "fadeIn 0.5s ease-in";
        newUpdate.innerHTML = `
            <i class="fa-solid fa-bolt" style="color: #f1c40f;"></i>
            <div>
                <strong>${title}</strong>
                <span>${subtitle}</span>
            </div>
        `;
        // Insert at the top of the list
        updateList.insertBefore(newUpdate, updateList.firstChild);

        // Remove oldest if list gets too long (max 5)
        if (updateList.children.length > 5) {
            updateList.removeChild(updateList.lastChild);
        }
    }

    // Simulate a new update after 10 seconds
    setTimeout(() => {
        addLiveUpdate("New Bid Received", "Contractor 'BuildRight' bid on Project Home - Just now");
    }, 10000);

    // --- 7. Blog Section Functionality ---
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();

            if (email && isValidEmail(email)) {
                // Simulate newsletter subscription
                showNotification('Thank you for subscribing! You\'ll receive our latest updates.', 'success');
                newsletterEmail.value = '';

                // Store subscription in localStorage for demo
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

    // Blog card interactions
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        const heartIcon = card.querySelector('.fa-heart');
        const eyeIcon = card.querySelector('.fa-eye');

        if (heartIcon) {
            heartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const likesSpan = heartIcon.parentElement;
                let currentLikes = parseInt(likesSpan.textContent.trim());

                if (heartIcon.classList.contains('fa-regular')) {
                    heartIcon.classList.remove('fa-regular');
                    heartIcon.classList.add('fa-solid');
                    heartIcon.style.color = '#e74c3c';
                    currentLikes++;
                } else {
                    heartIcon.classList.remove('fa-solid');
                    heartIcon.classList.add('fa-regular');
                    heartIcon.style.color = '';
                    currentLikes--;
                }

                likesSpan.innerHTML = `<i class="${heartIcon.classList.contains('fa-solid') ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${currentLikes}`;
            });
        }

        // Track blog post views
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.blog-stats')) {
                const viewsSpan = card.querySelector('.fa-eye').parentElement;
                let currentViews = parseInt(viewsSpan.textContent.trim());
                currentViews++;
                viewsSpan.innerHTML = `<i class="fa-regular fa-eye"></i> ${formatNumber(currentViews)}`;
            }
        });
    });

    // Helper functions for blog
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fa-solid fa-times"></i></button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

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
        const notificationBell = document.getElementById('notification-bell');
        if (!notificationBadge || !notificationBell) return;

        const unreadCount = notifications.filter(n => !n.read).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'block' : 'none';
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
            const mockData = {
                projects: [
                    { title: 'Villa Construction', type: 'Residential', location: 'Ahmedabad' },
                    { title: 'Office Building', type: 'Commercial', location: 'Mumbai' }
                ],
                contractors: [
                    { name: 'Premium Builders', rating: '4.5', projects: '25' },
                    { name: 'Elite Construction', rating: '4.2', projects: '18' }
                ],
                quotes: [
                    { title: 'Villa Quote', cost: '₹25,00,000', status: 'Pending' },
                    { title: 'Office Quote', cost: '₹50,00,000', status: 'Accepted' }
                ]
            };

            let results = [];

            if (category === 'all' || category === 'projects') {
                results.push(...mockData.projects.filter(p =>
                    p.title.toLowerCase().includes(query) ||
                    p.type.toLowerCase().includes(query)
                ).map(p => ({ ...p, category: 'project' })));
            }

            if (category === 'all' || category === 'contractors') {
                results.push(...mockData.contractors.filter(c =>
                    c.name.toLowerCase().includes(query)
                ).map(c => ({ ...c, category: 'contractor' })));
            }

            if (category === 'all' || category === 'quotes') {
                results.push(...mockData.quotes.filter(q =>
                    q.title.toLowerCase().includes(query)
                ).map(q => ({ ...q, category: 'quote' })));
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
                        <div class="search-result-item">
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
                        <div class="search-result-item">
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

    // Initialize modules
    initNotifications();
    initSearch();

    // Add sample notifications
    if (notifications.length === 0) {
        addNotification('Welcome!', 'Welcome to StoneBeam-NH construction platform', 'success');
        addNotification('Complete Profile', 'Add your details to get better quotes', 'info');
    }

});

// --- Blog Section CSS Styles ---
const blogStyles = document.createElement('style');
blogStyles.textContent = `
    .blog-section {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 80px 0;
        margin-top: 60px;
    }
    
    .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 30px;
        margin-bottom: 50px;
    }
    
    .blog-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .blog-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .blog-card.featured {
        grid-column: span 2;
    }
    
    .blog-image {
        position: relative;
        height: 200px;
        overflow: hidden;
    }
    
    .blog-card.featured .blog-image {
        height: 300px;
    }
    
    .blog-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .blog-card:hover .blog-image img {
        transform: scale(1.05);
    }
    
    .blog-category {
        position: absolute;
        top: 15px;
        left: 15px;
        background: rgba(142, 68, 173, 0.9);
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .blog-content {
        padding: 25px;
    }
    
    .blog-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #666;
    }
    
    .blog-meta i {
        margin-right: 5px;
    }
    
    .blog-content h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        line-height: 1.4;
    }
    
    .blog-card.featured .blog-content h3 {
        font-size: 24px;
    }
    
    .blog-content h3 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s ease;
    }
    
    .blog-content h3 a:hover {
        color: #8e44ad;
    }
    
    .blog-content p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
    }
    
    .blog-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .read-more {
        color: #8e44ad;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.3s ease;
    }
    
    .read-more:hover {
        color: #6c3483;
    }
    
    .blog-stats {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #666;
    }
    
    .blog-stats span {
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .blog-stats span:hover {
        color: #8e44ad;
    }
    
    .blog-newsletter {
        background: linear-gradient(135deg, #8e44ad, #6c3483);
        border-radius: 20px;
        padding: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        gap: 30px;
    }
    
    .newsletter-content h3 {
        margin: 0 0 10px 0;
        font-size: 24px;
    }
    
    .newsletter-content h3 i {
        margin-right: 10px;
    }
    
    .newsletter-form {
        display: flex;
        gap: 15px;
        min-width: 400px;
    }
    
    .newsletter-form input {
        flex: 1;
        padding: 15px 20px;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        outline: none;
    }
    
    .newsletter-form button {
        background: white;
        color: #8e44ad;
        border: none;
        padding: 15px 25px;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
    }
    
    .newsletter-form button:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
        max-width: 350px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #27ae60;
    }
    
    .notification-error {
        border-left: 4px solid #e74c3c;
    }
    
    .notification-success i {
        color: #27ae60;
    }
    
    .notification-error i {
        color: #e74c3c;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        margin-left: auto;
        color: #666;
    }
    
    @media (max-width: 768px) {
        .blog-card.featured {
            grid-column: span 1;
        }
        
        .blog-newsletter {
            flex-direction: column;
            text-align: center;
        }
        
        .newsletter-form {
            min-width: auto;
            width: 100%;
        }
        
        .newsletter-form input {
            min-width: 0;
        }
    }
    
    .contact-section {
        background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);
        color: white;
        padding: 80px 0;
        margin-top: 60px;
    }
    
    .contact-header {
        text-align: center;
        margin-bottom: 50px;
    }
    
    .contact-header h2 {
        font-size: 2.5rem;
        margin-bottom: 15px;
    }
    
    .contact-header p {
        font-size: 1.2rem;
        opacity: 0.9;
    }
    
    .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }
    
    .contact-card {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 40px 30px;
        text-align: center;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.2);
    }
    
    .contact-card:hover {
        transform: translateY(-10px);
        background: rgba(255,255,255,0.15);
    }
    
    .contact-card i {
        font-size: 3rem;
        margin-bottom: 20px;
        color: #fff;
    }
    
    .contact-card h3 {
        font-size: 1.5rem;
        margin-bottom: 20px;
    }
    
    .phone-numbers {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .phone-link, .email-link, .location-link {
        color: #fff;
        text-decoration: none;
        font-size: 1.1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        padding: 8px 15px;
        border-radius: 25px;
        background: rgba(255,255,255,0.1);
        display: inline-block;
    }
    
    .phone-link:hover, .email-link:hover, .location-link:hover {
        background: rgba(255,255,255,0.2);
        transform: scale(1.05);
    }
    
    .contact-card p {
        opacity: 0.8;
        margin-top: 15px;
    }
    
    @media (max-width: 768px) {
        .contact-grid {
            grid-template-columns: 1fr;
        }
        
        .contact-header h2 {
            font-size: 2rem;
        }
        
        .phone-numbers {
            align-items: center;
        }
    }
    
    /* Schedule Module Styles */
    
    /* Notification System Styles */
    .notification-container {
        position: relative;
    }
    
    .notification-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 12px;
        display: none;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
    
    .notification-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        width: 350px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
        margin-top: 10px;
    }
    
    .notification-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #e9ecef;
    }
    
    .notification-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
    }
    
    .mark-all-read {
        background: none;
        border: none;
        color: #8e44ad;
        cursor: pointer;
        font-size: 12px;
    }
    
    .notification-list {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .notification-item {
        display: flex;
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .notification-item:hover {
        background: #f8f9fa;
    }
    
    .notification-item.unread {
        background: rgba(142, 68, 173, 0.05);
    }
    
    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        background: #f8f9fa;
    }
    
    .notification-icon.success { background: rgba(39, 174, 96, 0.1); color: #27ae60; }
    .notification-icon.warning { background: rgba(243, 156, 18, 0.1); color: #f39c12; }
    .notification-icon.error { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }
    .notification-icon.info { background: rgba(52, 152, 219, 0.1); color: #3498db; }
    
    .notification-content h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        color: #333;
    }
    
    .notification-content p {
        margin: 0 0 5px 0;
        font-size: 12px;
        color: #666;
        line-height: 1.4;
    }
    
    .notification-time {
        font-size: 11px;
        color: #999;
    }
    
    .no-notifications {
        text-align: center;
        padding: 40px 20px;
        color: #999;
    }
    
    .no-notifications i {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    /* Search System Styles */
    .search-container {
        position: relative;
    }
    
    .search-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        width: 400px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
        margin-top: 10px;
    }
    
    .search-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .search-box {
        display: flex;
        padding: 15px;
        border-bottom: 1px solid #e9ecef;
    }
    
    .search-box input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 8px 0 0 8px;
        padding: 10px 15px;
        outline: none;
        font-size: 14px;
    }
    
    .search-btn {
        background: #8e44ad;
        color: white;
        border: none;
        border-radius: 0 8px 8px 0;
        padding: 10px 15px;
        cursor: pointer;
    }
    
    .search-categories {
        display: flex;
        padding: 10px 15px;
        gap: 10px;
        border-bottom: 1px solid #e9ecef;
    }
    
    .search-category {
        background: #f8f9fa;
        border: 1px solid #ddd;
        padding: 5px 12px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
    }
    
    .search-category.active {
        background: #8e44ad;
        color: white;
        border-color: #8e44ad;
    }
    
    .search-content {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .search-placeholder, .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #999;
    }
    
    .search-placeholder i, .no-results i {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    .search-result-item {
        display: flex;
        padding: 12px 20px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .search-result-item:hover {
        background: #f8f9fa;
    }
    
    .result-icon {
        width: 35px;
        height: 35px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: white;
    }
    
    .result-icon.project { background: #3498db; }
    .result-icon.contractor { background: #27ae60; }
    .result-icon.quote { background: #f39c12; }
    
    .result-content h4 {
        margin: 0 0 3px 0;
        font-size: 14px;
        color: #333;
    }
    
    .result-content p {
        margin: 0;
        font-size: 12px;
        color: #666;
    }
    
    /* Profile Panel Styles */
    .profile-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
    }
    
    .profile-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    
    .profile-panel {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100%;
        background: white;
        box-shadow: -5px 0 20px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 1000;
        overflow-y: auto;
    }
    
    .profile-panel.active {
        right: 0;
    }
    
    .profile-header {
        background: linear-gradient(135deg, #8e44ad, #6c3483);
        color: white;
        padding: 30px 25px;
        position: relative;
    }
    
    .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-bottom: 15px;
    }
    
    .profile-info h3 {
        margin: 0 0 5px 0;
        font-size: 18px;
    }
    
    .profile-info p {
        margin: 0 0 10px 0;
        opacity: 0.9;
        font-size: 14px;
    }
    
    .member-since {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .close-panel-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .profile-menu {
        border-bottom: 1px solid #e9ecef;
    }
    
    .menu-item {
        display: flex;
        align-items: center;
        padding: 15px 25px;
        cursor: pointer;
        transition: background 0.3s ease;
        border-left: 3px solid transparent;
    }
    
    .menu-item:hover {
        background: #f8f9fa;
    }
    
    .menu-item.active {
        background: rgba(142, 68, 173, 0.1);
        border-left-color: #8e44ad;
        color: #8e44ad;
    }
    
    .menu-item i {
        margin-right: 12px;
        width: 16px;
    }
    
    .profile-content {
        padding: 25px;
    }
    
    .profile-section {
        display: none;
    }
    
    .profile-section.active {
        display: block;
    }
    
    .profile-section h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }
    
    .form-group input, .form-group textarea, .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
        border-color: #8e44ad;
    }
    
    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }
    
    .security-options {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .security-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
    }
    
    .security-info h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        color: #333;
    }
    
    .security-info p {
        margin: 0;
        font-size: 12px;
        color: #666;
    }
    
    /* Toast Notifications */
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1001;
        max-width: 300px;
    }
    
    .toast-notification.show {
        transform: translateX(0);
    }
    
    .toast-notification.toast-success { border-left: 4px solid #27ae60; }
    .toast-notification.toast-error { border-left: 4px solid #e74c3c; }
    .toast-notification.toast-warning { border-left: 4px solid #f39c12; }
    .toast-notification.toast-info { border-left: 4px solid #3498db; }
    
    .toast-content h4 {
        margin: 0 0 3px 0;
        font-size: 14px;
        color: #333;
    }
    
    .toast-content p {
        margin: 0;
        font-size: 12px;
        color: #666;
    }
    
    .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #999;
        margin-left: auto;
    }
    
    @media (max-width: 768px) {
        .notification-dropdown, .search-dropdown {
            width: 300px;
        }
        
        .profile-panel {
            width: 100%;
            right: -100%;
        }
    }
`;
document.head.appendChild(blogStyles);

// --- Simple CSS Animation for the Live Updates ---
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);