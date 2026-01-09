document.addEventListener('DOMContentLoaded', function() {
    loadProjectsAndQuotes();
});

function loadProjectsAndQuotes() {
    const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser'));
    if (!currentUser) {
        document.getElementById('projectsList').innerHTML = `
            <div class="no-quotes">
                <i class="fa-solid fa-user-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Please login to view your projects</h3>
                <button onclick="window.location.href='login.html'" class="btn-primary">Login</button>
            </div>
        `;
        return;
    }

    const userProjects = JSON.parse(localStorage.getItem('sb_projects') || '[]')
        .filter(project => project.userName === currentUser.name || project.userName === currentUser.email);
    
    const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
    
    if (userProjects.length === 0) {
        document.getElementById('projectsList').innerHTML = `
            <div class="no-quotes">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No projects found</h3>
                <p>Create your first project to start receiving quotations</p>
                <button onclick="window.location.href='new-project.html'" class="btn-primary">Create Project</button>
            </div>
        `;
        return;
    }

    const projectsHTML = userProjects.map(project => {
        const projectQuotes = userQuotes.filter(quote => quote.projectId == project.id);
        return createProjectCard(project, projectQuotes);
    }).join('');

    document.getElementById('projectsList').innerHTML = projectsHTML;
}

function createProjectCard(project, quotes) {
    const hasQuotes = quotes.length > 0;
    const status = hasQuotes ? 'quoted' : 'open';
    
    return `
        <div class="project-card">
            <div class="project-header">
                <div class="project-title">Material Supply Request - ${project.items.length} items</div>
                <div class="project-status status-${status}">
                    ${hasQuotes ? `${quotes.length} Quote${quotes.length > 1 ? 's' : ''}` : 'Waiting for Quotes'}
                </div>
            </div>
            
            <div class="project-details">
                <p><strong>Delivery Address:</strong> ${project.deliveryAddress}</p>
                <p><strong>Created:</strong> ${new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="materials-list">
                <h4><i class="fa-solid fa-boxes"></i> Required Materials</h4>
                ${project.items.map(item => `
                    <div class="material-item">
                        <span>${item.material}</span>
                        <span><strong>${item.quantity} ${item.unit}</strong></span>
                    </div>
                `).join('')}
            </div>
            
            ${hasQuotes ? `
                <div class="quotes-section">
                    <h4><i class="fa-solid fa-file-invoice"></i> Received Quotations</h4>
                    ${quotes.map(quote => createQuoteCard(quote)).join('')}
                </div>
            ` : `
                <div class="no-quotes">
                    <i class="fa-solid fa-clock"></i>
                    <span>Waiting for dealer responses...</span>
                </div>
            `}
        </div>
    `;
}

function createQuoteCard(quote) {
    const isAccepted = quote.status === 'accepted';
    const isRejected = quote.status === 'rejected';
    
    return `
        <div class="quote-card">
            <div class="quote-header">
                <div class="contractor-name">
                    <i class="fa-solid fa-building"></i> ${quote.contractorName}
                </div>
                <div class="quote-price">$${quote.price.toLocaleString()}</div>
            </div>
            
            <div class="quote-details">
                <p><strong>Timeline:</strong> ${quote.timeline}</p>
                <p><strong>Description:</strong> ${quote.description}</p>
                <p><strong>Submitted:</strong> ${new Date(quote.submittedAt).toLocaleDateString()}</p>
            </div>
            
            ${isAccepted ? `
                <div class="quote-status" style="color: #27ae60; font-weight: bold;">
                    <i class="fa-solid fa-check-circle"></i> Accepted
                </div>
            ` : isRejected ? `
                <div class="quote-status" style="color: #e74c3c; font-weight: bold;">
                    <i class="fa-solid fa-times-circle"></i> Rejected
                </div>
            ` : `
                <div class="quote-actions">
                    <button class="btn-accept" onclick="acceptQuote('${quote.id}')">
                        <i class="fa-solid fa-check"></i> Accept
                    </button>
                    <button class="btn-reject" onclick="rejectQuote('${quote.id}')">
                        <i class="fa-solid fa-times"></i> Reject
                    </button>
                </div>
            `}
        </div>
    `;
}

function acceptQuote(quoteId) {
    if (confirm('Are you sure you want to accept this quotation?')) {
        updateQuoteStatus(quoteId, 'accepted');
        
        // Notify dealer about acceptance
        if (window.notificationSystem) {
            const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
            const quote = userQuotes.find(q => q.id === quoteId);
            const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser'));
            if (quote && currentUser) {
                notificationSystem.notifyDealerQuotationStatus(quote, 'accepted', currentUser.name || currentUser.email);
            }
        }
        
        alert('Quotation accepted successfully!');
        loadProjectsAndQuotes();
    }
}

function rejectQuote(quoteId) {
    if (confirm('Are you sure you want to reject this quotation?')) {
        updateQuoteStatus(quoteId, 'rejected');
        
        // Notify dealer about rejection
        if (window.notificationSystem) {
            const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
            const quote = userQuotes.find(q => q.id === quoteId);
            const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser'));
            if (quote && currentUser) {
                notificationSystem.notifyDealerQuotationStatus(quote, 'rejected', currentUser.name || currentUser.email);
            }
        }
        
        alert('Quotation rejected.');
        loadProjectsAndQuotes();
    }
}

function updateQuoteStatus(quoteId, status) {
    const userQuotes = JSON.parse(localStorage.getItem('user_quotes') || '[]');
    const quote = userQuotes.find(q => q.id === quoteId);
    if (quote) {
        quote.status = status;
        localStorage.setItem('user_quotes', JSON.stringify(userQuotes));
    }
}