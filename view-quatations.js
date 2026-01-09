// View Quotations JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const quotationsContainer = document.getElementById('quotationsContainer');
    const emptyState = document.getElementById('emptyState');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const clearFilters = document.getElementById('clearFilters');

    let allQuotations = [];

    // Initialize the page
    init();

    function init() {
        loadQuotations();
        setupEventListeners();
        generateSampleData(); // For demo purposes
    }

    function setupEventListeners() {
        statusFilter.addEventListener('change', filterQuotations);
        typeFilter.addEventListener('change', filterQuotations);
        dateFrom.addEventListener('change', filterQuotations);
        dateTo.addEventListener('change', filterQuotations);
        clearFilters.addEventListener('click', clearAllFilters);
    }

    function loadQuotations() {
        // Load user's own projects
        const userProjects = JSON.parse(localStorage.getItem('sb_projects') || '[]');
        const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
        
        // Convert user projects to quotation format and attach quotes
        allQuotations = userProjects.map(project => {
            const projectId = project.id.toString();
            const projectQuotes = userQuotes.filter(q => q.projectId == projectId || q.requestId === 'UP-' + projectId);
            
            return {
                id: 'UP-' + project.id,
                timestamp: project.createdAt,
                status: projectQuotes.length > 0 ? 'quoted' : 'pending',
                data: {
                    projectTitle: `Material Supply Request - ${project.items.length} items`,
                    projectType: 'material-supply',
                    budget: 'custom',
                    projectDescription: `Materials needed: ${project.items.map(item => `${item.quantity} ${item.unit} of ${item.material}`).join(', ')}`,
                    address: project.deliveryAddress,
                    city: extractCityFromAddress(project.deliveryAddress),
                    fullName: project.userName,
                    email: 'user@example.com',
                    phone: '+1-555-0000'
                },
                quotes: projectQuotes.map(q => ({
                    id: q.id,
                    contractorName: q.contractorName,
                    contractorRating: 4.5,
                    price: q.price,
                    timeline: q.timeline,
                    description: q.description,
                    submittedAt: q.submittedAt,
                    verified: true,
                    status: q.status || 'pending'
                }))
            };
        });

        displayQuotations(allQuotations);
    }
    
    function extractCityFromAddress(address) {
        if (!address) return 'Not specified';
        const parts = address.split(',');
        return parts.length > 1 ? parts[parts.length - 1].trim() : address;
    }

    function generateSampleData() {
        // Only generate if no data exists
        if (allQuotations.length === 0) {
            const sampleRequests = [
                {
                    id: 'QR-001234',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'quoted',
                    data: {
                        projectTitle: 'Kitchen Renovation',
                        projectType: 'renovation',
                        budget: '25k-50k',
                        projectDescription: 'Complete kitchen renovation including cabinets, countertops, and appliances.',
                        address: '123 Main Street',
                        city: 'New York',
                        fullName: 'John Smith',
                        email: 'john.smith@email.com',
                        phone: '+1-555-0123'
                    },
                    quotes: [
                        {
                            id: 'Q001',
                            contractorName: 'Elite Kitchen Solutions',
                            contractorRating: 4.8,
                            price: 42000,
                            timeline: '3-4 weeks',
                            description: 'Premium kitchen renovation with high-end materials and professional installation.',
                            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            verified: true
                        },
                        {
                            id: 'Q002',
                            contractorName: 'Modern Home Builders',
                            contractorRating: 4.6,
                            price: 38500,
                            timeline: '4-5 weeks',
                            description: 'Quality kitchen renovation with modern design and efficient workflow.',
                            submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                            verified: true
                        }
                    ]
                },
                {
                    id: 'QR-001235',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending',
                    data: {
                        projectTitle: 'Bathroom Remodel',
                        projectType: 'renovation',
                        budget: '10k-25k',
                        projectDescription: 'Master bathroom renovation with walk-in shower and modern fixtures.',
                        address: '456 Oak Avenue',
                        city: 'Los Angeles',
                        fullName: 'Sarah Johnson',
                        email: 'sarah.j@email.com',
                        phone: '+1-555-0456'
                    },
                    quotes: []
                },
                {
                    id: 'QR-001236',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'quoted',
                    data: {
                        projectTitle: 'Deck Construction',
                        projectType: 'residential',
                        budget: '10k-25k',
                        projectDescription: 'Build a new wooden deck in the backyard with railing and stairs.',
                        address: '789 Pine Street',
                        city: 'Chicago',
                        fullName: 'Mike Wilson',
                        email: 'mike.w@email.com',
                        phone: '+1-555-0789'
                    },
                    quotes: [
                        {
                            id: 'Q003',
                            contractorName: 'Outdoor Living Experts',
                            contractorRating: 4.9,
                            price: 18500,
                            timeline: '2-3 weeks',
                            description: 'Custom deck construction with premium cedar and professional finish.',
                            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                            verified: true
                        }
                    ]
                }
            ];

            allQuotations = sampleRequests;
            localStorage.setItem('quotationRequests', JSON.stringify(allQuotations));
        }
    }

    function generateSampleQuotes(quotation) {
        // Randomly generate quotes for demo purposes
        if (Math.random() > 0.3) { // 70% chance of having quotes
            const contractors = [
                { name: 'Professional Builders Inc.', rating: 4.7 },
                { name: 'Quality Construction Co.', rating: 4.5 },
                { name: 'Expert Contractors LLC', rating: 4.8 },
                { name: 'Reliable Home Services', rating: 4.6 },
                { name: 'Premium Construction Group', rating: 4.9 }
            ];

            const numQuotes = Math.floor(Math.random() * 3) + 1; // 1-3 quotes
            const quotes = [];

            for (let i = 0; i < numQuotes; i++) {
                const contractor = contractors[Math.floor(Math.random() * contractors.length)];
                const basePrice = getBudgetRange(quotation.data.budget);
                const price = basePrice + (Math.random() * 10000 - 5000); // ±$5000 variation

                quotes.push({
                    id: 'Q' + Date.now() + i,
                    contractorName: contractor.name,
                    contractorRating: contractor.rating,
                    price: Math.max(1000, Math.round(price)),
                    timeline: getRandomTimeline(),
                    description: getRandomDescription(quotation.data.projectType),
                    submittedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
                    verified: true
                });
            }

            return quotes;
        }
        return [];
    }

    function getBudgetRange(budget) {
        const ranges = {
            'under-10k': 7500,
            '10k-25k': 17500,
            '25k-50k': 37500,
            '50k-100k': 75000,
            '100k-250k': 175000,
            'over-250k': 300000
        };
        return ranges[budget] || 25000;
    }

    function getRandomTimeline() {
        const timelines = ['1-2 weeks', '2-3 weeks', '3-4 weeks', '4-6 weeks', '6-8 weeks', '2-3 months'];
        return timelines[Math.floor(Math.random() * timelines.length)];
    }

    function getRandomDescription(projectType) {
        const descriptions = {
            residential: 'Professional residential construction with quality materials and expert craftsmanship.',
            commercial: 'Commercial construction services with focus on efficiency and compliance.',
            renovation: 'Complete renovation services with modern design and quality finishes.',
            interior: 'Interior design and renovation with attention to detail and style.',
            landscaping: 'Professional landscaping services with sustainable and beautiful designs.',
            electrical: 'Licensed electrical work with safety compliance and modern standards.',
            plumbing: 'Professional plumbing services with quality fixtures and reliable installation.',
            roofing: 'Expert roofing services with durable materials and weather protection.'
        };
        return descriptions[projectType] || 'Professional construction services with quality workmanship.';
    }

    function displayQuotations(quotations) {
        if (quotations.length === 0) {
            quotationsContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        quotationsContainer.style.display = 'block';
        emptyState.style.display = 'none';

        quotationsContainer.innerHTML = quotations.map(quotation => createQuotationCard(quotation)).join('');
    }

    function createQuotationCard(quotation) {
        const statusClass = `status-${quotation.status}`;
        const statusText = quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1);
        const submittedDate = new Date(quotation.timestamp).toLocaleDateString();
        
        return `
            <div class="quotation-card">
                <div class="card-header">
                    <h3>${quotation.data.projectTitle}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    <div class="project-info">
                        <div class="info-item">
                            <i class="fa-solid fa-calendar"></i>
                            <span>Submitted: ${submittedDate}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-tag"></i>
                            <span>Type: ${quotation.data.projectType}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-map-marker-alt"></i>
                            <span>${quotation.data.city}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-dollar-sign"></i>
                            <span>Budget: ${formatBudget(quotation.data.budget)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-quote-left"></i>
                            <span>Quotes: ${quotation.quotes ? quotation.quotes.length : 0}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-hashtag"></i>
                            <span>ID: ${quotation.id}</span>
                        </div>
                    </div>
                    
                    <div class="info-item" style="margin-top: 1rem;">
                        <i class="fa-solid fa-info-circle"></i>
                        <span>${quotation.data.projectDescription}</span>
                    </div>

                    ${quotation.quotes && quotation.quotes.length > 0 ? createQuotesSection(quotation.quotes) : ''}
                </div>
            </div>
        `;
    }

    function createQuotesSection(quotes) {
        return `
            <div class="quotes-section">
                <h4><i class="fa-solid fa-file-invoice-dollar"></i> Received Quotes (${quotes.length})</h4>
                ${quotes.map(quote => createQuoteItem(quote)).join('')}
            </div>
        `;
    }

    function createQuoteItem(quote) {
        const submittedDate = new Date(quote.submittedAt).toLocaleDateString();
        const rating = '★'.repeat(Math.floor(quote.contractorRating || 4.5)) + 
                      ((quote.contractorRating || 4.5) % 1 >= 0.5 ? '☆' : '') + 
                      '☆'.repeat(5 - Math.ceil(quote.contractorRating || 4.5));
        const quoteStatus = quote.status || 'pending';
        const isAccepted = quoteStatus === 'accepted';
        const isRejected = quoteStatus === 'rejected';
        
        return `
            <div class="quote-item" style="${isAccepted ? 'border: 2px solid #27ae60;' : isRejected ? 'opacity: 0.6; border: 2px solid #e74c3c;' : ''}">
                <div class="quote-header">
                    <div>
                        <div class="contractor-name">
                            ${quote.contractorName}
                            ${quote.verified ? '<i class="fa-solid fa-check-circle" style="color: #27ae60; margin-left: 0.5rem;" title="Verified Contractor"></i>' : ''}
                            ${isAccepted ? '<span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 4px; margin-left: 0.5rem; font-size: 0.8rem;">ACCEPTED</span>' : ''}
                            ${isRejected ? '<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; margin-left: 0.5rem; font-size: 0.8rem;">REJECTED</span>' : ''}
                        </div>
                        <div class="rating" title="Rating: ${quote.contractorRating || 4.5}/5">
                            ${rating} (${quote.contractorRating || 4.5})
                        </div>
                    </div>
                    <div class="quote-price">$${quote.price.toLocaleString()}</div>
                </div>
                <div style="margin: 0.5rem 0; color: #666;">
                    <i class="fa-solid fa-clock"></i> Timeline: ${quote.timeline} | 
                    <i class="fa-solid fa-calendar"></i> Submitted: ${submittedDate}
                </div>
                <p style="margin: 0.5rem 0; color: #555;">${quote.description}</p>
                ${!isAccepted && !isRejected ? `
                <div class="quote-actions">
                    <button class="btn-small btn-accept" onclick="acceptQuote('${quote.id}')">
                        <i class="fa-solid fa-check"></i> Accept
                    </button>
                    <button class="btn-small btn-contact" onclick="contactContractor('${quote.contractorName}')">
                        <i class="fa-solid fa-phone"></i> Contact
                    </button>
                    <button class="btn-small btn-decline" onclick="declineQuote('${quote.id}')">
                        <i class="fa-solid fa-times"></i> Decline
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    function formatBudget(budget) {
        const budgetMap = {
            'under-10k': 'Under $10K',
            '10k-25k': '$10K - $25K',
            '25k-50k': '$25K - $50K',
            '50k-100k': '$50K - $100K',
            '100k-250k': '$100K - $250K',
            'over-250k': 'Over $250K'
        };
        return budgetMap[budget] || budget;
    }

    function filterQuotations() {
        let filtered = [...allQuotations];

        // Status filter
        if (statusFilter.value) {
            filtered = filtered.filter(q => q.status === statusFilter.value);
        }

        // Type filter
        if (typeFilter.value) {
            filtered = filtered.filter(q => q.data.projectType === typeFilter.value);
        }

        // Date range filter
        if (dateFrom.value) {
            const fromDate = new Date(dateFrom.value);
            filtered = filtered.filter(q => new Date(q.timestamp) >= fromDate);
        }

        if (dateTo.value) {
            const toDate = new Date(dateTo.value);
            toDate.setHours(23, 59, 59, 999); // End of day
            filtered = filtered.filter(q => new Date(q.timestamp) <= toDate);
        }

        displayQuotations(filtered);
    }

    function clearAllFilters() {
        statusFilter.value = '';
        typeFilter.value = '';
        dateFrom.value = '';
        dateTo.value = '';
        displayQuotations(allQuotations);
    }

    // Global functions for quote actions
    window.acceptQuote = function(quoteId) {
        // Find the quote and update its status
        let quoteFound = false;
        allQuotations.forEach(quotation => {
            if (quotation.quotes) {
                const quote = quotation.quotes.find(q => q.id === quoteId);
                if (quote) {
                    quote.status = 'accepted';
                    quotation.status = 'accepted';
                    quoteFound = true;
                    
                    // Update in localStorage
                    localStorage.setItem('quotationRequests', JSON.stringify(allQuotations));
                    
                    // Update user_quotes if exists
                    const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
                    const userQuote = userQuotes.find(q => q.id === quoteId);
                    if (userQuote) {
                        userQuote.status = 'accepted';
                        localStorage.setItem('user_quotes', JSON.stringify(userQuotes));
                    }
                    
                    // Update dealerQuotes if exists
                    const dealerQuotes = JSON.parse(localStorage.getItem('dealerQuotes') || '[]');
                    const dealerQuote = dealerQuotes.find(q => q.id === quoteId);
                    if (dealerQuote) {
                        dealerQuote.status = 'accepted';
                        localStorage.setItem('dealerQuotes', JSON.stringify(dealerQuotes));
                    }
                }
            }
        });
        
        if (quoteFound) {
            showNotification('Quote accepted successfully!', 'success');
            loadQuotations();
        }
    };

    window.contactContractor = function(contractorName) {
        showNotification(`Opening contact form for ${contractorName}...`, 'info');
        // In a real app, this would open a contact modal or redirect
    };

    window.declineQuote = function(quoteId) {
        if (confirm('Are you sure you want to decline this quote?')) {
            // Find the quote and update its status
            let quoteFound = false;
            allQuotations.forEach(quotation => {
                if (quotation.quotes) {
                    const quote = quotation.quotes.find(q => q.id === quoteId);
                    if (quote) {
                        quote.status = 'rejected';
                        quoteFound = true;
                        
                        // Update in localStorage
                        localStorage.setItem('quotationRequests', JSON.stringify(allQuotations));
                        
                        // Update user_quotes if exists
                        const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
                        const userQuote = userQuotes.find(q => q.id === quoteId);
                        if (userQuote) {
                            userQuote.status = 'rejected';
                            localStorage.setItem('user_quotes', JSON.stringify(userQuotes));
                        }
                        
                        // Update dealerQuotes if exists
                        const dealerQuotes = JSON.parse(localStorage.getItem('dealerQuotes') || '[]');
                        const dealerQuote = dealerQuotes.find(q => q.id === quoteId);
                        if (dealerQuote) {
                            dealerQuote.status = 'rejected';
                            localStorage.setItem('dealerQuotes', JSON.stringify(dealerQuotes));
                        }
                    }
                }
            });
            
            if (quoteFound) {
                showNotification('Quote declined.', 'info');
                loadQuotations();
            }
        }
    };

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});