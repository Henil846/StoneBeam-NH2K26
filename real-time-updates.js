/**
 * Real-Time Live Updates System
 * StoneBeam-NH Construction Management
 * Professional real-time updates with WebSocket, Server-Sent Events, and fallback polling
 */

class RealTimeUpdates {
    constructor() {
        this.ws = null;
        this.eventSource = null;
        this.pollingInterval = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.lastUpdateId = 0;
        this.updateQueue = [];
        this.subscribers = new Map();
        this.heartbeatInterval = null;
        this.connectionType = null; // 'websocket', 'sse', 'polling'

        this.init();
    }

    async init() {
        console.log('🔄 Initializing Real-Time Updates System...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Initialize connection
        this.setupConnectionHandlers();
        this.connect();
        this.setupUI();
        this.startHeartbeat();
    }

    setupConnectionHandlers() {
        // Handle connection state changes
        window.addEventListener('online', () => {
            console.log('🌐 Network connection restored');
            this.connect();
        });

        window.addEventListener('offline', () => {
            console.log('📵 Network connection lost');
            this.disconnect();
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.disconnect();
        });
    }

    async connect() {
        if (this.isConnected) {
            return;
        }

        console.log('🔌 Attempting to connect to real-time updates...');

        // Try WebSocket first (best performance)
        if (await this.tryWebSocket()) {
            return;
        }

        // Fallback to Server-Sent Events
        if (await this.tryServerSentEvents()) {
            return;
        }

        // Final fallback to polling
        this.tryPolling();
    }

    async tryWebSocket() {
        return new Promise((resolve) => {
            try {
                // Determine WebSocket URL based on current environment
                const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${wsProtocol}//${window.location.host}/api/live-updates`;

                console.log('🌐 Attempting WebSocket connection to:', wsUrl);

                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('✅ WebSocket connected successfully');
                    this.connectionType = 'websocket';
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    resolve(true);

                    // Subscribe to user-specific updates
                    this.subscribeToUserUpdates();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };

                this.ws.onclose = (event) => {
                    console.log('❌ WebSocket disconnected:', event.code, event.reason);
                    this.isConnected = false;
                    this.connectionType = null;

                    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                        setTimeout(() => this.connect(), this.reconnectDelay);
                        this.reconnectAttempts++;
                        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Exponential backoff
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.isConnected = false;
                    resolve(false);
                };

            } catch (error) {
                console.error('❌ WebSocket initialization failed:', error);
                resolve(false);
            }
        });
    }

