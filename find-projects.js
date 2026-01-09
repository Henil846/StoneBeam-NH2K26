// Find Projects JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeFindProjects();
    setupFilters();
});

let allProjects = [];
let filteredProjects = [];

function initializeFindProjects() {
    loadUserProjects();
    renderProjects();
}

function loadUserProjects() {
    // Load user-created projects from localStorage
    const userProjects = JSON.parse(localStorage.getItem('dealer_projects') || '[]');
    
    // Convert to display format
    allProjects = userProjects.map(project => ({
        id: project.id,
        title: `Material Supply Request - ${project.items.length} items`,
        type: 'material-supply',
        status: project.status || 'open',
        userName: project.userName,
        deliveryAddress: project.deliveryAddress,
        city: extractCityFromAddress(project.deliveryAddress),
        materials: project.items,
        createdAt: project.createdAt || project.postedAt,
        quotesReceived: project.quotesReceived || 0,
        description: `Customer needs: ${project.items.map(item => `${item.quantity} ${item.unit} of ${item.material}`).join(', ')}`
    }));
    
    filteredProjects = [...allProjects];
}

function extractCityFromAddress(address) {
    if (!address) return 'Not specified';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : address.split(' ').pop();
}

function setupFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');

    [typeFilter, locationFilter, statusFilter, sortFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
        if (filter.type === 'text') {
            filter.addEventListener('input', debounce(applyFilters, 300));
        }
    });
}

function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;

    filteredProjects = allProjects.filter(project => {
        const matchesType = typeFilter === 'all' || project.type === typeFilter;
        const matchesLocation = !locationFilter || 
            project.city.toLowerCase().includes(locationFilter) ||
            project.deliveryAddress.toLowerCase().includes(locationFilter);
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

        return matchesType && matchesLocation && matchesStatus;
    });

    // Apply sorting
    filteredProjects.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortFilter === 'newest' ? dateB - dateA : dateA - dateB;
    });

    renderProjects();
}

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    
    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <div class="no-projects">
                <i class="fa-solid fa-search"></i>
                <h3>No projects found</h3>
                <p>Try adjusting your filters or check back later for new projects.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredProjects.map(project => createProjectCard(project)).join('');
}

function createProjectCard(project) {
    const createdDate = new Date(project.createdAt).toLocaleDateString();
    const hasQuoted = checkIfQuoted(project.id);
    
    return `
        <div class="project-card">
            <div class="project-header">
                <div class="project-title">${project.title}</div>
                <div class="project-type">${formatProjectType(project.type)}</div>
            </div>
            
            <div class="project-meta">
                <div class="meta-item">
                    <i class="fa-solid fa-calendar"></i>
                    <span>Posted: ${createdDate}</span>
                </div>
                <div class="meta-item">
                    <i class="fa-solid fa-user"></i>
                    <span>${project.userName}</span>
                </div>
                <div class="meta-item">
                    <i class="fa-solid fa-map-marker-alt"></i>
                    <span>${project.city}</span>
                </div>
                <div class="meta-item">
                    <i class="fa-solid fa-quote-left"></i>
                    <span>${project.quotesReceived} quotes received</span>
                </div>
            </div>
            
            ${createMaterialsSection(project.materials)}
            
            <div class="project-description">
                <strong>Delivery Address:</strong><br>
                ${project.deliveryAddress}
            </div>
            
            <div class="project-actions">
                ${hasQuoted ? 
                    `<span style="color: #27ae60; font-weight: bold;">
                        <i class="fa-solid fa-check"></i> Quote Submitted
                    </span>` :
                    `<button class="btn-quote" onclick="submitQuote('${project.id}')">
                        <i class="fa-solid fa-paper-plane"></i> Submit Quote
                    </button>`
                }
                <button class="btn-details" onclick="viewProjectDetails('${project.id}')">
                    <i class="fa-solid fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `;
}

function createMaterialsSection(materials) {
    if (!materials || materials.length === 0) return '';
    
    return `
        <div class="materials-section">
            <h4><i class="fa-solid fa-boxes"></i> Required Materials</h4>
            <div class="materials-list">
                ${materials.map(item => `
                    <div class="material-item">
                        <span>${item.material}</span>
                        <span style="color: #a569bd; font-weight: bold;">${item.quantity} ${item.unit}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function formatProjectType(type) {
    const typeMap = {
        'material-supply': 'Material Supply',
        'renovation': 'Renovation',
        'commercial': 'Commercial',
        'residential': 'Residential'
    };
    return typeMap[type] || type;
}

function checkIfQuoted(projectId) {
    const dealerQuotes = JSON.parse(localStorage.getItem('dealerQuotes') || '[]');
    return dealerQuotes.some(quote => quote.requestId === 'UP-' + projectId);
}

function submitQuote(projectId) {
    // Redirect to dealer dashboard with the specific project
    window.location.href = `dealer-dashboard.html#project-${projectId}`;
}

function viewProjectDetails(projectId) {
    const project = allProjects.find(p => p.id == projectId);
    if (!project) return;
    
    // Create modal or detailed view
    showProjectModal(project);
}

function showProjectModal(project) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${project.title}</h2>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="project-info">
                    <h3>Project Information</h3>
                    <p><strong>Customer:</strong> ${project.userName}</p>
                    <p><strong>Posted:</strong> ${new Date(project.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${project.status}</p>
                    <p><strong>Quotes Received:</strong> ${project.quotesReceived}</p>
                </div>
                
                <div class="delivery-info">
                    <h3>Delivery Information</h3>
                    <p><strong>Address:</strong> ${project.deliveryAddress}</p>
                    <p><strong>City:</strong> ${project.city}</p>
                </div>
                
                ${createMaterialsSection(project.materials)}
            </div>
            <div class="modal-actions">
                ${checkIfQuoted(project.id) ? 
                    `<span style="color: #27ae60; font-weight: bold;">
                        <i class="fa-solid fa-check"></i> Quote Already Submitted
                    </span>` :
                    `<button class="btn-quote" onclick="submitQuote('${project.id}')">
                        <i class="fa-solid fa-paper-plane"></i> Submit Quote
                    </button>`
                }
                <button class="btn-details" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal() {
    const modal = document.querySelector('.project-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
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

// Add modal styles
const modalCSS = `
.project-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.project-modal.show {
    opacity: 1;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
    border: 1px solid #333;
    border-radius: 15px;
    max-width: 800px;
    width: 90%;
    max-height: 90%;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid #333;
}

.modal-header h2 {
    color: #a569bd;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: #666;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
}

.modal-close:hover {
    color: #fff;
}

.modal-body {
    padding: 2rem;
}

.modal-body h3 {
    color: #a569bd;
    margin-bottom: 1rem;
}

.modal-body p {
    color: #ccc;
    margin-bottom: 0.5rem;
}

.modal-actions {
    padding: 2rem;
    border-top: 1px solid #333;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}
`;

const style = document.createElement('style');
style.textContent = modalCSS;
document.head.appendChild(style);