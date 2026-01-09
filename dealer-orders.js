// Dealer Orders JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Sample dealer orders data (quotation requests)
    const dealerOrdersData = [
        {
            id: 1,
            title: "Luxury Villa Construction",
            client: { name: "Rajesh Kumar", email: "rajesh@email.com", phone: "+91-9876543210" },
            location: "Gurgaon, Haryana",
            budget: 15000000,
            deadline: "2025-06-15",
            status: "new",
            priority: "high",
            description: "Complete construction of 4BHK luxury villa with modern amenities, swimming pool, and landscaped garden.",
            requestedAt: "2024-12-01",
            quotedAmount: null,
            quotedTimeline: null
        },
        {
            id: 2,
            title: "Office Complex Renovation",
            client: { name: "TechCorp Solutions", email: "contact@techcorp.com", phone: "+91-9123456789" },
            location: "Bangalore, Karnataka",
            budget: 8500000,
            deadline: "2025-04-30",
            status: "quoted",
            priority: "medium",
            description: "Complete renovation of 3-floor office complex with modern interiors and IT infrastructure.",
            requestedAt: "2024-11-20",
            quotedAmount: 8200000,
            quotedTimeline: 120
        },
        {
            id: 3,
            title: "Shopping Mall Development",
            client: { name: "Metro Retail Group", email: "projects@metroretail.com", phone: "+91-9654321098" },
            location: "Mumbai, Maharashtra",
            budget: 45000000,
            deadline: "2026-03-15",
            status: "accepted",
            priority: "urgent",
            description: "Large-scale shopping mall with 200+ retail spaces, food court, and entertainment zone.",
            requestedAt: "2024-10-01",
            quotedAmount: 42000000,
            quotedTimeline: 365
        },
        {
            id: 4,
            title: "School Building Construction",
            client: { name: "Bright Future Education", email: "admin@brightfuture.edu", phone: "+91-9321654987" },
            location: "Chennai, Tamil Nadu",
            budget: 12000000,
            deadline: "2025-08-01",
            status: "new",
            priority: "medium",
            description: "Modern school building with 30 classrooms, laboratories, library, and sports facilities.",
            requestedAt: "2024-11-30",
            quotedAmount: null,
            quotedTimeline: null
        },
        {
            id: 5,
            title: "Residential Complex Phase 2",
            client: { name: "Green Valley Builders", email: "info@greenvalley.com", phone: "+91-9876512345" },
            location: "Pune, Maharashtra",
            budget: 28000000,
            deadline: "2025-12-31",
            status: "rejected",
            priority: "low",
            description: "Second phase of residential complex with 60 units and community facilities.",
            requestedAt: "2024-09-15",
            quotedAmount: 30000000,
            quotedTimeline: 300
        }
    ];

    let currentPage = 1;
    const itemsPerPage = 4;
    let filteredOrders = [...dealerOrdersData];
    let currentFilter = 'all';
    let currentSort = 'date-desc';

    // DOM Elements
    const ordersList = document.getElementById('orders-list');
    const searchInput = document.getElementById('search-orders');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-orders');
    const createQuotationBtn = document.getElementById('create-quotation-btn');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const noOrdersDiv = document.getElementById('no-orders');

    // Modal elements
    const quotationModal = document.getElementById('quotation-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const quotationForm = document.getElementById('quotation-form');
    const cancelQuoteBtn = document.getElementById('cancel-quote');
    const quoteProjectSelect = document.getElementById('quote-project');

    // Initialize page
    init();

    function init() {
        updateStats();
        renderOrders();
        setupEventListeners();
        populateProjectSelect();
    }

    function updateStats() {
        const newRequests = dealerOrdersData.filter(order => order.status === 'new').length;
        const quotedRequests = dealerOrdersData.filter(order => order.status === 'quoted').length;
        const acceptedQuotes = dealerOrdersData.filter(order => order.status === 'accepted').length;
        const potentialRevenue = dealerOrdersData
            .filter(order => order.status === 'accepted')
            .reduce((sum, order) => sum + (order.quotedAmount || 0), 0);

        document.getElementById('pending-requests').textContent = newRequests;
        document.getElementById('submitted-quotes').textContent = quotedRequests;
        document.getElementById('accepted-quotes').textContent = acceptedQuotes;
        document.getElementById('potential-revenue').textContent = `₹${(potentialRevenue / 10000000).toFixed(1)}Cr`;
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

        // Create quotation button
        createQuotationBtn.addEventListener('click', () => {
            quotationModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modals
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModals);
        });

        // Close modal on outside click
        quotationModal.addEventListener('click', (e) => {
            if (e.target === quotationModal) closeModals();
        });

        // Cancel quotation button
        cancelQuoteBtn.addEventListener('click', closeModals);

        // Quotation form
        quotationForm.addEventListener('submit', handleQuotationSubmit);

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

    function populateProjectSelect() {
        const newRequests = dealerOrdersData.filter(order => order.status === 'new');
        quoteProjectSelect.innerHTML = '<option value="">Select Project</option>' +
            newRequests.map(order => `<option value="${order.id}">${order.title} - ${order.client.name}</option>`).join('');
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        filteredOrders = dealerOrdersData.filter(order => 
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
                    return new Date(b.requestedAt) - new Date(a.requestedAt);
                case 'date-asc':
                    return new Date(a.requestedAt) - new Date(b.requestedAt);
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
            <div class="order-card dealer-card" data-order-id="${order.id}">
                <div class="order-header">
                    <h3>${order.title}</h3>
                    <span class="status ${order.status}">${getDealerStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <p><strong>Client:</strong> ${order.client.name}</p>
                    <p><strong>Location:</strong> ${order.location}</p>
                    <p><strong>Budget:</strong> ₹${formatCurrency(order.budget)}</p>
                    <p><strong>Deadline:</strong> ${formatDate(order.deadline)}</p>
                    <p><strong>Priority:</strong> <span class="priority-${order.priority}">${order.priority.toUpperCase()}</span></p>
                    ${order.quotedAmount ? `<p><strong>Quoted:</strong> ₹${formatCurrency(order.quotedAmount)}</p>` : ''}
                </div>
                <div class="order-actions">
                    <button class="btn-secondary view-details" data-order-id="${order.id}">View Details</button>
                    ${order.status === 'new' ? 
                        `<button class="btn-primary submit-quote" data-order-id="${order.id}">Submit Quote</button>` :
                        `<button class="btn-outline contact-client" data-client-email="${order.client.email}">Contact Client</button>`
                    }
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

        document.querySelectorAll('.submit-quote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.target.dataset.orderId);
                openQuotationModal(orderId);
            });
        });

        document.querySelectorAll('.contact-client').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.dataset.clientEmail;
                window.location.href = `mailto:${email}`;
            });
        });

        updatePagination();
    }

    function openQuotationModal(orderId) {
        const order = dealerOrdersData.find(o => o.id === orderId);
        if (order) {
            quoteProjectSelect.value = orderId;
            quotationModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function handleQuotationSubmit(e) {
        e.preventDefault();
        
        const projectId = parseInt(quoteProjectSelect.value);
        const amount = parseInt(document.getElementById('quote-amount').value);
        const timeline = parseInt(document.getElementById('quote-timeline').value);
        const validity = parseInt(document.getElementById('quote-validity').value);
        const description = document.getElementById('quote-description').value;
        const terms = document.getElementById('quote-terms').value;

        const order = dealerOrdersData.find(o => o.id === projectId);
        if (order) {
            order.status = 'quoted';
            order.quotedAmount = amount;
            order.quotedTimeline = timeline;
            order.quotationDetails = {
                description,
                terms,
                validity,
                submittedAt: new Date().toISOString()
            };

            showToast('Quotation submitted successfully!', 'success');
            closeModals();
            quotationForm.reset();
            updateStats();
            populateProjectSelect();
            applyFiltersAndSort();
        }
    }

    function showOrderDetails(orderId) {
        const order = dealerOrdersData.find(o => o.id === orderId);
        if (!order) return;

        // Create a simple alert for now - can be enhanced with a proper modal
        const details = `
Project: ${order.title}
Client: ${order.client.name}
Email: ${order.client.email}
Phone: ${order.client.phone}
Location: ${order.location}
Budget: ₹${formatCurrency(order.budget)}
Deadline: ${formatDate(order.deadline)}
Status: ${getDealerStatusText(order.status)}
Priority: ${order.priority.toUpperCase()}

Description: ${order.description}

${order.quotedAmount ? `Quoted Amount: ₹${formatCurrency(order.quotedAmount)}` : ''}
${order.quotedTimeline ? `Timeline: ${order.quotedTimeline} days` : ''}
        `;
        
        alert(details);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        pageInfo.textContent = totalPages === 0 ? 'No pages' : `Page ${currentPage} of ${totalPages}`;
    }

    function closeModals() {
        quotationModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function getDealerStatusText(status) {
        const statusMap = {
            'new': 'New Request',
            'quoted': 'Quote Submitted',
            'accepted': 'Quote Accepted',
            'rejected': 'Quote Rejected'
        };
        return statusMap[status] || status;
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
});