// Logout utility functions
async function logout() {
    try {
        // Use AuthManager if available (preferred method)
        if (window.authManager) {
            const result = await authManager.signOut();
            if (result.success) {
                console.log('Logged out successfully via AuthManager');
            } else {
                console.error('Logout error:', result.error);
            }
        } else {
            // Fallback logout if AuthManager not available
            performFallbackLogout();
        }

        // Show logout message
        if (typeof profileManager !== 'undefined') {
            profileManager.showToast('Logged out successfully', 'success');
        }

        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if there's an error
        performFallbackLogout();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Fallback logout function
function performFallbackLogout() {
    // Clear ALL session storage
    sessionStorage.clear();

    // Clear ALL relevant local storage items
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

    console.log('Performed complete logout cleanup');
}

// Global logout function for onclick handlers
window.logout = logout;