    async tryServerSentEvents() {
        return new Promise((resolve) => {
            try {
                const sseUrl = `/api/live-updates-sse`;
                console.log('📡 Attempting Server-Sent Events connection to:', sseUrl);

                this.eventSource = new EventSource(sseUrl);

                this.eventSource.onopen = () => {
                    console.log('✅ Server-Sent Events connected successfully');
                    this.connectionType = 'sse';
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve(true);
                };

                this.eventSource.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };

                this.eventSource.onerror = (error) => {
                    console.error('❌ Server-Sent Events error:', error);
                    this.isConnected = false;
                    resolve(false);
                };

                this.eventSource.onclose = () => {
                    console.log('❌ Server-Sent Events disconnected');
                    this.isConnected = false;
                    this.connectionType = null;
                };

            } catch (error) {
                console.error('❌ Server-Sent Events initialization failed:', error);
                resolve(false);
            }
        });
    }

    tryPolling() {
        console.log('⏱️ Falling back to HTTP polling');
        this.connectionType = 'polling';
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Start polling every 5 seconds
        this.pollingInterval = setInterval(() => {
            this.pollForUpdates();
        }, 5000);
    }

    async pollForUpdates() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return;

            const response = await fetch(`/api/updates?lastId=${this.lastUpdateId}&userId=${currentUser.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.ok) {
                const updates = await response.json();
                updates.forEach(update => this.handleMessage(update));
            } else {
                console.warn('⚠️ Polling request failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Polling error:', error);
        }
    }

    handleMessage(data) {
        console.log('📨 Received real-time update:', data);

        // Update last update ID
        if (data.id) {
            this.lastUpdateId = Math.max(this.lastUpdateId, data.id);
        }

        // Handle different types of updates
        switch (data.type) {
            case 'quotation':
                this.handleQuotationUpdate(data);
                break;
            case 'order':
                this.handleOrderUpdate(data);
                break;
            case 'message':
                this.handleMessageUpdate(data);
                break;
            case 'notification':
                this.handleNotificationUpdate(data);
                break;
            case 'system':
                this.handleSystemUpdate(data);
                break;
            case 'heartbeat':
                // Handle heartbeat response
                break;
            default:
                this.handleGenericUpdate(data);
        }

        // Notify all subscribers
        this.notifySubscribers(data);
    }

    handleQuotationUpdate(data) {
        console.log('💰 Quotation Update:', data);

        // Update UI elements
        this.updateQuotationCounter(data);
        this.showQuotationNotification(data);
        this.updateQuotationList(data);

        // Trigger custom event
        this.dispatchCustomEvent('quotationUpdate', data);
    }

    handleOrderUpdate(data) {
        console.log('📦 Order Update:', data);

        // Update UI elements
        this.updateOrderCounter(data);
        this.showOrderNotification(data);
        this.updateOrderList(data);

        // Trigger custom event
        this.dispatchCustomEvent('orderUpdate', data);
    }

    handleMessageUpdate(data) {
        console.log('💬 Message Update:', data);

        // Update UI elements
        this.updateMessageCounter(data);
        this.showMessageNotification(data);
        this.updateMessageList(data);

        // Trigger custom event
        this.dispatchCustomEvent('messageUpdate', data);
    }

    handleNotificationUpdate(data) {
        console.log('🔔 Notification Update:', data);

        // Update UI elements
        this.updateNotificationBadge(data);
        this.showNotificationToast(data);
        this.updateNotificationList(data);

        // Trigger custom event
        this.dispatchCustomEvent('notificationUpdate', data);
    }

    handleSystemUpdate(data) {
        console.log('⚙️ System Update:', data);

        // Handle system-wide updates
        if (data.maintenance) {
            this.showMaintenanceNotification(data);
        }

        if (data.announcement) {
            this.showAnnouncement(data);
        }

        // Trigger custom event
        this.dispatchCustomEvent('systemUpdate', data);
    }

    handleGenericUpdate(data) {
        console.log('📊 Generic Update:', data);

        // Handle any other type of update
        this.addToUpdateList(data);
        this.showGenericNotification(data);

        // Trigger custom event
        this.dispatchCustomEvent('genericUpdate', data);
    }

    // UI Update Methods
    updateQuotationCounter(data) {
        const counter = document.getElementById('quotation-counter');
        if (counter) {
            const currentCount = parseInt(counter.textContent) || 0;
            const newCount = data.action === 'new' ? currentCount + 1 :
                data.action === 'delete' ? currentCount - 1 : currentCount;
            counter.textContent = newCount;
            this.animateCounter(counter);
        }
    }

    updateOrderCounter(data) {
        const counter = document.getElementById('order-counter');
        if (counter) {
            const currentCount = parseInt(counter.textContent) || 0;
            const newCount = data.action === 'new' ? currentCount + 1 :
                data.action === 'delete' ? currentCount - 1 : currentCount;
            counter.textContent = newCount;
            this.animateCounter(counter);
        }
    }

    updateMessageCounter(data) {
        const counter = document.getElementById('message-counter');
        if (counter) {
            const currentCount = parseInt(counter.textContent) || 0;
            const newCount = data.action === 'new' ? currentCount + 1 :
                data.action === 'read' ? currentCount - 1 : currentCount;
            counter.textContent = newCount;
            this.animateCounter(counter);
        }
    }

    updateNotificationBadge(data) {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            const newCount = data.action === 'new' ? currentCount + 1 :
                data.action === 'read' ? currentCount - 1 : currentCount;
            badge.textContent = newCount;
            badge.style.display = newCount > 0 ? 'block' : 'none';
            this.animateBadge(badge);
        }
    }

    animateCounter(element) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    animateBadge(badge) {
        badge.style.transform = 'scale(1.3)';
        badge.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 200);
    }

    // Notification Methods
    showQuotationNotification(data) {
        const message = data.action === 'new' ?
            `New quotation from ${data.contractorName}: ${data.projectTitle}` :
            data.action === 'updated' ?
                `Quotation updated: ${data.projectTitle}` :
                `Quotation ${data.action}: ${data.projectTitle}`;

        this.showRealTimeNotification(message, 'quotation', data);
    }

    showOrderNotification(data) {
        const message = data.action === 'new' ?
            `New order: ${data.orderId}` :
            data.action === 'updated' ?
                `Order ${data.orderId} status: ${data.status}` :
                `Order ${data.action}: ${data.orderId}`;

        this.showRealTimeNotification(message, 'order', data);
    }

    showMessageNotification(data) {
        const message = `New message from ${data.senderName}: ${data.subject}`;
        this.showRealTimeNotification(message, 'message', data);
    }

    showNotificationToast(data) {
        const message = data.title || 'New notification';
        this.showRealTimeNotification(message, 'notification', data);
    }

    showMaintenanceNotification(data) {
        this.showSystemAlert('🔧 System Maintenance', data.message, 'warning');
    }

    showAnnouncement(data) {
        this.showSystemAlert('📢 System Announcement', data.message, 'info');
    }

    showRealTimeNotification(message, type, data) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `real-time-notification real-time-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="notification-body">
                    <div class="notification-title">${message}</div>
                    <div class="notification-time">${this.formatTime(data.timestamp)}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Play notification sound (optional)
        this.playNotificationSound();
    }

    showSystemAlert(title, message, type = 'info') {
        // Create system alert
        const alert = document.createElement('div');
        alert.className = `system-alert system-alert-${type}`;
        alert.innerHTML = `
            <div class="alert-header">
                <h3>${title}</h3>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="alert-body">
                ${message}
            </div>
        `;

        // Add to page
        document.body.appendChild(alert);

        // Animate in
        setTimeout(() => alert.classList.add('show'), 100);

        // Auto remove after 10 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 10000);
    }

    getNotificationIcon(type) {
        const icons = {
            quotation: '<i class="fa-solid fa-file-invoice"></i>',
            order: '<i class="fa-solid fa-shopping-cart"></i>',
            message: '<i class="fa-solid fa-envelope"></i>',
            notification: '<i class="fa-solid fa-bell"></i>',
            system: '<i class="fa-solid fa-cog"></i>',
            generic: '<i class="fa-solid fa-info-circle"></i>'
        };
        return icons[type] || icons.generic;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    playNotificationSound() {
        try {
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // 800 Hz beep
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1; // Low volume

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1); // 100ms beep
        } catch (error) {
            console.log('🔇 Could not play notification sound:', error);
        }
    }

    // WebSocket Methods
    subscribeToUserUpdates() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const subscription = {
            type: 'subscribe',
            userId: currentUser.id,
            channels: ['quotations', 'orders', 'messages', 'notifications']
        };

        this.ws.send(JSON.stringify(subscription));
        console.log('📡 Subscribed to user updates for:', currentUser.id);
    }

    sendUserAction(action, data) {
        if (!this.isConnected) {
            console.warn('⚠️ Cannot send action - not connected');
            return;
        }

        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const message = {
            type: 'userAction',
            userId: currentUser.id,
            action: action,
            data: data,
            timestamp: Date.now()
        };

        if (this.connectionType === 'websocket' && this.ws) {
            this.ws.send(JSON.stringify(message));
        } else {
            // Fallback to HTTP for other connection types
            this.sendActionViaHTTP(message);
        }
    }

    async sendActionViaHTTP(message) {
        try {
            await fetch('/api/user-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
        } catch (error) {
            console.error('❌ Failed to send user action:', error);
        }
    }

    // Connection Management
    disconnect() {
        console.log('🔌 Disconnecting from real-time updates');

        this.isConnected = false;
        this.connectionType = null;

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        this.stopHeartbeat();
    }

    pauseUpdates() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    resumeUpdates() {
        if (this.isConnected && !this.heartbeatInterval) {
            this.startHeartbeat();
        }
    }

    startHeartbeat() {
        // Send heartbeat every 30 seconds to keep connection alive
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendHeartbeat();
            }
        }, 30000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    sendHeartbeat() {
        const heartbeat = {
            type: 'heartbeat',
            timestamp: Date.now()
        };

        if (this.connectionType === 'websocket' && this.ws) {
            this.ws.send(JSON.stringify(heartbeat));
        }
    }

    // Utility Methods
    getCurrentUser() {
        // Try to get current user from AuthManager first
        if (window.authManager && authManager.isLoggedIn()) {
            return authManager.getCurrentUser();
        }

        // Fallback to sessionStorage
        return JSON.parse(sessionStorage.getItem('sb_currentUser') || 'null');
    }

    setupUI() {
        // Setup connection status indicator
        this.createConnectionIndicator();
        this.setupNotificationSettings();
    }

    createConnectionIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'connection-status';
        indicator.className = 'connection-indicator';
        indicator.innerHTML = `
            <div class="status-dot offline"></div>
            <span class="status-text">Offline</span>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .connection-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .status-dot.online { background: #4CAF50; }
            .status-dot.connecting { background: #FF9800; }
            .status-dot.offline { background: #F44336; }
            
            .status-text {
                font-weight: 600;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(indicator);
    }

    updateConnectionIndicator(status) {
        const indicator = document.getElementById('connection-status');
        if (!indicator) return;

        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');

        // Remove all status classes
        dot.className = 'status-dot';

        // Add appropriate status class
        dot.classList.add(status);

        // Update text
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        text.textContent = statusText;

        // Update indicator background
        if (status === 'online') {
            indicator.style.background = 'rgba(76, 175, 80, 0.8)';
        } else if (status === 'connecting') {
            indicator.style.background = 'rgba(255, 152, 0, 0.8)';
        } else {
            indicator.style.background = 'rgba(244, 67, 54, 0.8)';
        }
    }

    setupNotificationSettings() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Notification permission:', permission);
            });
        }
    }

    // Event System
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    unsubscribe(event, callback) {
        if (this.subscribers.has(event)) {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifySubscribers(data) {
        if (this.subscribers.has(data.type)) {
            this.subscribers.get(data.type).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('❌ Subscriber callback error:', error);
                }
            });
        }
    }

    dispatchCustomEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
    }

    // Public API
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            type: this.connectionType,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    forceReconnect() {
        console.log('🔄 Forced reconnection requested');
        this.disconnect();
        setTimeout(() => this.connect(), 1000);
    }
}

// Create global instance
const realTimeUpdates = new RealTimeUpdates();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.realTimeUpdates = realTimeUpdates;
}
