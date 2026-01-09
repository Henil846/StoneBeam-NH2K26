// Profile Management System
class ProfileManager {
    constructor() {
        this.currentUser = this.loadUserData();
        this.projects = this.loadProjects();
        this.quotes = this.loadQuotes();
        this.reviews = this.loadReviews();
        this.activities = this.loadActivities();
        this.init();
        this.initRFQIntegration();
    }

    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.loadProfileData();
        this.renderOverview();
        this.renderProjects();
        this.renderQuotes();
        this.renderReviews();
        this.renderActivities();
    }

    // Tab Management
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // Remove active class from all tabs and panels
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Profile form submission
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Quote filter
        document.getElementById('quoteFilter').addEventListener('change', (e) => {
            this.filterQuotes(e.target.value);
        });

        // Preference toggles
        document.querySelectorAll('.toggle input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.updatePreference(e.target.id, e.target.checked);
            });
        });
    }

    // Data Loading Methods
    loadUserData() {
        // Use AuthManager if available (preferred method)
        if (window.authManager && authManager.isLoggedIn()) {
            const currentUser = authManager.getCurrentUser();
            const userType = authManager.getUserType();

            console.log("Loading user data via AuthManager:", currentUser, "Type:", userType);

            const defaultUser = {
                name: 'John Doe',
                email: 'john.doe@stonebeamnh.com',
                phone: '+91-9876543210',
                location: 'Ahmedabad, Gujarat',
                bio: 'Experienced construction professional with 5+ years in project management.',
                avatar: 'JD',
                memberSince: '2023',
                verified: true,
                preferences: {
                    emailNotifications: true,
                    smsNotifications: false,
                    marketingComms: false
                }
            };

            // Use data from AuthManager
            if (currentUser) {
                defaultUser.name = currentUser.displayName || currentUser.name || defaultUser.name;
                defaultUser.email = currentUser.email || defaultUser.email;
                defaultUser.phone = currentUser.phone || defaultUser.phone;
                defaultUser.avatar = defaultUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

                // Set member since from creation date if available
                if (currentUser.createdAt) {
                    const createdDate = new Date(currentUser.createdAt);
                    defaultUser.memberSince = createdDate.toLocaleDateString('en-US', { year: 'numeric' });
                }
            }

            const saved = localStorage.getItem('sb_user_profile');
            return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser;
        }

        // Fallback to original logic if AuthManager not available
        // First check for current logged-in user
        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
        const currentDealer = JSON.parse(sessionStorage.getItem('sb_currentDealer') || 'null');

        const defaultUser = {
            name: 'John Doe',
            email: 'john.doe@stonebeamnh.com',
            phone: '+91-9876543210',
            location: 'Ahmedabad, Gujarat',
            bio: 'Experienced construction professional with 5+ years in project management.',
            avatar: 'JD',
            memberSince: '2023',
            verified: true,
            preferences: {
                emailNotifications: true,
                smsNotifications: false,
                marketingComms: false
            }
        };

        // If user is logged in, use their data
        if (currentUser) {
            defaultUser.name = currentUser.displayName || currentUser.name || defaultUser.name;
            defaultUser.email = currentUser.email || defaultUser.email;
            defaultUser.avatar = defaultUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        } else if (currentDealer) {
            defaultUser.name = currentDealer.name || currentDealer.businessName || defaultUser.name;
            defaultUser.email = currentDealer.email || defaultUser.email;
            defaultUser.avatar = defaultUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }

        const saved = localStorage.getItem('sb_user_profile');
        return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser;
    }

    loadProjects() {
        const defaultProjects = [
            {
                id: 1,
                title: 'Kitchen Renovation',
                description: 'Complete kitchen makeover with modern appliances',
                status: 'active',
                budget: '₹5,00,000',
                startDate: '2024-12-01',
                contractor: 'Elite Builders',
                progress: 65
            },
            {
                id: 2,
                title: 'Bathroom Remodeling',
                description: 'Luxury bathroom renovation with premium fixtures',
                status: 'completed',
                budget: '₹3,50,000',
                startDate: '2024-10-15',
                contractor: 'Modern Interiors',
                progress: 100
            },
            {
                id: 3,
                title: 'Home Extension',
                description: 'Adding extra bedroom and living space',
                status: 'pending',
                budget: '₹12,00,000',
                startDate: '2025-02-01',
                contractor: 'Premium Constructions',
                progress: 0
            }
        ];

        const saved = localStorage.getItem('sb_user_projects');
        return saved ? JSON.parse(saved) : defaultProjects;
    }

    async loadQuotes() {
        // Try to load from Firestore first
        if (window.rfqManager) {
            try {
                const firestoreQuotes = await window.rfqManager.loadQuotes();
                if (firestoreQuotes.length > 0) {
                    // Convert Firestore format to display format
                    return firestoreQuotes.map(quote => ({
                        id: quote.id,
                        projectTitle: quote.projectTitle,
                        contractor: quote.dealerName || 'Dealer',
                        amount: quote.dealerPrice ? `₹${quote.dealerPrice}` : 'Pending',
                        status: quote.status === 'pending_dealer' ? 'pending' : quote.status,
                        date: quote.createdAt ? new Date(quote.createdAt.toDate()).toLocaleDateString() : new Date().toLocaleDateString(),
                        validUntil: quote.quotedAt ? new Date(new Date(quote.quotedAt.toDate()).getTime() + 60*24*60*60*1000).toLocaleDateString() : 'N/A'
                    }));
                }
            } catch (error) {
                console.error('Error loading quotes from Firestore:', error);
            }
        }

        // Fallback to localStorage
        const defaultQuotes = [
            {
                id: 1,
                projectTitle: 'Kitchen Renovation',
                contractor: 'Elite Builders',
                amount: '₹5,00,000',
                status: 'approved',
                date: '2024-11-20',
                validUntil: '2025-01-20'
            },
            {
                id: 2,
                projectTitle: 'Roofing Repair',
                contractor: 'Roof Masters',
                amount: '₹1,50,000',
                status: 'pending',
                date: '2024-12-15',
                validUntil: '2025-02-15'
            },
            {
                id: 3,
                projectTitle: 'Garden Landscaping',
                contractor: 'Green Spaces',
                amount: '₹2,25,000',
                status: 'rejected',
                date: '2024-12-10',
                validUntil: '2025-02-10'
            }
        ];

        const saved = localStorage.getItem('sb_user_quotes');
        return saved ? JSON.parse(saved) : defaultQuotes;
    }

    loadReviews() {
        return [
            {
                id: 1,
                projectTitle: 'Bathroom Remodeling',
                contractor: 'Modern Interiors',
                rating: 5,
                comment: 'Excellent work quality and timely completion. Highly recommended!',
                date: '2024-12-01'
            },
            {
                id: 2,
                projectTitle: 'Living Room Renovation',
                contractor: 'Design Pro',
                rating: 4,
                comment: 'Good work overall, minor delays but quality was satisfactory.',
                date: '2024-11-15'
            },
            {
                id: 3,
                projectTitle: 'Electrical Work',
                contractor: 'Power Solutions',
                rating: 5,
                comment: 'Professional service, clean work, and fair pricing.',
                date: '2024-10-20'
            }
        ];
    }

    loadActivities() {
        return [
            {
                id: 1,
                type: 'quote_received',
                title: 'New quote received',
                description: 'Roofing Repair - ₹1,50,000',
                time: '2 hours ago',
                icon: 'fa-file-invoice'
            },
            {
                id: 2,
                type: 'project_update',
                title: 'Project milestone reached',
                description: 'Kitchen Renovation - 65% complete',
                time: '1 day ago',
                icon: 'fa-building'
            },
            {
                id: 3,
                type: 'payment',
                title: 'Payment processed',
                description: 'Bathroom Remodeling - ₹3,50,000',
                time: '3 days ago',
                icon: 'fa-credit-card'
            },
            {
                id: 4,
                type: 'review',
                title: 'Review submitted',
                description: 'Rated Modern Interiors - 5 stars',
                time: '1 week ago',
                icon: 'fa-star'
            }
        ];
    }

    // Render Methods
    loadProfileData() {
        document.getElementById('name').value = this.currentUser.name;
        document.getElementById('email').value = this.currentUser.email;
        document.getElementById('phone').value = this.currentUser.phone;
        document.getElementById('location').value = this.currentUser.location;
        document.getElementById('bio').value = this.currentUser.bio;

        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileLocation').textContent = this.currentUser.location;
        document.getElementById('memberSince').textContent = this.currentUser.memberSince;
        document.getElementById('avatar').textContent = this.currentUser.avatar;

        // Load preferences
        document.getElementById('emailNotifications').checked = this.currentUser.preferences.emailNotifications;
        document.getElementById('smsNotifications').checked = this.currentUser.preferences.smsNotifications;
        document.getElementById('marketingComms').checked = this.currentUser.preferences.marketingComms;
    }

    renderOverview() {
        // Update stats
        document.getElementById('totalProjects').textContent = this.projects.length;
        document.getElementById('activeQuotes').textContent = this.quotes.filter(q => q.status === 'pending').length;

        this.renderActivities();
    }

    renderActivities() {
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = this.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fa-solid ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description} • ${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        projectsGrid.innerHTML = this.projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <h4>${project.title}</h4>
                    <span class="project-status ${project.status}">${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
                </div>
                <p>${project.description}</p>
                <div class="project-details">
                    <div class="project-meta">
                        <span><i class="fa-solid fa-rupee-sign"></i> ${project.budget}</span>
                        <span><i class="fa-solid fa-calendar"></i> ${project.startDate}</span>
                        <span><i class="fa-solid fa-user-tie"></i> ${project.contractor}</span>
                    </div>
                    ${project.status === 'active' ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                        </div>
                        <div class="progress-text">${project.progress}% Complete</div>
                    ` : ''}
                </div>
                <div class="project-actions">
                    <button class="btn-secondary" onclick="profileManager.viewProject(${project.id})">
                        <i class="fa-solid fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    async renderQuotes() {
        // Reload quotes from Firestore
        this.quotes = await this.loadQuotes();
        this.filterQuotes('all');
    }

    filterQuotes(status) {
        const quotesList = document.getElementById('quotesList');
        const filteredQuotes = status === 'all' ? this.quotes : this.quotes.filter(q => q.status === status);

        quotesList.innerHTML = filteredQuotes.map(quote => `
            <div class="quote-card">
                <div class="quote-header">
                    <h4>${quote.projectTitle}</h4>
                    <span class="quote-status ${quote.status}">${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</span>
                </div>
                <div class="quote-details">
                    <div class="quote-meta">
                        <span><i class="fa-solid fa-user-tie"></i> ${quote.contractor}</span>
                        <span><i class="fa-solid fa-rupee-sign"></i> ${quote.amount}</span>
                        <span><i class="fa-solid fa-calendar"></i> Valid until ${quote.validUntil}</span>
                    </div>
                </div>
                <div class="quote-actions">
                    ${quote.status === 'pending' ? `
                        <button class="btn-primary" onclick="profileManager.approveQuote('${quote.id}')">
                            <i class="fa-solid fa-check"></i> Approve
                        </button>
                        <button class="btn-secondary" onclick="profileManager.rejectQuote('${quote.id}')">
                            <i class="fa-solid fa-times"></i> Reject
                        </button>
                    ` : ''}
                    ${quote.status === 'quoted' ? `
                        <button class="btn-primary" onclick="rfqManager.acceptQuote('${quote.id}')">
                            <i class="fa-solid fa-check"></i> Accept
                        </button>
                        <button class="btn-secondary" onclick="rfqManager.rejectQuote('${quote.id}')">
                            <i class="fa-solid fa-times"></i> Reject
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="profileManager.downloadQuote(${quote.id})">
                        <i class="fa-solid fa-download"></i> Download
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderReviews() {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = this.reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <h4>${review.projectTitle}</h4>
                    <div class="review-rating">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fa-solid fa-star ${i < review.rating ? 'active' : ''}"></i>
                        `).join('')}
                    </div>
                </div>
                <p>${review.comment}</p>
                <div class="review-meta">
                    <span><i class="fa-solid fa-user-tie"></i> ${review.contractor}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${review.date}</span>
                </div>
            </div>
        `).join('');
    }

    // Action Methods
    saveProfile() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            bio: document.getElementById('bio').value
        };

        this.currentUser = { ...this.currentUser, ...formData };
        this.currentUser.avatar = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();

        localStorage.setItem('sb_user_profile', JSON.stringify(this.currentUser));
        this.loadProfileData();
        this.showToast('Profile updated successfully!', 'success');
    }

    updatePreference(prefId, value) {
        this.currentUser.preferences[prefId] = value;
        localStorage.setItem('sb_user_profile', JSON.stringify(this.currentUser));

        const prefName = prefId.replace(/([A-Z])/g, ' $1').toLowerCase();
        this.showToast(`${prefName} ${value ? 'enabled' : 'disabled'}`, 'success');

        // Save preference without email functionality
        console.log(`Preference updated: ${prefName} = ${value}`);
    }

    async approveQuote(quoteId) {
        // Try RFQ manager first for Firestore quotes
        if (window.rfqManager && typeof quoteId === 'string') {
            await window.rfqManager.acceptQuote(quoteId);
            await this.renderQuotes();
            return;
        }

        // Fallback for localStorage quotes
        const quote = this.quotes.find(q => q.id == quoteId);
        if (quote) {
            quote.status = 'approved';
            localStorage.setItem('sb_user_quotes', JSON.stringify(this.quotes));
            this.renderQuotes();
            this.showToast(`Quote from ${quote.contractor} approved!`, 'success');
        }
    }

    async rejectQuote(quoteId) {
        // Try RFQ manager first for Firestore quotes
        if (window.rfqManager && typeof quoteId === 'string') {
            await window.rfqManager.rejectQuote(quoteId);
            await this.renderQuotes();
            return;
        }

        // Fallback for localStorage quotes
        const quote = this.quotes.find(q => q.id == quoteId);
        if (quote) {
            quote.status = 'rejected';
            localStorage.setItem('sb_user_quotes', JSON.stringify(this.quotes));
            this.renderQuotes();
            this.showToast(`Quote from ${quote.contractor} rejected`, 'warning');
        }
    }

    downloadQuote(quoteId) {
        const quote = this.quotes.find(q => q.id === quoteId);
        if (quote) {
            this.showToast(`Downloading quote from ${quote.contractor}...`, 'info');
            // Simulate download
            setTimeout(() => {
                this.showToast('Quote downloaded successfully!', 'success');
            }, 1500);
        }
    }

    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.showToast(`Opening project: ${project.title}`, 'info');
            // In a real app, this would navigate to project details
        }
    }

    createProject() {
        this.showToast('Redirecting to project creation...', 'info');
        // In a real app, this would navigate to project creation page
        setTimeout(() => {
            window.location.href = 'new-project.html';
        }, 1000);
    }

    // RFQ Integration
    initRFQIntegration() {
        // Wait for RFQ manager to be available
        const checkRFQ = () => {
            if (window.rfqManager) {
                console.log('RFQ Manager integrated with ProfileManager');
            } else {
                setTimeout(checkRFQ, 100);
            }
        };
        checkRFQ();
    }

    // Send Request for Quote
    async sendRequestForQuote(projectDetails) {
        if (window.rfqManager) {
            try {
                const quoteId = await window.rfqManager.sendRequestForQuote(projectDetails);
                await this.renderQuotes(); // Refresh quotes display
                return quoteId;
            } catch (error) {
                console.error('Error sending quote request:', error);
                this.showToast('Failed to send quote request', 'error');
            }
        } else {
            this.showToast('RFQ system not available', 'error');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type} show`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }
}

// Global Functions
function editProfile() {
    document.querySelector('[data-tab="settings"]').click();
}

function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: 'My StoneBeam-NH Profile',
            text: 'Check out my construction projects and reviews on StoneBeam-NH',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        profileManager.showToast('Profile link copied to clipboard!', 'info');
    }
}

function changeCover() {
    profileManager.showToast('Cover photo upload feature coming soon!', 'info');
}

function changeAvatar() {
    profileManager.showToast('Avatar upload feature coming soon!', 'info');
}

function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
        profileManager.showToast('Password changed successfully!', 'success');
        console.log('Password change requested');
    } else if (newPassword) {
        profileManager.showToast('Password must be at least 6 characters', 'error');
    }
}

function enable2FA() {
    const confirm2FA = confirm('Enable two-factor authentication for your account?');
    if (confirm2FA) {
        profileManager.showToast('2FA enabled successfully!', 'success');
        console.log('2FA enabled');
    }
}

function deleteAccount() {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
        const finalConfirm = confirm('This will permanently delete all your data. Are you absolutely sure?');
        if (finalConfirm) {
            // Clear all user data
            sessionStorage.clear();
            localStorage.removeItem('sb_user_profile');
            profileManager.showToast('Account deleted successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize Profile Manager
let profileManager;

document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
    console.log('StoneBeam-NH Profile System Initialized');
});