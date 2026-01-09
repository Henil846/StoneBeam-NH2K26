// Dealer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeDealerDashboard();
});

let quotationRequests = [];
let dealerQuotes = [];

function initializeDealerDashboard() {
    loadQuotationRequests();
    loadDealerQuotes();
    updateDashboardStats();
    renderRequests();
}

function loadQuotationRequests() {
    // Load user-created projects from new-project page
    const userProjects = JSON.parse(localStorage.getItem('dealer_projects') || '[]');
    
    // Convert user projects to quotation request format
    quotationRequests = userProjects.map(project => ({
        id: 'UP-' + project.id,
        timestamp: project.postedAt || project.createdAt,
        status: project.status === 'open' ? 'pending' : 'quoted',
        data: {
            projectTitle: `Material Supply Request - ${project.items.length} items`,
            projectType: 'material-supply',
            budget: 'custom',
            projectDescription: `Materials needed: ${project.items.map(item => `${item.quantity} ${item.unit} of ${item.material}`).join(', ')}`,
            address: project.deliveryAddress,
            city: extractCityFromAddress(project.deliveryAddress),
            fullName: project.userName,
            email: 'user@example.com',
            phone: '+1-555-0000',
            startDate: new Date().toISOString().split('T')[0],
            deadline: 'ASAP',
            materials: project.items
        }
    }));
}

function extractCityFromAddress(address) {
    // Simple city extraction - you can make this more sophisticated
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'Not specified';
}

function loadDealerQuotes() {
    dealerQuotes = JSON.parse(localStorage.getItem('dealerQuotes') || '[]');
}



function updateDashboardStats() {
    const activeRequests = quotationRequests.filter(r => r.status === 'pending').length;
    const quotesSubmitted = dealerQuotes.length;
    const acceptedQuotes = dealerQuotes.filter(q => q.status === 'accepted').length;
    const totalRevenue = dealerQuotes
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + (q.price || 0), 0);

    document.getElementById('activeRequests').textContent = activeRequests;
    document.getElementById('quotesSubmitted').textContent = quotesSubmitted;
    document.getElementById('acceptedQuotes').textContent = acceptedQuotes;
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString();
}

