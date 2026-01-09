// User Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeUserDashboard();
});

function initializeUserDashboard() {
    loadOverviewData();
    loadRecentActivity();
    loadQuickStats();
}

function loadOverviewData() {
    const overviewContent = document.getElementById('overviewContent');
    
    // Get user data
    const quotationRequests = JSON.parse(localStorage.getItem('quotationRequests') || '[]');
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    // Calculate overview stats
    const totalRequests = quotationRequests.length;
    const pendingRequests = quotationRequests.filter(r => r.status === 'pending').length;
    const quotedRequests = quotationRequests.filter(r => r.status === 'quoted').length;
    const totalQuotes = quotationRequests.reduce((sum, r) => sum + (r.quotes ? r.quotes.length : 0), 0);
    
    overviewContent.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: rgba(39, 174, 96, 0.1); padding: 1.5rem; border-radius: 10px; border-left: 4px solid #27ae60;">
                <h3 style="color: #27ae60; margin: 0 0 0.5rem 0; font-size: 2rem;">${totalRequests}</h3>
                <p style="color: #ccc; margin: 0;">Total Requests</p>
            </div>
            <div style="background: rgba(241, 196, 15, 0.1); padding: 1.5rem; border-radius: 10px; border-left: 4px solid #f1c40f;">
                <h3 style="color: #f1c40f; margin: 0 0 0.5rem 0; font-size: 2rem;">${pendingRequests}</h3>
                <p style="color: #ccc; margin: 0;">Pending</p>
            </div>
            <div style="background: rgba(52, 152, 219, 0.1); padding: 1.5rem; border-radius: 10px; border-left: 4px solid #3498db;">
                <h3 style="color: #3498db; margin: 0 0 0.5rem 0; font-size: 2rem;">${totalQuotes}</h3>
                <p style="color: #ccc; margin: 0;">Quotes Received</p>
            </div>
            <div style="background: rgba(165, 105, 189, 0.1); padding: 1.5rem; border-radius: 10px; border-left: 4px solid #a569bd;">
                <h3 style="color: #a569bd; margin: 0 0 0.5rem 0; font-size: 2rem;">${quotedRequests}</h3>
                <p style="color: #ccc; margin: 0;">Active Projects</p>
            </div>
        </div>
        
        <div style="background: rgba(165, 105, 189, 0.1); padding: 1.5rem; border-radius: 10px; border: 1px solid #555;">
            <h3 style="color: #a569bd; margin-bottom: 1rem;">Recent Requests</h3>
            ${quotationRequests.length > 0 ? 
                quotationRequests.slice(0, 3).map(request => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #333;">
                        <div>
                            <h4 style="color: #fff; margin: 0 0 5px 0;">${request.data.projectTitle}</h4>
                            <p style="color: #ccc; margin: 0; font-size: 0.9rem;">${request.data.city} • ${new Date(request.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${request.status === 'pending' ? '#f39c12' : '#27ae60'}; color: ${request.status === 'pending' ? '#000' : '#fff'}; padding: 4px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold;">
                                ${request.status.toUpperCase()}
                            </span>
                            ${request.quotes ? `<p style="color: #ccc; margin: 5px 0 0 0; font-size: 0.8rem;">${request.quotes.length} quotes</p>` : ''}
                        </div>
                    </div>
                `).join('') :
                '<p style="color: #666; text-align: center; padding: 2rem;">No requests yet. <a href="request-quotations.html" style="color: #a569bd;">Create your first request</a></p>'
            }
        </div>
    `;
}

function loadRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    
    const activities = [
        {
            icon: 'fa-file-invoice-dollar',
            text: 'New quotation request submitted',
            time: '2 hours ago'
        },
        {
            icon: 'fa-quote-left',
            text: 'Quote received from Elite Kitchen Solutions',
            time: '1 day ago'
        },
        {
            icon: 'fa-user-check',
            text: 'Profile updated',
            time: '2 days ago'
        },
        {
            icon: 'fa-check-circle',
            text: 'Project marked as completed',
            time: '1 week ago'
        },
        {
            icon: 'fa-sign-in-alt',
            text: 'Account login',
            time: '1 week ago'
        }
    ];
    
    recentActivity.innerHTML = activities.map(activity => `
        <li>
            <i class="${activity.icon}"></i>
            <div>
                <span>${activity.text}</span>
                <small style="display: block; color: #666; margin-top: 2px;">${activity.time}</small>
            </div>
        </li>
    `).join('');
}

function loadQuickStats() {
    const quickStats = document.getElementById('quickStats');
    
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const memberSince = userProfile.stats?.memberSince || '2023-01-15';
    const membershipDays = Math.floor((Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24));
    
    quickStats.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ccc;">Member Since</span>
                <strong style="color: #a569bd;">${new Date(memberSince).toLocaleDateString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ccc;">Days Active</span>
                <strong style="color: #27ae60;">${membershipDays}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ccc;">Success Rate</span>
                <strong style="color: #f1c40f;">92%</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ccc;">Avg Response Time</span>
                <strong style="color: #3498db;">4.2 hrs</strong>
            </div>
        </div>
    `;
}