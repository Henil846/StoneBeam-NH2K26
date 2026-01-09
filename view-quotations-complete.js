/**
 * View Quotations - User Interface for Dealer Responses
 * StoneBeam-NH Construction Management
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const USER_REQUESTS_KEY = 'user_requests';
    const USER_QUOTATIONS_KEY = 'user_quotations';
    
    let currentFilter = 'all';
    let userRequests = [];
    let userQuotations = [];
    
    // Initialize
    init();
    
    function init() {
        setupEventListeners();
        loadData();
        updateSummary();
        renderQuotations();
    }
    
    function setupEventListeners() {
        // Tab filters
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.status;
                renderQuotations();
            });
        });
        
        // Modal controls
        const closeComparison = document.getElementById('close-comparison');
        const closeDetails = document.getElementById('close-details');
        
        if (closeComparison) {
            closeComparison.addEventListener('click', closeComparisonModal);
        }
        if (closeDetails) {
            closeDetails.addEventListener('click', closeDetailsModal);
        }
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const comparisonModal = document.getElementById('comparison-modal');
            const detailsModal = document.getElementById('quote-details-modal');
            if (e.target === comparisonModal) closeComparisonModal();
            if (e.target === detailsModal) closeDetailsModal();
        });
    }
    
    function loadData() {
        userRequests = JSON.parse(localStorage.getItem(USER_REQUESTS_KEY) || '[]');
        userQuotations = JSON.parse(localStorage.getItem(USER_QUOTATIONS_KEY) || '[]');
        
        // Add sample data if none exists
        if (userRequests.length === 0) {
            userRequests = generateSampleRequests();
            localStorage.setItem(USER_REQUESTS_KEY, JSON.stringify(userRequests));
        }
        
        if (userQuotations.length === 0) {
            userQuotations = generateSampleQuotations();
            localStorage.setItem(USER_QUOTATIONS_KEY, JSON.stringify(userQuotations));
        }
        
        // Merge quotations with requests
        userRequests.forEach(request => {
            request.quotations = userQuotations.filter(q => q.requestId === request.id);
        });
    }
    
    function generateSampleRequests() {
        return [
            {
                id: 'req_001',
                projectTitle: 'Modern Villa Construction',
                projectType: 'Residential',
                projectLocation: 'Ahmedabad, Gujarat',
                description: 'Construction of a 3-story modern villa with contemporary design, including basement parking, swimming pool, and landscaped garden.',
                projectSize: '4500 sq ft',
                budget: 8500000,
                timeline: '12 months',
                status: 'pending',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'req_002',
                projectTitle: 'Office Building Renovation',
                projectType: 'Commercial',
                projectLocation: 'Mumbai, Maharashtra',
                description: 'Complete renovation of 5-story office building including modern interiors, HVAC system upgrade, and facade improvement.',
                projectSize: '15000 sq ft',
                budget: 12000000,
                timeline: '8 months',
                status: 'pending',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'req_003',
                projectTitle: 'Apartment Interior Design',
                projectType: 'Interior',
                projectLocation: 'Pune, Maharashtra',
                description: 'Complete interior design and execution for 3BHK apartment with modern furniture and fixtures.',
                projectSize: '1800 sq ft',
                budget: 1500000,
                timeline: '4 months',
                status: 'accepted',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }
    
    function generateSampleQuotations() {
        return [
            {
                id: 'quote_001',
                requestId: 'req_001',
                dealerName: 'Premium Builders Ltd',
                dealerEmail: 'contact@premiumbuilders.com',
                estimatedCost: 8200000,
                completionTime: '11 months',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Complete villa construction with premium materials and modern amenities.',
                status: 'pending',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'quote_002',
                requestId: 'req_001',
                dealerName: 'Elite Construction Co',
                dealerEmail: 'info@eliteconstruction.com',
                estimatedCost: 7800000,
                completionTime: '10 months',
                validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'High-quality villa construction with cost-effective solutions.',
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'quote_003',
                requestId: 'req_002',
                dealerName: 'Metro Renovations',
                dealerEmail: 'projects@metrorenovations.com',
                estimatedCost: 11500000,
                completionTime: '7 months',
                validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Complete office renovation with modern design and energy-efficient systems.',
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'quote_004',
                requestId: 'req_003',
                dealerName: 'Design Studio Pro',
                dealerEmail: 'hello@designstudiopro.com',
                estimatedCost: 1350000,
                completionTime: '3.5 months',
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Premium interior design with custom furniture and luxury finishes.',
                status: 'accepted',
                createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }
    
    function updateSummary() {
        const totalRequests = userRequests.length;
        const pendingRequests = userRequests.filter(r => r.status === 'pending').length;
        const receivedQuotes = userQuotations.length;
        const acceptedQuotes = userQuotations.filter(q => q.status === 'accepted').length;
        
        document.getElementById('total-requests').textContent = totalRequests;
        document.getElementById('pending-requests').textContent = pendingRequests;
        document.getElementById('received-quotes').textContent = receivedQuotes;
        document.getElementById('accepted-quotes').textContent = acceptedQuotes;
    }
    
    function renderQuotations() {
        const container = document.getElementById('quotations-list');
        const noQuotationsDiv = document.getElementById('no-quotations');
        let filteredRequests = userRequests;
        
        // Apply filter
        switch(currentFilter) {
            case 'pending':
                filteredRequests = userRequests.filter(r => r.status === 'pending');
                break;
            case 'quoted':
                filteredRequests = userRequests.filter(r => r.quotations && r.quotations.length > 0);
                break;
            case 'accepted':
                filteredRequests = userRequests.filter(r => r.status === 'accepted');
                break;
        }
        
        if (filteredRequests.length === 0) {
            container.style.display = 'none';
            noQuotationsDiv.style.display = 'block';
            return;
        }
        
        container.style.display = 'flex';
        noQuotationsDiv.style.display = 'none';
        container.innerHTML = filteredRequests.map(request => createRequestCard(request)).join('');
    }
    
    function createRequestCard(request) {
        const quotationsCount = request.quotations ? request.quotations.length : 0;
        const hasQuotations = quotationsCount > 0;
        const statusClass = hasQuotations ? 'has-quotes' : request.status;
        
        return `
            <div class="request-card ${statusClass}" data-request-id="${request.id}">
                <div class="request-header">
                    <div class="request-info">
                        <h3>${request.projectTitle}</h3>
                        <div class="request-meta">
                            <span><i class="fa-solid fa-building"></i> ${request.projectType}</span>
                            <span><i class="fa-solid fa-map-marker-alt"></i> ${request.projectLocation}</span>
                            <span><i class="fa-regular fa-calendar"></i> ${formatDate(request.createdAt)}</span>
                        </div>
                    </div>
                    <div class="request-status">
                        <span class="status-badge ${statusClass}">
                            ${hasQuotations ? `${quotationsCount} Quote${quotationsCount > 1 ? 's' : ''}` : request.status}
                        </span>
                    </div>
                </div>
                
                <div class="request-details">
                    <p>${request.description}</p>
                    <div class="request-specs">
                        ${request.projectSize ? `<span><strong>Size:</strong> ${request.projectSize}</span>` : ''}
                        ${request.budget ? `<span><strong>Budget:</strong> ₹${request.budget.toLocaleString()}</span>` : ''}
                        ${request.timeline ? `<span><strong>Timeline:</strong> ${request.timeline}</span>` : ''}
                    </div>
                </div>
                
                ${hasQuotations ? `
                    <div class="quotations-received">
                        <h4>Received Quotations (${quotationsCount})</h4>
                        <div class="quotations-grid">
                            ${request.quotations.map(quote => createQuotePreview(quote)).join('')}
                        </div>
                        ${quotationsCount > 1 ? `
                            <button class="btn-secondary btn-sm compare-btn" onclick="compareQuotes('${request.id}')">
                                <i class="fa-solid fa-balance-scale"></i> Compare All
                            </button>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-quotes">
                        <i class="fa-regular fa-clock"></i>
                        <span>Waiting for dealer responses...</span>
                    </div>
                `}
                
                <div class="request-actions">
                    <button class="btn-secondary btn-sm" onclick="editRequest('${request.id}')">
                        <i class="fa-solid fa-edit"></i> Edit
                    </button>
                    <button class="btn-secondary btn-sm" onclick="viewRequestDetails('${request.id}')">
                        <i class="fa-solid fa-eye"></i> Details
                    </button>
                    ${hasQuotations ? `
                        <button class="btn-primary btn-sm" onclick="selectBestQuote('${request.id}')">
                            <i class="fa-solid fa-check"></i> Select Best
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    function createQuotePreview(quote) {
        return `
            <div class="quote-preview" onclick="viewQuoteDetails('${quote.id}')">
                <div class="quote-dealer">
                    <strong>${quote.dealerName || 'Professional Dealer'}</strong>
                    <div class="dealer-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>4.2</span>
                    </div>
                </div>
                <div class="quote-cost">
                    <span class="cost-amount">₹${quote.estimatedCost?.toLocaleString()}</span>
                    <span class="cost-timeline">${quote.completionTime}</span>
                </div>
                <div class="quote-actions">
                    <button class="btn-primary btn-xs" onclick="acceptQuote('${quote.id}'); event.stopPropagation();">
                        Accept
                    </button>
                    <button class="btn-secondary btn-xs" onclick="viewQuoteDetails('${quote.id}'); event.stopPropagation();">
                        Details
                    </button>
                </div>
            </div>
        `;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function closeComparisonModal() {
        document.getElementById('comparison-modal').style.display = 'none';
    }
    
    function closeDetailsModal() {
        document.getElementById('quote-details-modal').style.display = 'none';
    }
    
    // Global functions for button clicks
    window.compareQuotes = function(requestId) {
        const request = userRequests.find(r => r.id === requestId);
        if (!request || !request.quotations || request.quotations.length < 2) {
            alert('Need at least 2 quotations to compare');
            return;
        }
        
        const modal = document.getElementById('comparison-modal');
        const content = document.getElementById('comparison-content');
        
        content.innerHTML = `
            <div class="comparison-table">
                <table style="width: 100%; border-collapse: collapse; color: #fff;">
                    <thead>
                        <tr style="background: #333;">
                            <th style="padding: 12px; border: 1px solid #555;">Dealer</th>
                            <th style="padding: 12px; border: 1px solid #555;">Cost</th>
                            <th style="padding: 12px; border: 1px solid #555;">Timeline</th>
                            <th style="padding: 12px; border: 1px solid #555;">Valid Until</th>
                            <th style="padding: 12px; border: 1px solid #555;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${request.quotations.map(quote => `
                            <tr>
                                <td style="padding: 12px; border: 1px solid #555;">${quote.dealerName}</td>
                                <td style="padding: 12px; border: 1px solid #555; color: #27ae60; font-weight: bold;">₹${quote.estimatedCost.toLocaleString()}</td>
                                <td style="padding: 12px; border: 1px solid #555;">${quote.completionTime}</td>
                                <td style="padding: 12px; border: 1px solid #555;">${formatDate(quote.validUntil)}</td>
                                <td style="padding: 12px; border: 1px solid #555;">
                                    <button class="btn-primary btn-xs" onclick="acceptQuote('${quote.id}')">
                                        Accept
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        modal.style.display = 'block';
    };
    
    window.viewQuoteDetails = function(quoteId) {
        const quote = userQuotations.find(q => q.id === quoteId);
        if (!quote) {
            alert('Quote not found');
            return;
        }
        
        const modal = document.getElementById('quote-details-modal');
        const content = document.getElementById('quote-details-content');
        
        content.innerHTML = `
            <div class="quote-details" style="color: #fff;">
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #a569bd; margin-bottom: 1rem;">${quote.dealerName}</h3>
                    <p style="color: #ccc; margin-bottom: 0.5rem;"><strong>Email:</strong> ${quote.dealerEmail}</p>
                    <p style="color: #ccc; margin-bottom: 0.5rem;"><strong>Quote Date:</strong> ${formatDate(quote.createdAt)}</p>
                    <p style="color: #ccc;"><strong>Valid Until:</strong> ${formatDate(quote.validUntil)}</p>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: #a569bd; margin-bottom: 1rem;">Project Details</h4>
                    <p style="color: #ccc; line-height: 1.6;">${quote.description}</p>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: #a569bd; margin-bottom: 1rem;">Cost Breakdown</h4>
                    <div style="background: rgba(165, 105, 189, 0.1); padding: 1.5rem; border-radius: 10px; border: 1px solid #555;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span>Estimated Cost:</span>
                            <span style="color: #27ae60; font-weight: bold; font-size: 1.2rem;">₹${quote.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Completion Time:</span>
                            <span style="color: #3498db; font-weight: bold;">${quote.completionTime}</span>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button class="btn-primary" onclick="acceptQuote('${quote.id}')" style="margin-right: 1rem;">
                        <i class="fa-solid fa-check"></i> Accept Quote
                    </button>
                    <button class="btn-secondary" onclick="contactDealer('${quote.dealerEmail}')">
                        <i class="fa-solid fa-envelope"></i> Contact Dealer
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    };
    
    window.acceptQuote = function(quoteId) {
        const quote = userQuotations.find(q => q.id === quoteId);
        if (!quote) {
            alert('Quote not found');
            return;
        }
        
        if (confirm(`Accept quote from ${quote.dealerName} for ₹${quote.estimatedCost.toLocaleString()}?`)) {
            // Update quote status
            quote.status = 'accepted';
            
            // Update request status
            const request = userRequests.find(r => r.id === quote.requestId);
            if (request) {
                request.status = 'accepted';
            }
            
            // Save to localStorage
            localStorage.setItem(USER_QUOTATIONS_KEY, JSON.stringify(userQuotations));
            localStorage.setItem(USER_REQUESTS_KEY, JSON.stringify(userRequests));
            
            // Close modals
            closeComparisonModal();
            closeDetailsModal();
            
            // Refresh display
            updateSummary();
            renderQuotations();
            
            alert('Quote accepted successfully!');
        }
    };
    
    window.editRequest = function(requestId) {
        // Redirect to edit page with request ID
        window.location.href = `request-quotations.html?edit=${requestId}`;
    };
    
    window.viewRequestDetails = function(requestId) {
        const request = userRequests.find(r => r.id === requestId);
        if (!request) {
            alert('Request not found');
            return;
        }
        
        alert(`Request Details:\n\nTitle: ${request.projectTitle}\nType: ${request.projectType}\nLocation: ${request.projectLocation}\nBudget: ₹${request.budget?.toLocaleString()}\nTimeline: ${request.timeline}\n\nDescription: ${request.description}`);
    };
    
    window.selectBestQuote = function(requestId) {
        const request = userRequests.find(r => r.id === requestId);
        if (!request || !request.quotations || request.quotations.length === 0) {
            alert('No quotations available');
            return;
        }
        
        // Find the lowest cost quote
        const bestQuote = request.quotations.reduce((best, current) => 
            current.estimatedCost < best.estimatedCost ? current : best
        );
        
        if (confirm(`Select the best quote from ${bestQuote.dealerName} for ₹${bestQuote.estimatedCost.toLocaleString()}?`)) {
            acceptQuote(bestQuote.id);
        }
    };
    
    window.contactDealer = function(email) {
        window.location.href = `mailto:${email}?subject=Regarding Your Quotation&body=Hello, I would like to discuss your quotation further.`;
    };
    
});