function renderRequests() {
    const requestsList = document.getElementById('requestsList');
    const filter = document.getElementById('requestFilter').value;
    
    let filteredRequests = quotationRequests;
    if (filter === 'all') {
        filteredRequests = quotationRequests.filter(r => r.status === 'pending');
    } else if (filter === 'quoted') {
        filteredRequests = quotationRequests.filter(r => r.status === 'quoted');
    }

    if (filteredRequests.length === 0) {
        requestsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fa-solid fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No requests found</h3>
                <p>Check back later for new quotation requests.</p>
            </div>
        `;
        return;
    }

    requestsList.innerHTML = filteredRequests.map(request => createRequestCard(request)).join('');
}

function createRequestCard(request) {
    const submittedDate = new Date(request.timestamp).toLocaleDateString();
    const hasQuoted = dealerQuotes.some(q => q.requestId === request.id);
    const isMaterialSupply = request.data.projectType === 'material-supply';
    
    return `
        <div class="request-card">
            <div class="request-header">
                <div class="request-title">${request.data.projectTitle}</div>
                <div class="request-budget">${formatBudget(request.data.budget)}</div>
            </div>
            
            <div class="request-details">
                <div class="detail-item">
                    <i class="fa-solid fa-calendar"></i>
                    <span>Submitted: ${submittedDate}</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-tag"></i>
                    <span>Type: ${request.data.projectType}</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-map-marker-alt"></i>
                    <span>${request.data.city}</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-user"></i>
                    <span>${request.data.fullName}</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-clock"></i>
                    <span>Deadline: ${request.data.deadline || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-hashtag"></i>
                    <span>ID: ${request.id}</span>
                </div>
            </div>
            
            ${isMaterialSupply ? createMaterialsList(request.data.materials) : ''}
            
            <div class="request-description">
                <strong>${isMaterialSupply ? 'Delivery Address:' : 'Project Description:'}</strong><br>
                ${isMaterialSupply ? request.data.address : request.data.projectDescription}
            </div>
            
            ${hasQuoted ? 
                `<div class="quote-status status-quoted">
                    <i class="fa-solid fa-check"></i> Quote Submitted
                </div>` :
                `<div class="quote-form">
                    <h4 style="color: #a569bd; margin-bottom: 1rem;">Submit Your Quote</h4>
                    <form onsubmit="submitQuote(event, '${request.id}')">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Quote Price ($)</label>
                                <input type="number" name="price" required min="1" placeholder="Enter your quote">
                            </div>
                            <div class="form-group">
                                <label>Timeline</label>
                                <input type="text" name="timeline" required placeholder="e.g., 3-4 weeks">
                            </div>
                            <div class="form-group">
                                <label>Your Company</label>
                                <input type="text" name="company" required placeholder="Company name">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Quote Description</label>
                            <textarea name="description" required rows="3" placeholder="Describe your approach, materials, and what's included..."></textarea>
                        </div>
                        <button type="submit" class="btn-submit-quote">
                            <i class="fa-solid fa-paper-plane"></i> Submit Quote
                        </button>
                    </form>
                </div>`
            }
        </div>
    `;
}

function createMaterialsList(materials) {
    if (!materials || materials.length === 0) return '';
    
    return `
        <div class="materials-list" style="background: #333; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <h4 style="color: #a569bd; margin-bottom: 0.5rem;">Required Materials:</h4>
            <div class="materials-grid" style="display: grid; gap: 0.5rem;">
                ${materials.map(item => `
                    <div class="material-item" style="display: flex; justify-content: space-between; padding: 0.5rem; background: #444; border-radius: 4px;">
                        <span style="color: #fff;">${item.material}</span>
                        <span style="color: #a569bd; font-weight: bold;">${item.quantity} ${item.unit}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function submitQuote(event, requestId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const quote = {
        id: 'Q-' + Date.now(),
        requestId: requestId,
        projectId: requestId.replace('UP-', ''),
        contractorName: formData.get('company'),
        price: parseInt(formData.get('price')),
        timeline: formData.get('timeline'),
        description: formData.get('description'),
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Add quote to dealer's quotes
    dealerQuotes.push(quote);
    localStorage.setItem('dealerQuotes', JSON.stringify(dealerQuotes));
    
    // Store quote for user to see
    const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
    userQuotes.push(quote);
    localStorage.setItem('user_quotes', JSON.stringify(userQuotes));
    
    // Notify user about new quotation
    if (window.notificationSystem) {
        const request = quotationRequests.find(r => r.id === requestId);
        if (request) {
            notificationSystem.notifyUserQuotationReceived(quote, request.data);
        }
    }
    
    // Update project status
    if (requestId.startsWith('UP-')) {
        const projectId = requestId.replace('UP-', '');
        const dealerProjects = JSON.parse(localStorage.getItem('dealer_projects') || '[]');
        const project = dealerProjects.find(p => p.id == projectId);
        if (project) {
            project.status = 'quoted';
            project.quotesReceived = (project.quotesReceived || 0) + 1;
            localStorage.setItem('dealer_projects', JSON.stringify(dealerProjects));
        }
    }
    
    showNotification('Quote submitted successfully!', 'success');
    updateDashboardStats();
    renderRequests();
}

function filterRequests() {
    renderRequests();
}

function refreshRequests() {
    showNotification('Refreshing requests...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        loadQuotationRequests();
        renderRequests();
        updateDashboardStats();
        showNotification('Requests updated!', 'success');
    }, 1000);
}

function formatBudget(budget) {
    const budgetMap = {
        'under-10k': 'Under $10K',
        '10k-25k': '$10K - $25K',
        '25k-50k': '$25K - $50K',
        '50k-100k': '$50K - $100K',
        '100k-250k': '$100K - $250K',
        'over-250k': 'Over $250K',
        'custom': 'Quote Required'
    };
    return budgetMap[budget] || budget;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    notification.innerHTML = `
        <div class="toast-content">
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add toast notification styles
const toastCSS = `
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.toast-notification.show {
    transform: translateX(0);
}

.toast-success { border-left: 4px solid #27ae60; }
.toast-error { border-left: 4px solid #e74c3c; }
.toast-info { border-left: 4px solid #3498db; }

.toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    color: #fff;
}

.toast-close {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 5px;
}

.toast-close:hover {
    color: #fff;
}
`;

const style = document.createElement('style');
style.textContent = toastCSS;
document.head.appendChild(style);