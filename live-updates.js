/**
 * Live Updates System
 * StoneBeam-NH Construction Management
 * Handles real-time updates, notifications, and live data synchronization
 */

class LiveUpdatesManager {
    constructor() {
        this.updateInterval = null;
        this.notificationQueue = [];
        this.isActive = true;
        this.lastUpdateTime = Date.now();
        this.updateFrequency = 30000; // 30 seconds

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.startLiveUpdates();
            this.setupVisibilityHandling();
            this.setupEventListeners();
        });
    }

    startLiveUpdates() {
        // Start periodic updates
        this.updateInterval = setInterval(() => {
            if (this.isActive) {
                this.checkForUpdates();
            }
        }, this.updateFrequency);

        // Initial update
        this.checkForUpdates();
    }

    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    setupVisibilityHandling() {
        // Pause updates when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
            } else {
                this.isActive = true;
                // Check for updates immediately when page becomes visible
                this.checkForUpdates();
            }
        });

        // Handle page focus/blur
        window.addEventListener('focus', () => {
            this.isActive = true;
            this.checkForUpdates();
        });

        window.addEventListener('blur', () => {
            this.isActive = false;
        });
    }

    setupEventListeners() {
        // Listen for custom events
        document.addEventListener('quotationSubmitted', (e) => {
            this.handleQuotationSubmitted(e.detail);
        });

        document.addEventListener('orderStatusChanged', (e) => {
            this.handleOrderStatusChanged(e.detail);
        });

        document.addEventListener('newMessage', (e) => {
            this.handleNewMessage(e.detail);
        });
    }

    async checkForUpdates() {
        try {
            // Check for new quotations
            await this.checkNewQuotations();

            // Check for order updates
            await this.checkOrderUpdates();

            // Check for new messages
            await this.checkNewMessages();

            // Update live statistics
            this.updateLiveStats();

            // Update last check time
            this.lastUpdateTime = Date.now();

        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    async checkNewQuotations() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        // Simulate checking for new quotations
        const quotations = JSON.parse(localStorage.getItem('user_quotations') || '[]');
        const recentQuotations = quotations.filter(q =>
            new Date(q.createdAt) > new Date(this.lastUpdateTime)
        );

        recentQuotations.forEach(quotation => {
            this.addLiveUpdate(
                'New Quotation Received',
                `${quotation.dealerName} submitted a quote for ₹${quotation.estimatedCost?.toLocaleString()}`,
                'quotation',
                quotation.id
            );

            this.showNotification(
                'New Quotation',
                `You received a new quotation from ${quotation.dealerName}`,
                'success'
            );
        });
    }

    async checkOrderUpdates() {
        const orders = JSON.parse(localStorage.getItem('sb_orders') || '[]');
        const recentUpdates = orders.filter(order =>
            new Date(order.updatedAt || order.createdAt) > new Date(this.lastUpdateTime)
        );

        recentUpdates.forEach(order => {
            this.addLiveUpdate(
                'Order Status Updated',
                `Order #${order.id} status changed to ${order.status}`,
                'order',
                order.id
            );

            this.showNotification(
                'Order Update',
                `Your order #${order.id} is now ${order.status}`,
                'info'
            );
        });
    }

    async checkNewMessages() {
        const messages = JSON.parse(localStorage.getItem('user_messages') || '[]');
        const recentMessages = messages.filter(msg =>
            new Date(msg.createdAt) > new Date(this.lastUpdateTime) && !msg.read
        );

        recentMessages.forEach(message => {
            this.addLiveUpdate(
                'New Message',
                `${message.senderName}: ${message.subject}`,
                'message',
                message.id
            );

            this.showNotification(
                'New Message',
                `New message from ${message.senderName}`,
                'info'
            );
        });
    }

    updateLiveStats() {
        // Update live statistics on the page
        this.updateProjectCount();
        this.updateQuotationCount();
        this.updateMessageCount();
    }

    updateProjectCount() {
        const projects = JSON.parse(localStorage.getItem('user_projects') || '[]');
        const projectCountElement = document.getElementById('live-project-count');
        if (projectCountElement) {
            projectCountElement.textContent = projects.length;
        }
    }

    updateQuotationCount() {
        const quotations = JSON.parse(localStorage.getItem('user_quotations') || '[]');
        const quotationCountElement = document.getElementById('live-quotation-count');
        if (quotationCountElement) {
            quotationCountElement.textContent = quotations.filter(q => q.status === 'pending').length;
        }
    }

    updateMessageCount() {
        const messages = JSON.parse(localStorage.getItem('user_messages') || '[]');
        const messageCountElement = document.getElementById('live-message-count');
        if (messageCountElement) {
            messageCountElement.textContent = messages.filter(m => !m.read).length;
        }
    }

    addLiveUpdate(title, description, type, relatedId) {
        const updateList = document.querySelector('.update-list');
        if (!updateList) return;

        const updateItem = document.createElement('li');
        updateItem.className = `update-item ${type}`;
        updateItem.innerHTML = `
            <i class="fa-solid ${this.getUpdateIcon(type)}"></i>
            <div>
                <strong>${title}</strong>
                <span>${description}</span>
                <small>Just now</small>
            </div>
        `;

        // Add to top of list
        updateList.insertBefore(updateItem, updateList.firstChild);

        // Remove oldest if list gets too long (max 5)
        if (updateList.children.length > 5) {
            updateList.removeChild(updateList.lastChild);
        }

        // Trigger animation
        updateItem.style.animation = 'fadeIn 0.5s ease-in';
    }

    getUpdateIcon(type) {
        switch (type) {
            case 'quotation': return 'fa-file-invoice';
            case 'order': return 'fa-shopping-cart';
            case 'message': return 'fa-envelope';
            default: return 'fa-info-circle';
        }
    }

    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `live-notification live-notification-${type}`;
        notification.innerHTML = `
            <div class="live-notification-content">
                <i class="fa-solid ${this.getNotificationIcon(type)}"></i>
                <div>
                    <strong>${title}</strong>
                    <p>${message}</p>
                </div>
                <button class="live-notification-close">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
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
        notification.querySelector('.live-notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }

    getCurrentUser() {
        // Try to get current user from AuthManager first
        if (window.authManager && authManager.isLoggedIn()) {
            return authManager.getCurrentUser();
        }

        // Fallback to sessionStorage
        return JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
    }

    handleQuotationSubmitted(data) {
        console.log('Quotation submitted:', data);
        this.addLiveUpdate(
            'Quotation Submitted',
            `Your quotation request has been sent to ${data.dealerCount} dealers`,
            'quotation',
            data.id
        );
    }

    handleOrderStatusChanged(data) {
        console.log('Order status changed:', data);
        this.addLiveUpdate(
            'Order Status Changed',
            `Order #${data.orderId} is now ${data.newStatus}`,
            'order',
            data.orderId
        );
    }

    handleNewMessage(data) {
        console.log('New message:', data);
        this.addLiveUpdate(
            'New Message Received',
            `Message from ${data.senderName}: ${data.subject}`,
            'message',
            data.messageId
        );
    }
}

// Create global instance
const liveUpdatesManager = new LiveUpdatesManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.liveUpdatesManager = liveUpdatesManager;
}
