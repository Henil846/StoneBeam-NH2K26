// Real Web Profile Functionality
class ProfileManager {
    constructor() {
        this.profile = this.loadProfile();
        this.ads = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAds();
        this.updateDisplay();
    }

    loadProfile() {
        const saved = localStorage.getItem('stonebeam_profile');
        return saved ? JSON.parse(saved) : {
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '',
            location: 'New York, NY',
            bio: '',
            projects: 12,
            quotes: 5,
            rating: 4.8
        };
    }

    saveProfile() {
        localStorage.setItem('stonebeam_profile', JSON.stringify(this.profile));
        this.showNotification('Profile updated successfully!');
    }

    setupEventListeners() {
        document.getElementById('profileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
    }

    updateProfile() {
        this.profile.name = document.getElementById('name').value;
        this.profile.email = document.getElementById('email').value;
        this.profile.phone = document.getElementById('phone').value;
        this.profile.location = document.getElementById('location').value;
        this.profile.bio = document.getElementById('bio').value;
        this.saveProfile();
        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('profileName').textContent = this.profile.name;
        document.getElementById('profileEmail').textContent = this.profile.email;
        document.getElementById('avatar').textContent = this.profile.name.split(' ').map(n => n[0]).join('');
        document.getElementById('totalProjects').textContent = this.profile.projects;
        document.getElementById('activeQuotes').textContent = this.profile.quotes;
    }

    loadAds() {
        // Simulate API call
        this.ads = [
            { id: 1, title: 'Kitchen Renovation', price: '$25,000', type: 'kitchen' },
            { id: 2, title: 'Bathroom Remodel', price: '$15,000', type: 'bathroom' },
            { id: 3, title: 'Home Extension', price: '$50,000', type: 'extension' }
        ];
    }

    requestQuote(service) {
        this.profile.quotes++;
        this.saveProfile();
        this.updateDisplay();
        this.showNotification(`Quote requested for ${service}!`);
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => notification.style.display = 'none', 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Global functions for HTML onclick
function contactDealer(service) {
    window.profileManager.requestQuote(service);
}