/**
 * Notification System for Quotation Requests
 * Handles notifications between users and dealers
 */

class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('sb_notifications') || '[]');
        this.init();
    }

    init() {
        this.createNotificationUI();
        this.checkForNotifications();
        setInterval(() => this.checkForNotifications(), 30000); // Check every 30 seconds
    }

    // Create notification UI elements
    createNotificationUI() {
        // Create notification bell icon
        const bellHTML = `
            <div id="notification-bell" class="notification-bell" onclick="notificationSystem.toggleNotifications()">
                <i class="fa-solid fa-bell"></i>
                <span id="notification-count" class="notification-count" style="display: none;">0</span>
            </div>
        `;

        // Create notification panel
        const panelHTML = `
            <div id="notification-panel" class="notification-panel" style="display: none;">
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <button onclick="notificationSystem.markAllAsRead()">Mark All Read</button>
                </div>
                <div id="notification-list" class="notification-list">
                    <div class="no-notifications">No new notifications</div>
                </div>
            </div>
        `;

        // Add to navbar if it exists
        const navbar = document.querySelector('.navbar .nav-actions');
        if (navbar) {
            navbar.insertAdjacentHTML('afterbegin', bellHTML);
        }

        // Add panel to body
        document.body.insertAdjacentHTML('beforeend', panelHTML);

        // Add CSS
        this.addNotificationCSS();
    }

    // Add CSS for notifications
    addNotificationCSS() {
        const css = `
            .notification-bell {
                position: relative;
                cursor: pointer;
                padding: 10px;
                margin-right: 15px;
                color: #fff;
                font-size: 18px;
                transition: color 0.3s;
            }
            .notification-bell:hover {
                color: #a569bd;
            }
            .notification-count {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            .notification-panel {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 350px;
                max-height: 400px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 1000;
                overflow: hidden;
            }
            .notification-header {
                padding: 15px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-header h3 {
                margin: 0;
                color: #fff;
                font-size: 16px;
            }
            .notification-header button {
                background: #a569bd;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            .notification-list {
                max-height: 300px;
                overflow-y: auto;
            }
            .notification-item {
                padding: 15px;
                border-bottom: 1px solid #333;
                cursor: pointer;
                transition: background 0.3s;
            }
            .notification-item:hover {
                background: #2a2a2a;
            }
            .notification-item.unread {
                background: #2c3e50;
                border-left: 4px solid #a569bd;
            }
            .notification-title {
                color: #fff;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .notification-message {
                color: #bbb;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .notification-time {
                color: #666;
                font-size: 12px;
            }
            .no-notifications {
                padding: 20px;
                text-align: center;
                color: #666;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Send notification when user creates quotation request
    notifyDealersNewRequest(requestData) {
        const notification = {
            id: 'req_' + Date.now(),
            type: 'new_request',
            title: 'New Quotation Request',
            message: `${requestData.fullName} has requested a quote for ${requestData.projectTitle}`,
            data: requestData,
            timestamp: new Date().toISOString(),
            read: false,
            targetAudience: 'dealers'
        };

        this.addNotification(notification);
        this.showToast('Quotation request sent to dealers!', 'success');
    }

    // Send notification when dealer submits quotation
    notifyUserQuotationReceived(quoteData, requestData) {
        const notification = {
            id: 'quote_' + Date.now(),
            type: 'quote_received',
            title: 'New Quotation Received',
            message: `${quoteData.contractorName} has sent you a quotation for $${quoteData.price.toLocaleString()}`,
            data: { quote: quoteData, request: requestData },
            timestamp: new Date().toISOString(),
            read: false,
            targetAudience: 'users',
            userId: requestData.email || requestData.fullName
        };

        this.addNotification(notification);
        this.showToast('New quotation received!', 'info');
    }

    // Send notification when user accepts/rejects quotation
    notifyDealerQuotationStatus(quoteData, status, userName) {
        const notification = {
            id: 'status_' + Date.now(),
            type: 'quote_status',
            title: `Quotation ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `${userName} has ${status} your quotation for $${quoteData.price.toLocaleString()}`,
            data: { quote: quoteData, status },
            timestamp: new Date().toISOString(),
            read: false,
            targetAudience: 'dealers',
            dealerId: quoteData.contractorName
        };

        this.addNotification(notification);
        this.showToast(`Dealer notified of quotation ${status}!`, 'success');
    }

    // Add notification to storage
    addNotification(notification) {
        this.notifications.unshift(notification);
        localStorage.setItem('sb_notifications', JSON.stringify(this.notifications));
        this.updateNotificationCount();
    }

    // Check for new notifications
    checkForNotifications() {
        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
        const userType = sessionStorage.getItem('sb_userType') || 'user';
        
        if (!currentUser) return;

        const relevantNotifications = this.notifications.filter(n => {
            if (userType === 'dealer') {
                return n.targetAudience === 'dealers' && !n.read;
            } else {
                return n.targetAudience === 'users' && 
                       (n.userId === currentUser.email || n.userId === currentUser.name) && 
                       !n.read;
            }
        });

        this.updateNotificationCount(relevantNotifications.length);
        this.renderNotifications(relevantNotifications);
    }

    // Update notification count badge
    updateNotificationCount(count = null) {
        const countElement = document.getElementById('notification-count');
        if (!countElement) return;

        if (count === null) {
            const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
            const userType = sessionStorage.getItem('sb_userType') || 'user';
            
            if (!currentUser) {
                countElement.style.display = 'none';
                return;
            }

            count = this.notifications.filter(n => {
                if (userType === 'dealer') {
                    return n.targetAudience === 'dealers' && !n.read;
                } else {
                    return n.targetAudience === 'users' && 
                           (n.userId === currentUser.email || n.userId === currentUser.name) && 
                           !n.read;
                }
            }).length;
        }

        if (count > 0) {
            countElement.textContent = count > 99 ? '99+' : count;
            countElement.style.display = 'flex';
        } else {
            countElement.style.display = 'none';
        }
    }

    // Render notifications in panel
    renderNotifications(notifications = null) {
        const listElement = document.getElementById('notification-list');
        if (!listElement) return;

        if (!notifications) {
            const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
            const userType = sessionStorage.getItem('sb_userType') || 'user';
            
            if (!currentUser) {
                listElement.innerHTML = '<div class="no-notifications">Please login to view notifications</div>';
                return;
            }

            notifications = this.notifications.filter(n => {
                if (userType === 'dealer') {
                    return n.targetAudience === 'dealers';
                } else {
                    return n.targetAudience === 'users' && 
                           (n.userId === currentUser.email || n.userId === currentUser.name);
                }
            }).slice(0, 20); // Show last 20 notifications
        }

        if (notifications.length === 0) {
            listElement.innerHTML = '<div class="no-notifications">No notifications</div>';
            return;
        }

        listElement.innerHTML = notifications.map(n => `
            <div class="notification-item ${!n.read ? 'unread' : ''}" onclick="notificationSystem.handleNotificationClick('${n.id}')">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time">${this.formatTime(n.timestamp)}</div>
            </div>
        `).join('');
    }

    // Handle notification click
    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read
        notification.read = true;
        localStorage.setItem('sb_notifications', JSON.stringify(this.notifications));

        // Navigate based on notification type
        switch (notification.type) {
            case 'new_request':
                window.location.href = 'dealer-dashboard.html';
                break;
            case 'quote_received':
                window.location.href = 'view-quotations.html';
                break;
            case 'quote_status':
                window.location.href = 'dealer-dashboard.html';
                break;
        }

        this.toggleNotifications();
        this.updateNotificationCount();
    }

    // Toggle notification panel
    toggleNotifications() {
        const panel = document.getElementById('notification-panel');
        if (!panel) return;

        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            this.checkForNotifications();
        } else {
            panel.style.display = 'none';
        }
    }

    // Mark all notifications as read
    markAllAsRead() {
        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
        const userType = sessionStorage.getItem('sb_userType') || 'user';
        
        if (!currentUser) return;

        this.notifications.forEach(n => {
            if (userType === 'dealer' && n.targetAudience === 'dealers') {
                n.read = true;
            } else if (userType === 'user' && n.targetAudience === 'users' && 
                      (n.userId === currentUser.email || n.userId === currentUser.name)) {
                n.read = true;
            }
        });

        localStorage.setItem('sb_notifications', JSON.stringify(this.notifications));
        this.updateNotificationCount();
        this.renderNotifications();
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // Format timestamp
    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return time.toLocaleDateString();
    }
}

// Initialize notification system
let notificationSystem;
document.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
});

// Close notification panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notification-panel');
    const bell = document.getElementById('notification-bell');
    
    if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
        panel.style.display = 'none';
    }
});