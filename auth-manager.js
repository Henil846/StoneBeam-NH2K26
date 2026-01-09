/**
 * Authentication Manager for StoneBeam-NH
 * Handles user authentication, session management, and user state
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentDealer = null;
        this.isInitialized = false;
        this.authCallbacks = [];
        
        // Initialize on DOM load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.loadUserFromStorage();
        this.setupAuthStateListener();
        this.isInitialized = true;
        this.notifyAuthCallbacks();
    }
    
    // Load user data from session storage
    loadUserFromStorage() {
        try {
            const userData = sessionStorage.getItem('sb_currentUser');
            const dealerData = sessionStorage.getItem('sb_currentDealer');
            
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
            
            if (dealerData) {
                this.currentDealer = JSON.parse(dealerData);
            }
            
            // Also check Firebase auth state if available
            if (window.auth && window.auth.currentUser) {
                this.syncWithFirebaseUser(window.auth.currentUser);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            this.clearUserData();
        }
    }
    
    // Setup Firebase auth state listener
    setupAuthStateListener() {
        if (window.auth) {
            window.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.syncWithFirebaseUser(user);
                } else if (!this.currentUser && !this.currentDealer) {
                    this.handleSignOut();
                }
            });
        }
    }
    
    // Sync with Firebase user data
    syncWithFirebaseUser(firebaseUser) {
        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: firebaseUser.metadata.creationTime,
            lastLoginAt: firebaseUser.metadata.lastSignInTime
        };
        
        this.currentUser = userData;
        sessionStorage.setItem('sb_currentUser', JSON.stringify(userData));
        this.notifyAuthCallbacks();
    }
    
    // User login
    async loginUser(email, password) {
        try {
            if (window.auth) {
                // Firebase authentication
                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                this.syncWithFirebaseUser(user);
                return { success: true, user: this.currentUser };
            } else {
                // Fallback local authentication
                return this.localLogin(email, password, 'user');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Dealer login
    async loginDealer(email, password) {
        try {
            if (window.auth) {
                // For dealers, we might use a different collection or custom claims
                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Check if user is a dealer (this would typically be stored in Firestore)
                const dealerData = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || 'Dealer',
                    businessName: user.displayName || 'Business Name',
                    userType: 'dealer',
                    emailVerified: user.emailVerified,
                    createdAt: user.metadata.creationTime,
                    lastLoginAt: user.metadata.lastSignInTime
                };
                
                this.currentDealer = dealerData;
                sessionStorage.setItem('sb_currentDealer', JSON.stringify(dealerData));
                this.notifyAuthCallbacks();
                
                return { success: true, dealer: this.currentDealer };
            } else {
                // Fallback local authentication
                return this.localLogin(email, password, 'dealer');
            }
        } catch (error) {
            console.error('Dealer login error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Local authentication fallback
    localLogin(email, password, userType) {
        // This is a simple fallback - in production, you'd validate against a backend
        const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        const dealers = JSON.parse(localStorage.getItem('sb_dealers') || '[]');
        
        const userData = userType === 'user' 
            ? users.find(u => u.email === email)
            : dealers.find(d => d.email === email);
        
        if (userData) {
            if (userType === 'user') {
                this.currentUser = userData;
                sessionStorage.setItem('sb_currentUser', JSON.stringify(userData));
            } else {
                this.currentDealer = userData;
                sessionStorage.setItem('sb_currentDealer', JSON.stringify(userData));
            }
            
            this.notifyAuthCallbacks();
            return { success: true, [userType]: userData };
        }
        
        return { success: false, error: 'Invalid credentials' };
    }
    
    // User registration
    async registerUser(userData) {
        try {
            if (window.auth) {
                // Firebase registration
                const userCredential = await window.auth.createUserWithEmailAndPassword(
                    userData.email, 
                    userData.password
                );
                const user = userCredential.user;
                
                // Update profile
                await user.updateProfile({
                    displayName: userData.displayName
                });
                
                // Store additional user data in Firestore if available
                if (window.db) {
                    await window.db.collection('users').doc(user.uid).set({
                        displayName: userData.displayName,
                        email: userData.email,
                        phone: userData.phone || '',
                        userType: 'user',
                        createdAt: new Date().toISOString(),
                        isVerified: false
                    });
                }
                
                this.syncWithFirebaseUser(user);
                return { success: true, user: this.currentUser };
            } else {
                // Fallback local registration
                return this.localRegister(userData, 'user');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Dealer registration
    async registerDealer(dealerData) {
        try {
            if (window.auth) {
                // Firebase registration for dealer
                const userCredential = await window.auth.createUserWithEmailAndPassword(
                    dealerData.email, 
                    dealerData.password
                );
                const user = userCredential.user;
                
                // Update profile
                await user.updateProfile({
                    displayName: dealerData.businessName
                });
                
                // Store dealer data in Firestore if available
                if (window.db) {
                    await window.db.collection('dealers').doc(user.uid).set({
                        name: dealerData.name,
                        businessName: dealerData.businessName,
                        email: dealerData.email,
                        phone: dealerData.phone || '',
                        userType: 'dealer',
                        specialization: dealerData.specialization || [],
                        experience: dealerData.experience || '',
                        location: dealerData.location || '',
                        createdAt: new Date().toISOString(),
                        isVerified: false,
                        rating: 0,
                        completedProjects: 0
                    });
                }
                
                const newDealerData = {
                    uid: user.uid,
                    email: user.email,
                    name: dealerData.name,
                    businessName: dealerData.businessName,
                    userType: 'dealer',
                    phone: dealerData.phone,
                    specialization: dealerData.specialization,
                    experience: dealerData.experience,
                    location: dealerData.location,
                    emailVerified: user.emailVerified,
                    createdAt: user.metadata.creationTime,
                    isVerified: false
                };
                
                this.currentDealer = newDealerData;
                sessionStorage.setItem('sb_currentDealer', JSON.stringify(newDealerData));
                this.notifyAuthCallbacks();
                
                return { success: true, dealer: this.currentDealer };
            } else {
                // Fallback local registration
                return this.localRegister(dealerData, 'dealer');
            }
        } catch (error) {
            console.error('Dealer registration error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Local registration fallback
    localRegister(userData, userType) {
        const storageKey = userType === 'user' ? 'sb_users' : 'sb_dealers';
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Check if user already exists
        if (existingData.find(item => item.email === userData.email)) {
            return { success: false, error: 'User already exists' };
        }
        
        // Create new user/dealer
        const newData = {
            id: `${userType}_${Date.now()}`,
            ...userData,
            userType,
            createdAt: new Date().toISOString(),
            isVerified: false
        };
        
        delete newData.password; // Don't store password
        
        existingData.push(newData);
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        
        // Set as current user
        if (userType === 'user') {
            this.currentUser = newData;
            sessionStorage.setItem('sb_currentUser', JSON.stringify(newData));
        } else {
            this.currentDealer = newData;
            sessionStorage.setItem('sb_currentDealer', JSON.stringify(newData));
        }
        
        this.notifyAuthCallbacks();
        return { success: true, [userType]: newData };
    }
    
    // Sign out
    async signOut() {
        try {
            if (window.auth && window.auth.currentUser) {
                await window.auth.signOut();
            }
            this.handleSignOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            this.handleSignOut(); // Force local sign out even if Firebase fails
            return { success: false, error: error.message };
        }
    }
    
    // Handle sign out cleanup
    handleSignOut() {
        this.currentUser = null;
        this.currentDealer = null;
        
        // Clear ALL session storage
        sessionStorage.clear();
        
        // Clear specific localStorage items related to user session
        localStorage.removeItem('sb_user_profile');
        localStorage.removeItem('sb_hasSeenUserTypeModal');
        localStorage.removeItem('sb_userTypeSelected');
        
        this.notifyAuthCallbacks();
    }
    
    // Clear all user data
    clearUserData() {
        this.handleSignOut();
        
        // Also clear any cached data
        sessionStorage.clear();
        localStorage.removeItem('sb_user_profile');
        localStorage.removeItem('sb_hasSeenUserTypeModal');
        localStorage.removeItem('sb_userTypeSelected');
    }
    
    // Get current user (either user or dealer)
    getCurrentUser() {
        return this.currentUser || this.currentDealer;
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return !!(this.currentUser || this.currentDealer);
    }
    
    // Check if current user is a dealer
    isDealer() {
        return !!this.currentDealer;
    }
    
    // Check if current user is a regular user
    isUser() {
        return !!this.currentUser;
    }
    
    // Get user type
    getUserType() {
        if (this.currentUser) return 'user';
        if (this.currentDealer) return 'dealer';
        return null;
    }
    
    // Add authentication callback
    onAuthStateChanged(callback) {
        this.authCallbacks.push(callback);
        
        // If already initialized, call immediately
        if (this.isInitialized) {
            callback(this.getCurrentUser(), this.getUserType());
        }
    }
    
    // Remove authentication callback
    removeAuthCallback(callback) {
        const index = this.authCallbacks.indexOf(callback);
        if (index > -1) {
            this.authCallbacks.splice(index, 1);
        }
    }
    
    // Notify all callbacks of auth state change
    notifyAuthCallbacks() {
        const currentUser = this.getCurrentUser();
        const userType = this.getUserType();
        
        this.authCallbacks.forEach(callback => {
            try {
                callback(currentUser, userType);
            } catch (error) {
                console.error('Error in auth callback:', error);
            }
        });
    }
    
    // Update user profile
    async updateProfile(updates) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            if (window.auth && window.auth.currentUser) {
                // Update Firebase profile
                if (updates.displayName) {
                    await window.auth.currentUser.updateProfile({
                        displayName: updates.displayName
                    });
                }
                
                // Update Firestore document
                if (window.db) {
                    const collection = this.isDealer() ? 'dealers' : 'users';
                    await window.db.collection(collection).doc(window.auth.currentUser.uid).update(updates);
                }
            }
            
            // Update local data
            const updatedUser = { ...currentUser, ...updates };
            
            if (this.isDealer()) {
                this.currentDealer = updatedUser;
                sessionStorage.setItem('sb_currentDealer', JSON.stringify(updatedUser));
            } else {
                this.currentUser = updatedUser;
                sessionStorage.setItem('sb_currentUser', JSON.stringify(updatedUser));
            }
            
            this.notifyAuthCallbacks();
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Password reset
    async resetPassword(email) {
        try {
            if (window.auth) {
                await window.auth.sendPasswordResetEmail(email);
                return { success: true, message: 'Password reset email sent' };
            } else {
                // Fallback - in production, this would send an actual email
                console.log('Password reset requested for:', email);
                return { success: true, message: 'Password reset instructions sent to your email' };
            }
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const authManager = new AuthManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.authManager = authManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}