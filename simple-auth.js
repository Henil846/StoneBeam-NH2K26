/**
 * Simple Authentication System for StoneBeam-NH
 * Handles login, logout, and session management properly
 */

class SimpleAuth {
    constructor() {
        this.init();
    }

    init() {
        // Check authentication state on page load
        this.checkAuthState();
        
        // Set up logout handlers
        this.setupLogoutHandlers();
    }

    // Check if user is logged in
    isLoggedIn() {
        const user = sessionStorage.getItem('sb_currentUser');
        const dealer = sessionStorage.getItem('sb_currentDealer');
        return !!(user || dealer);
    }

    // Get current user
    getCurrentUser() {
        const user = sessionStorage.getItem('sb_currentUser');
        const dealer = sessionStorage.getItem('sb_currentDealer');
        
        if (user) return JSON.parse(user);
        if (dealer) return JSON.parse(dealer);
        return null;
    }

    // Login user
    login(email, password, userType = 'user') {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        const dealers = JSON.parse(localStorage.getItem('sb_dealers') || '[]');
        
        let userData = null;
        
        if (userType === 'user') {
            userData = users.find(u => u.email === email && u.password === password);
        } else {
            userData = dealers.find(d => d.email === email && d.password === password);
        }

        if (userData) {
            // Store user in session
            const sessionKey = userType === 'user' ? 'sb_currentUser' : 'sb_currentDealer';
            sessionStorage.setItem(sessionKey, JSON.stringify(userData));
            
            // Mark that user has seen modal
            localStorage.setItem('sb_hasSeenUserTypeModal', 'true');
            
            return { success: true, user: userData };
        }

        return { success: false, error: 'Invalid email or password' };
    }

    // Register user
    register(userData, userType = 'user') {
        const storageKey = userType === 'user' ? 'sb_users' : 'sb_dealers';
        const users = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: `${userType}_${Date.now()}`,
            name: userData.displayName || userData.name,
            email: userData.email,
            phone: userData.phone || '',
            password: userData.password,
            userType: userType,
            createdAt: new Date().toISOString(),
            isVerified: false
        };

        // Add to storage
        users.push(newUser);
        localStorage.setItem(storageKey, JSON.stringify(users));

        return { success: true, user: newUser };
    }

    // Logout user
    logout() {
        // Clear ALL session data
        sessionStorage.clear();
        
        // Clear user-specific localStorage items
        localStorage.removeItem('sb_user_profile');
        localStorage.removeItem('sb_hasSeenUserTypeModal');
        localStorage.removeItem('sb_userTypeSelected');
        localStorage.removeItem('user_requests');
        localStorage.removeItem('user_quotations');
        localStorage.removeItem('quotation_draft');
        
        // Clear Firebase auth if available
        if (window.auth && window.auth.currentUser) {
            window.auth.signOut().catch(console.error);
        }

        console.log('User logged out successfully');
        return { success: true };
    }

    // Check authentication state and update UI
    checkAuthState() {
        const user = this.getCurrentUser();
        this.updateUI(user);
    }

    // Update UI based on authentication state
    updateUI(user) {
        const userDisplayName = document.getElementById('user-display-name');
        const dropdownUserName = document.getElementById('dropdown-user-name');
        const dropdownUserEmail = document.getElementById('dropdown-user-email');
        const loginSignupLink = document.getElementById('login-signup-link');
        const logoutLink = document.getElementById('logout-link');
        const userAvatar = document.querySelector('.user-avatar');

        if (user) {
            // User is logged in
            const displayName = user.displayName || user.name || 'User';
            const email = user.email || 'user@example.com';

            if (userDisplayName) userDisplayName.textContent = displayName;
            if (dropdownUserName) dropdownUserName.textContent = displayName;
            if (dropdownUserEmail) dropdownUserEmail.textContent = email;
            if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

            if (loginSignupLink) loginSignupLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
        } else {
            // No user logged in
            if (userDisplayName) userDisplayName.textContent = 'Guest';
            if (dropdownUserName) dropdownUserName.textContent = 'Guest User';
            if (dropdownUserEmail) dropdownUserEmail.textContent = 'Please login to continue';
            if (userAvatar) userAvatar.textContent = 'G';

            if (loginSignupLink) loginSignupLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    // Setup logout handlers
    setupLogoutHandlers() {
        // Handle logout links
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-link' || e.target.closest('#logout-link')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // Handle global logout function
        window.logout = () => this.handleLogout();
    }

    // Handle logout process
    async handleLogout() {
        try {
            // Logout
            const result = this.logout();
            
            if (result.success) {
                // Show success message
                this.showMessage('Logged out successfully', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even on error
            this.logout();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    // Show message to user
    showMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            max-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize simple auth system
const simpleAuth = new SimpleAuth();

// Make it globally available
if (typeof window !== 'undefined') {
    window.simpleAuth = simpleAuth;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleAuth;
}