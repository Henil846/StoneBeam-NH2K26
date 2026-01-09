// Enhanced Orders Page JavaScript - Load User Projects and Quotations
document.addEventListener('DOMContentLoaded', () => {
    let ordersData = [];
    let currentPage = 1;
    const itemsPerPage = 4;
    let filteredOrders = [];
    let currentFilter = 'all';
    let currentSort = 'date-desc';

    // Load user projects and quotations
    function loadUserProjectsAndQuotes() {
        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser'));
        if (!currentUser) {
            document.getElementById('orders-list').innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <i class="fa-solid fa-user-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Please login to view your orders</h3>
                    <button onclick="window.location.href='login.html'" class="btn-primary">Login</button>
                </div>
            `;
            return;
        }

        const userProjects = JSON.parse(localStorage.getItem('sb_projects') || '[]')
            .filter(project => project.userName === currentUser.name || project.userName === currentUser.email);
        
        const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
        
        ordersData = userProjects.map(project => {
            const projectQuotes = userQuotes.filter(quote => quote.projectId == project.id);
            return {
                id: project.id,
                title: `Material Supply Request - ${project.items.length} items`,
                location: extractCityFromAddress(project.deliveryAddress),
                budget: estimateBudget(project.items),
                deadline: 'ASAP',
                status: projectQuotes.length > 0 ? 'quoted' : 'requested',
                priority: 'medium',
                description: `Materials needed: ${project.items.map(item => `${item.quantity} ${item.unit} of ${item.material}`).join(', ')}`,
                requestedAt: project.createdAt,
                materials: project.items,
                deliveryAddress: project.deliveryAddress,
                quotes: projectQuotes
            };
        });
        
        filteredOrders = [...ordersData];
    }
    
    function extractCityFromAddress(address) {
        if (!address) return 'Not specified';
        const parts = address.split(',');
        return parts.length > 1 ? parts[parts.length - 1].trim() : address.split(' ').pop();
    }
    
    function estimateBudget(items) {
        return items.length * 50000;
    }

    // DOM Elements
    const ordersList = document.getElementById('orders-list');
    const searchInput = document.getElementById('search-orders');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-orders');
    const newOrderBtn = document.getElementById('new-order-btn');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const noOrdersDiv = document.getElementById('no-orders');

    // Modal elements
    const orderModal = document.getElementById('order-modal');
    const newOrderModal = document.getElementById('new-order-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const newOrderForm = document.getElementById('new-order-form');
    const cancelOrderBtn = document.getElementById('cancel-order');

    // Initialize page
    init();

    function init() {
        loadUserProjectsAndQuotes();
        updateStats();
        renderOrders();
        setupEventListeners();
    }

    function updateStats() {
        const requested = ordersData.filter(order => order.status === 'requested').length;
        const inProgress = ordersData.filter(order => order.status === 'in-progress').length;
        const completed = ordersData.filter(order => order.status === 'completed').length;
        const totalSpent = ordersData
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (order.selectedQuote?.amount || 0), 0);

        document.getElementById('pending-count').textContent = requested;
        document.getElementById('progress-count').textContent = inProgress;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('spent-amount').textContent = `₹${formatCurrency(totalSpent)}`;
    }

    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', handleSearch);

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                currentPage = 1;
                applyFiltersAndSort();
            });
        });

        // Sort functionality
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });

        // New order button
        newOrderBtn.addEventListener('click', () => {
            newOrderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modals
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModals);
        });

        // Close modal on outside click
        [orderModal, newOrderModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModals();
            });
        });

        // Cancel order button
        cancelOrderBtn.addEventListener('click', closeModals);

        // New order form
        newOrderForm.addEventListener('submit', handleNewOrder);

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
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        filteredOrders = ordersData.filter(order => 
            order.title.toLowerCase().includes(query) ||
            order.client.name.toLowerCase().includes(query) ||
            order.location.toLowerCase().includes(query) ||
            order.description.toLowerCase().includes(query)
        );
        currentPage = 1;
        applyFiltersAndSort();
    }

    function applyFiltersAndSort() {
        // Apply filters
        if (currentFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === currentFilter);
        }

        // Apply sorting
        filteredOrders.sort((a, b) => {
            switch (currentSort) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'budget-desc':
                    return b.budget - a.budget;
                case 'budget-asc':
                    return a.budget - b.budget;
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
            ordersList.style.display = 'none';
            noOrdersDiv.style.display = 'block';
            pagination.style.display = 'none';
            return;
        }

        ordersList.style.display = 'grid';
        noOrdersDiv.style.display = 'none';
        pagination.style.display = 'flex';

        ordersList.innerHTML = ordersToShow.map(order => `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <h3>${order.title}</h3>
                    <span class="status ${order.status}">${getStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <p><strong>Location:</strong> ${order.location}</p>
                    <p><strong>Budget:</strong> ₹${formatCurrency(order.budget)}</p>
                    <p><strong>Deadline:</strong> ${order.deadline}</p>
                    <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
                    <p><strong>Materials:</strong> ${order.materials.slice(0, 2).map(m => m.material).join(', ')}${order.materials.length > 2 ? '...' : ''}</p>
                </div>
                ${order.quotes && order.quotes.length > 0 ? `
                    <div class="quotes-section">
                        <h4>Received Quotations (${order.quotes.length})</h4>
                        ${order.quotes.map(quote => `
                            <div class="quote-item">
                                <div class="quote-info">
                                    <strong>${quote.contractorName}</strong>
                                    <span class="quote-price">$${quote.price.toLocaleString()}</span>
                                    <span class="quote-timeline">${quote.timeline}</span>
                                </div>
                                <div class="quote-actions">
                                    ${quote.status === 'accepted' ? 
                                        '<span class="status-accepted">✓ Accepted</span>' :
                                        quote.status === 'rejected' ?
                                        '<span class="status-rejected">✗ Rejected</span>' :
                                        `<button class="btn-accept" onclick="acceptQuote('${quote.id}')">Accept</button>
                                         <button class="btn-reject" onclick="rejectQuote('${quote.id}')">Reject</button>`
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-quotes">Waiting for quotations...</p>'}
                <div class="order-actions">
                    <button class="btn-secondary view-details" data-order-id="${order.id}">View Details</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to action buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.target.dataset.orderId);
                showOrderDetails(orderId);
            });
        });

        document.querySelectorAll('.contact-client').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.dataset.clientEmail;
                window.location.href = `mailto:${email}`;
            });
        });

        document.querySelectorAll('.update-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.target.dataset.orderId);
                updateOrderStatus(orderId);
            });
        });

        updatePagination();
    }

    function showOrderDetails(orderId) {
        const order = ordersData.find(o => o.id === orderId);
        if (!order) return;

        // Populate modal with order details
        document.getElementById('modal-order-title').textContent = order.title;
        document.getElementById('modal-client-name').textContent = order.client.name;
        document.getElementById('modal-client-email').textContent = order.client.email;
        document.getElementById('modal-client-phone').textContent = order.client.phone;
        document.getElementById('modal-location').textContent = order.location;
        document.getElementById('modal-budget').textContent = `₹${formatCurrency(order.budget)}`;
        document.getElementById('modal-deadline').textContent = formatDate(order.deadline);
        document.getElementById('modal-status').textContent = getStatusText(order.status);
        document.getElementById('modal-priority').textContent = order.priority.toUpperCase();
        document.getElementById('modal-description').textContent = order.description;

        // Populate timeline
        const timeline = document.getElementById('modal-timeline');
        timeline.innerHTML = order.timeline.map(item => `
            <div class="timeline-item">
                <h5>${item.event}</h5>
                <p>Status: ${item.status}</p>
                <div class="timestamp">${formatDate(item.date)}</div>
            </div>
        `).join('');

        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateOrderStatus(orderId) {
        const order = ordersData.find(o => o.id === orderId);
        if (order) {
            order.status = 'in-progress';
            order.timeline.push({
                event: 'Status Updated to In Progress',
                date: new Date().toISOString().split('T')[0],
                status: 'completed'
            });
            showToast('Order status updated successfully!', 'success');
            applyFiltersAndSort();
            updateStats();
        }
    }

    function handleNewOrder(e) {
        e.preventDefault();
        
        const formData = new FormData(newOrderForm);
        const newOrder = {
            id: ordersData.length + 1,
            title: formData.get('project-title') || document.getElementById('project-title').value,
            client: {
                name: formData.get('client-name') || document.getElementById('client-name').value,
                email: formData.get('client-email') || document.getElementById('client-email').value,
                phone: formData.get('client-phone') || document.getElementById('client-phone').value
            },
            location: formData.get('project-location') || document.getElementById('project-location').value,
            budget: parseInt(formData.get('project-budget') || document.getElementById('project-budget').value),
            deadline: formData.get('project-deadline') || document.getElementById('project-deadline').value,
            status: 'pending',
            priority: formData.get('project-priority') || document.getElementById('project-priority').value,
            description: formData.get('project-description') || document.getElementById('project-description').value,
            createdAt: new Date().toISOString().split('T')[0],
            timeline: [
                { event: 'Order Created', date: new Date().toISOString().split('T')[0], status: 'completed' }
            ]
        };

        ordersData.unshift(newOrder);
        filteredOrders = [...ordersData];
        
        showToast('New order created successfully!', 'success');
        closeModals();
        newOrderForm.reset();
        updateStats();
        applyFiltersAndSort();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        pageInfo.textContent = totalPages === 0 ? 'No pages' : `Page ${currentPage} of ${totalPages}`;
    }

    function closeModals() {
        orderModal.classList.remove('active');
        newOrderModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function getStatusText(status) {
        const statusMap = {
            'requested': 'Awaiting Quotes',
            'quoted': 'Quotes Received',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }
    
    // Global functions for quote actions
    window.acceptQuote = function(quoteId) {
        if (confirm('Are you sure you want to accept this quotation?')) {
            updateQuoteStatus(quoteId, 'accepted');
            showToast('Quotation accepted successfully!', 'success');
            loadUserProjectsAndQuotes();
            renderOrders();
        }
    };
    
    window.rejectQuote = function(quoteId) {
        if (confirm('Are you sure you want to reject this quotation?')) {
            updateQuoteStatus(quoteId, 'rejected');
            showToast('Quotation rejected.', 'info');
            loadUserProjectsAndQuotes();
            renderOrders();
        }
    };
    
    function updateQuoteStatus(quoteId, status) {
        const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
        const quote = userQuotes.find(q => q.id === quoteId);
        if (quote) {
            quote.status = status;
            localStorage.setItem('user_quotes', JSON.stringify(userQuotes));
        }
    }

    function formatCurrency(amount) {
        if (amount >= 10000000) {
            return `${(amount / 10000000).toFixed(1)} Cr`;
        } else if (amount >= 100000) {
            return `${(amount / 100000).toFixed(1)} L`;
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

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
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
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize with search if there's a query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = searchQuery;
        handleSearch();
    }
});