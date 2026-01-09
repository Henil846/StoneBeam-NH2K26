// Dealer Orders Pending - Load User Projects
document.addEventListener('DOMContentLoaded', () => {
    let pendingOrdersData = [];
    let currentPage = 1;
    const itemsPerPage = 6;
    let filteredOrders = [];
    let currentFilter = 'all';
    let currentSort = 'priority';
    let viewMode = 'grid';

    // Load user projects as pending orders
    function loadUserProjects() {
        const userProjects = JSON.parse(localStorage.getItem('dealer_projects') || '[]');
        
        pendingOrdersData = userProjects.map(project => ({
            id: 'UP-' + project.id,
            title: `Material Supply Request - ${project.items.length} items`,
            client: {
                name: project.userName,
                email: 'user@example.com',
                phone: '+1-555-0000'
            },
            location: extractCityFromAddress(project.deliveryAddress),
            budget: estimateBudget(project.items),
            deadline: 'ASAP',
            status: project.status === 'open' ? 'new' : 'quoted',
            priority: 'medium',
            description: `Materials needed: ${project.items.map(item => `${item.quantity} ${item.unit} of ${item.material}`).join(', ')}`,
            requestedAt: project.createdAt || project.postedAt,
            category: 'Material Supply',
            materials: project.items,
            deliveryAddress: project.deliveryAddress,
            timeline: [
                { event: 'Order Received', date: project.createdAt || project.postedAt, status: 'completed' }
            ]
        }));
        
        filteredOrders = [...pendingOrdersData];
    }
    
    function extractCityFromAddress(address) {
        if (!address) return 'Not specified';
        const parts = address.split(',');
        return parts.length > 1 ? parts[parts.length - 1].trim() : address.split(' ').pop();
    }
    
    function estimateBudget(items) {
        // Simple budget estimation based on materials
        return items.length * 50000; // Rough estimate
    }

    // DOM Elements
    const ordersGrid = document.getElementById('orders-grid');
    const searchInput = document.getElementById('search-orders');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sort-orders');
    const viewToggle = document.getElementById('view-toggle');
    const refreshBtn = document.getElementById('refresh-btn');
    const newQuotationBtn = document.getElementById('new-quotation-btn');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const totalItems = document.getElementById('total-items');
    const noOrdersDiv = document.getElementById('no-orders');

    // Modal elements
    const orderModal = document.getElementById('order-modal');
    const quoteModal = document.getElementById('quote-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const quickQuoteForm = document.getElementById('quick-quote-form');

    // Initialize page
    init();

    function init() {
        loadUserProjects();
        updateMetrics();
        renderOrders();
        setupEventListeners();
        updateDealerInfo();
    }

    function updateDealerInfo() {
        const dealerData = JSON.parse(sessionStorage.getItem('sb_currentDealer') || '{}');
        if (dealerData.name) {
            document.getElementById('dealer-name').textContent = dealerData.name;
        }
    }

    function updateMetrics() {
        const urgent = pendingOrdersData.filter(order => order.priority === 'urgent').length;
        const pending = pendingOrdersData.filter(order => order.status === 'new' || order.status === 'follow-up').length;
        const quoted = pendingOrdersData.filter(order => order.status === 'quoted').length;
        const totalValue = pendingOrdersData.reduce((sum, order) => sum + order.budget, 0);

        document.getElementById('urgent-count').textContent = urgent;
        document.getElementById('pending-count').textContent = pending;
        document.getElementById('quoted-count').textContent = quoted;
        document.getElementById('potential-revenue').textContent = `₹${formatCurrency(totalValue)}`;

        // Update hero stats
        document.getElementById('hero-pending').textContent = pending + quoted;
        document.getElementById('hero-urgent').textContent = urgent;
    }

    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', debounce(handleSearch, 300));

        // Filter tabs
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                currentPage = 1;
                applyFiltersAndSort();
            });
        });

        // Sort functionality
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });

        // View toggle
        viewToggle.addEventListener('click', toggleView);

        // Refresh button
        refreshBtn.addEventListener('click', refreshData);

        // New quotation button
        newQuotationBtn.addEventListener('click', () => {
            window.location.href = 'prepare-quotations.html';
        });

        // Close modals
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModals);
        });

        // Close modal on outside click
        [orderModal, quoteModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModals();
            });
        });

        // Quick quote form
        quickQuoteForm.addEventListener('submit', handleQuickQuote);

        // Pagination
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderOrders();
            }
        });

        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderOrders();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        filteredOrders = pendingOrdersData.filter(order => 
            order.title.toLowerCase().includes(query) ||
            order.client.name.toLowerCase().includes(query) ||
            order.location.toLowerCase().includes(query) ||
            order.category.toLowerCase().includes(query) ||
            order.id.toLowerCase().includes(query)
        );
        currentPage = 1;
        applyFiltersAndSort();
    }

    function applyFiltersAndSort() {
        // Apply filters
        if (currentFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => {
                switch (currentFilter) {
                    case 'urgent':
                        return order.priority === 'urgent';
                    case 'new':
                        return order.status === 'new';
                    case 'quoted':
                        return order.status === 'quoted';
                    case 'follow-up':
                        return order.status === 'follow-up';
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filteredOrders.sort((a, b) => {
            switch (currentSort) {
                case 'priority':
                    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'date-desc':
                    return new Date(b.requestedAt) - new Date(a.requestedAt);
                case 'date-asc':
                    return new Date(a.requestedAt) - new Date(b.requestedAt);
                case 'budget-desc':
                    return b.budget - a.budget;
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                default:
                    return 0;
            }
        });

        renderOrders();
    }

    function renderOrders() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const ordersToShow = filteredOrders.slice(startIndex, endIndex);

        if (ordersToShow.length === 0) {
            ordersGrid.style.display = 'none';
            noOrdersDiv.style.display = 'block';
            pagination.style.display = 'none';
            return;
        }

        ordersGrid.style.display = 'grid';
        noOrdersDiv.style.display = 'none';
        pagination.style.display = 'flex';

        ordersGrid.innerHTML = ordersToShow.map(order => createOrderCard(order)).join('');

        // Add event listeners to action buttons
        addOrderCardListeners();
        updatePagination();
    }

    function createOrderCard(order) {
        const isUrgent = order.priority === 'urgent';
        const daysUntilDeadline = Math.ceil((new Date(order.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const isDeadlineClose = daysUntilDeadline <= 7;

        return `
            <div class="order-card ${order.priority}-priority ${isUrgent ? 'urgent' : ''}" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-title">
                        <h3>${order.title}</h3>
                        <div class="order-id">ID: ${order.id}</div>
                    </div>
                    <div class="order-badges">
                        <span class="priority-badge ${order.priority}">${order.priority.toUpperCase()}</span>
                        <span class="status-badge ${order.status}">${getStatusText(order.status)}</span>
                        ${isUrgent ? '<i class="fa-solid fa-exclamation-triangle" style="color: #e74c3c;" title="Urgent Order"></i>' : ''}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="detail-label">Client</span>
                        <span class="detail-value">${order.client.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Location</span>
                        <span class="detail-value location-link" onclick="openLocationMap('${order.location}')" style="cursor: pointer; color: #667eea; text-decoration: underline;">${order.location}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Budget</span>
                        <span class="detail-value budget-amount">₹${formatCurrency(order.budget)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Deadline</span>
                        <span class="detail-value ${isDeadlineClose ? 'deadline-urgent' : ''}">${formatDate(order.deadline)} ${isDeadlineClose ? `(${daysUntilDeadline} days)` : ''}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Category</span>
                        <span class="detail-value">${order.category}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Requested</span>
                        <span class="detail-value">${formatDate(order.requestedAt)}</span>
                    </div>
                </div>
                
                <div class="order-description">
                    <p>${order.description.length > 120 ? order.description.substring(0, 120) + '...' : order.description}</p>
                    ${order.materials ? `
                        <div class="materials-preview">
                            <strong>Materials:</strong> ${order.materials.slice(0, 3).map(m => m.material).join(', ')}${order.materials.length > 3 ? '...' : ''}
                        </div>
                    ` : ''}
                    <div class="delivery-address">
                        <strong>Delivery:</strong> ${order.deliveryAddress || order.location}
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn-outline view-details" data-order-id="${order.id}">
                        <i class="fa-solid fa-eye"></i> View Details
                    </button>
                    <button class="btn-secondary contact-client" data-client-email="${order.client.email}" data-client-phone="${order.client.phone}">
                        <i class="fa-solid fa-phone"></i> Contact
                    </button>
                    ${order.status === 'new' || order.status === 'follow-up' ? 
                        `<button class="btn-primary submit-quote" data-order-id="${order.id}">
                            <i class="fa-solid fa-file-invoice-dollar"></i> Submit Quote
                        </button>` : 
                        order.status === 'quoted' ? 
                        `<button class="btn-secondary view-quote" data-order-id="${order.id}">
                            <i class="fa-solid fa-file-invoice"></i> View Quote
                        </button>` : ''
                    }
                </div>
            </div>
        `;
    }

    function addOrderCardListeners() {
        // View details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.view-details').dataset.orderId;
                showOrderDetails(orderId);
            });
        });

        // Contact client buttons
        document.querySelectorAll('.contact-client').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.contact-client');
                const email = button.dataset.clientEmail;
                const phone = button.dataset.clientPhone;
                showContactOptions(email, phone);
            });
        });

        // Submit quote buttons
        document.querySelectorAll('.submit-quote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.submit-quote').dataset.orderId;
                showQuickQuoteModal(orderId);
            });
        });

        // View quote buttons
        document.querySelectorAll('.view-quote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.view-quote').dataset.orderId;
                viewExistingQuote(orderId);
            });
        });
    }

    function showOrderDetails(orderId) {
        // Redirect to order details page with order ID
        window.location.href = `order-details.html?id=${orderId}`;
    }

    function showContactOptions(email, phone) {
        const options = [
            { text: 'Call Client', action: () => window.open(`tel:${phone}`) },
            { text: 'Send Email', action: () => window.open(`mailto:${email}`) },
            { text: 'WhatsApp', action: () => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`) }
        ];

        showActionMenu(options);
    }

    function showActionMenu(options) {
        const menu = document.createElement('div');
        menu.className = 'action-menu';
        menu.innerHTML = `
            <div class="action-menu-content">
                ${options.map(option => `
                    <button class="action-menu-item" onclick="${option.action.toString().replace('function ', '').replace('()', '')}()">
                        ${option.text}
                    </button>
                `).join('')}
            </div>
        `;

        document.body.appendChild(menu);
        setTimeout(() => menu.classList.add('show'), 10);

        // Remove menu after 5 seconds or on click outside
        setTimeout(() => {
            if (menu.parentNode) menu.remove();
        }, 5000);

        menu.addEventListener('click', (e) => {
            if (e.target === menu) menu.remove();
        });
    }

    function showQuickQuoteModal(orderId) {
        const order = pendingOrdersData.find(o => o.id === orderId);
        if (!order) return;

        // Pre-fill form with order details
        document.getElementById('quote-amount').value = Math.floor(order.budget * 0.95); // Suggest 5% less than budget
        document.getElementById('quote-timeline').value = Math.ceil((new Date(order.deadline) - new Date()) / (1000 * 60 * 60 * 24)) - 5; // 5 days buffer
        document.getElementById('quote-description').value = `Complete ${order.title.toLowerCase()} as per your requirements. Includes all materials, labor, and project management.`;

        // Store order ID for form submission
        quickQuoteForm.dataset.orderId = orderId;

        quoteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function handleQuickQuote(e) {
        e.preventDefault();
        
        const orderId = quickQuoteForm.dataset.orderId;
        const order = pendingOrdersData.find(o => o.id === orderId);
        
        if (!order) return;

        const quoteData = {
            id: 'Q-' + Date.now(),
            requestId: orderId,
            projectId: orderId.replace('UP-', ''),
            contractorName: 'Professional Contractor',
            price: parseInt(document.getElementById('quote-amount').value),
            timeline: document.getElementById('quote-timeline').value + ' days',
            description: document.getElementById('quote-description').value,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };

        // Store quote for user to see
        const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
        userQuotes.push(quoteData);
        localStorage.setItem('user_quotes', JSON.stringify(userQuotes));
        
        // Store in dealer quotes
        const dealerQuotes = JSON.parse(localStorage.getItem('dealerQuotes') || '[]');
        dealerQuotes.push(quoteData);
        localStorage.setItem('dealerQuotes', JSON.stringify(dealerQuotes));

        // Update order status
        order.status = 'quoted';
        order.quotedAmount = quoteData.price;
        order.quotedTimeline = parseInt(document.getElementById('quote-timeline').value);
        
        // Update project in dealer_projects
        const dealerProjects = JSON.parse(localStorage.getItem('dealer_projects') || '[]');
        const project = dealerProjects.find(p => p.id == quoteData.projectId);
        if (project) {
            project.status = 'quoted';
            project.quotesReceived = (project.quotesReceived || 0) + 1;
            localStorage.setItem('dealer_projects', JSON.stringify(dealerProjects));
        }

        showToast('Quote submitted successfully!', 'success');
        closeModals();
        quickQuoteForm.reset();
        loadUserProjects();
        updateMetrics();
        applyFiltersAndSort();
    }

    function scheduleVisit(orderId) {
        const order = pendingOrdersData.find(o => o.id === orderId);
        if (!order) return;

        // Add timeline entry
        order.timeline.push({
            event: 'Site Visit Scheduled',
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
        });

        showToast(`Site visit scheduled for ${order.title}`, 'success');
        closeModals();
        applyFiltersAndSort();
    }

    function viewExistingQuote(orderId) {
        const order = pendingOrdersData.find(o => o.id === orderId);
        if (!order) return;

        showToast(`Quote: ₹${formatCurrency(order.quotedAmount)} | Timeline: ${order.quotedTimeline} days`, 'info');
    }

    function toggleView() {
        viewMode = viewMode === 'grid' ? 'list' : 'grid';
        viewToggle.innerHTML = viewMode === 'grid' ? 
            '<i class="fa-solid fa-list"></i>' : 
            '<i class="fa-solid fa-th-large"></i>';
        
        ordersGrid.className = viewMode === 'grid' ? 'orders-grid' : 'orders-list';
        renderOrders();
    }

    function refreshData() {
        refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
        
        // Simulate data refresh
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fa-solid fa-refresh"></i> Refresh';
            showToast('Data refreshed successfully!', 'success');
            updateMetrics();
            renderOrders();
        }, 1500);
    }

    function startAutoRefresh() {
        // Auto-refresh every 5 minutes
        setInterval(() => {
            updateMetrics();
            renderOrders();
        }, 300000);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        pageInfo.textContent = totalPages === 0 ? 'No pages' : `Page ${currentPage} of ${totalPages}`;
        totalItems.textContent = `${filteredOrders.length} orders`;
    }

    function closeModals() {
        orderModal.classList.remove('active');
        quoteModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModals();
        }
        
        // Ctrl/Cmd + R for refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
    }

    function getStatusText(status) {
        const statusMap = {
            'new': 'New Request',
            'quoted': 'Quote Sent',
            'follow-up': 'Follow-up',
            'accepted': 'Accepted',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    function formatCurrency(amount) {
        if (amount >= 10000000) {
            return `${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            return `${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}K`;
        } else {
            return amount.toLocaleString('en-IN');
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
        }, 4000);
    }

    // Initialize with search if there's a query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = searchQuery;
        handleSearch();
    }

    // Add notification sound for urgent orders
    function playNotificationSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {}); // Ignore errors if audio can't play
    }

    // Check for urgent orders and show notifications
    const urgentOrders = pendingOrdersData.filter(order => order.priority === 'urgent' && order.status === 'new');
    if (urgentOrders.length > 0) {
        setTimeout(() => {
            showToast(`You have ${urgentOrders.length} urgent order${urgentOrders.length > 1 ? 's' : ''} requiring immediate attention!`, 'warning');
            playNotificationSound();
        }, 2000);
    }

    // Global function to open location in maps
    window.openLocationMap = function(location) {
        if (location && location.trim()) {
            const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
            window.open(mapUrl, '_blank');
        }
    };
});