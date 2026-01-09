/**
 * Sample Data Generator for StoneBeam-NH
 * Provides realistic sample data for development and testing
 */

// Sample Users Data
const sampleUsers = [
    {
        id: 'user_001',
        displayName: 'Rajesh Patel',
        email: 'rajesh.patel@gmail.com',
        phone: '+91-9876543210',
        userType: 'user',
        location: 'Ahmedabad, Gujarat',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true
    },
    {
        id: 'user_002',
        displayName: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        phone: '+91-9876543211',
        userType: 'user',
        location: 'Mumbai, Maharashtra',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true
    }
];

// Sample Dealers Data
const sampleDealers = [
    {
        id: 'dealer_001',
        name: 'Premium Builders Ltd',
        businessName: 'Premium Builders Ltd',
        email: 'contact@premiumbuilders.com',
        phone: '+91-9876543220',
        userType: 'dealer',
        location: 'Ahmedabad, Gujarat',
        specialization: ['Residential', 'Commercial'],
        experience: '15 years',
        rating: 4.5,
        completedProjects: 125,
        isVerified: true,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'dealer_002',
        name: 'Elite Construction Co',
        businessName: 'Elite Construction Co',
        email: 'info@eliteconstruction.com',
        phone: '+91-9876543221',
        userType: 'dealer',
        location: 'Mumbai, Maharashtra',
        specialization: ['Residential', 'Renovation'],
        experience: '12 years',
        rating: 4.2,
        completedProjects: 98,
        isVerified: true,
        createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'dealer_003',
        name: 'Metro Renovations',
        businessName: 'Metro Renovations Pvt Ltd',
        email: 'projects@metrorenovations.com',
        phone: '+91-9876543222',
        userType: 'dealer',
        location: 'Pune, Maharashtra',
        specialization: ['Commercial', 'Renovation'],
        experience: '10 years',
        rating: 4.3,
        completedProjects: 76,
        isVerified: true,
        createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'dealer_004',
        name: 'Design Studio Pro',
        businessName: 'Design Studio Pro',
        email: 'hello@designstudiopro.com',
        phone: '+91-9876543223',
        userType: 'dealer',
        location: 'Bangalore, Karnataka',
        specialization: ['Interior', 'Residential'],
        experience: '8 years',
        rating: 4.6,
        completedProjects: 54,
        isVerified: true,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Sample Projects Data
const sampleProjects = [
    {
        id: 'project_001',
        title: 'Luxury Villa Construction',
        type: 'Residential',
        location: 'Ahmedabad, Gujarat',
        description: 'Construction of a modern 4-bedroom luxury villa with swimming pool and landscaped garden.',
        budget: { min: 8000000, max: 12000000 },
        timeline: '14 months',
        status: 'active',
        clientId: 'user_001',
        requirements: ['Architecture', 'Interior Design', 'Landscaping'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'project_002',
        title: 'Office Complex Renovation',
        type: 'Commercial',
        location: 'Mumbai, Maharashtra',
        description: 'Complete renovation of 6-story office complex with modern amenities and energy-efficient systems.',
        budget: { min: 15000000, max: 20000000 },
        timeline: '10 months',
        status: 'active',
        clientId: 'user_002',
        requirements: ['Renovation', 'HVAC', 'Electrical'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'project_003',
        title: 'Apartment Interior Design',
        type: 'Interior',
        location: 'Pune, Maharashtra',
        description: 'Complete interior design and furnishing for 3BHK apartment with modern aesthetics.',
        budget: { min: 1200000, max: 1800000 },
        timeline: '4 months',
        status: 'completed',
        clientId: 'user_001',
        requirements: ['Interior Design', 'Furniture', 'Lighting'],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Sample Quotations Data
const sampleQuotations = [
    {
        id: 'quote_001',
        projectId: 'project_001',
        dealerId: 'dealer_001',
        dealerName: 'Premium Builders Ltd',
        estimatedCost: 10500000,
        breakdown: {
            materials: 6500000,
            labor: 2800000,
            equipment: 800000,
            overhead: 400000
        },
        timeline: '13 months',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Complete villa construction with premium materials and finishes. Includes all architectural, structural, and interior work.',
        terms: 'Payment: 20% advance, 60% during construction phases, 20% on completion. All materials as per approved specifications.',
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'quote_002',
        projectId: 'project_001',
        dealerId: 'dealer_002',
        dealerName: 'Elite Construction Co',
        estimatedCost: 9800000,
        breakdown: {
            materials: 6000000,
            labor: 2600000,
            equipment: 750000,
            overhead: 450000
        },
        timeline: '12 months',
        validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'High-quality villa construction with cost-effective solutions without compromising on quality.',
        terms: 'Payment: 25% advance, 50% during construction, 25% on completion. 1-year warranty on all work.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'quote_003',
        projectId: 'project_002',
        dealerId: 'dealer_003',
        dealerName: 'Metro Renovations',
        estimatedCost: 17500000,
        breakdown: {
            materials: 10000000,
            labor: 4500000,
            equipment: 2000000,
            overhead: 1000000
        },
        timeline: '9 months',
        validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Complete office renovation with modern design, energy-efficient systems, and minimal business disruption.',
        terms: 'Payment: 30% advance, 40% at 50% completion, 30% on final completion. Work during non-business hours.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Sample Orders Data
const sampleOrders = [
    {
        id: 'order_001',
        projectId: 'project_003',
        quotationId: 'quote_004',
        clientId: 'user_001',
        dealerId: 'dealer_004',
        dealerName: 'Design Studio Pro',
        projectTitle: 'Apartment Interior Design',
        totalAmount: 1350000,
        status: 'in_progress',
        progress: 65,
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        expectedCompletion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: [
            { name: 'Design Approval', status: 'completed', date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
            { name: 'Material Procurement', status: 'completed', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
            { name: 'Execution Phase 1', status: 'completed', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
            { name: 'Execution Phase 2', status: 'in_progress', date: null },
            { name: 'Final Inspection', status: 'pending', date: null }
        ],
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Sample Notifications Data
const sampleNotifications = [
    {
        id: 'notif_001',
        userId: 'user_001',
        type: 'quote_received',
        title: 'New Quotation Received',
        message: 'Premium Builders Ltd has submitted a quotation for your villa project.',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'notif_002',
        userId: 'user_001',
        type: 'project_update',
        title: 'Project Milestone Completed',
        message: 'Design approval phase has been completed for your apartment interior project.',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'notif_003',
        userId: 'dealer_001',
        type: 'new_project',
        title: 'New Project Available',
        message: 'A new residential project matching your expertise is available in Ahmedabad.',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Sample Blog Posts Data
const sampleBlogPosts = [
    {
        id: 'blog_001',
        title: 'How Digital Quotations Are Revolutionizing Construction',
        slug: 'digital-quotations-revolutionizing-construction',
        excerpt: 'Discover how our digital quotation system is streamlining the construction bidding process and reducing project delays by up to 40%.',
        content: 'The construction industry has been traditionally slow to adopt digital technologies, but the tide is turning...',
        author: 'StoneBeam Team',
        category: 'Technology',
        tags: ['Digital', 'Quotations', 'Technology', 'Construction'],
        featuredImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        views: 1200,
        likes: 89,
        status: 'published'
    },
    {
        id: 'blog_002',
        title: '5 Essential Safety Protocols for Modern Construction Sites',
        slug: 'essential-safety-protocols-construction-sites',
        excerpt: 'Learn about the latest safety standards and how verified profiles ensure compliance across all projects.',
        content: 'Safety should always be the top priority on any construction site. Here are the five most important protocols...',
        author: 'Safety Expert',
        category: 'Safety',
        tags: ['Safety', 'Protocols', 'Construction', 'Standards'],
        featuredImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000&auto=format&fit=crop',
        publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        views: 856,
        likes: 67,
        status: 'published'
    },
    {
        id: 'blog_003',
        title: 'Maximizing ROI with Premium Verified Contractors',
        slug: 'maximizing-roi-premium-verified-contractors',
        excerpt: 'Case study: How premium membership reduced project costs by 25% through verified contractor networks.',
        content: 'When it comes to construction projects, choosing the right contractor can make or break your investment...',
        author: 'Project Manager',
        category: 'Management',
        tags: ['ROI', 'Contractors', 'Premium', 'Case Study'],
        featuredImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        views: 1500,
        likes: 124,
        status: 'published'
    }
];

// Utility Functions
function generateSampleData() {
    // Initialize localStorage with sample data if empty
    if (!localStorage.getItem('sb_users')) {
        localStorage.setItem('sb_users', JSON.stringify(sampleUsers));
    }
    
    if (!localStorage.getItem('sb_dealers')) {
        localStorage.setItem('sb_dealers', JSON.stringify(sampleDealers));
    }
    
    if (!localStorage.getItem('sb_projects')) {
        localStorage.setItem('sb_projects', JSON.stringify(sampleProjects));
    }
    
    if (!localStorage.getItem('sb_quotations')) {
        localStorage.setItem('sb_quotations', JSON.stringify(sampleQuotations));
    }
    
    if (!localStorage.getItem('sb_orders')) {
        localStorage.setItem('sb_orders', JSON.stringify(sampleOrders));
    }
    
    if (!localStorage.getItem('sb_notifications')) {
        localStorage.setItem('sb_notifications', JSON.stringify(sampleNotifications));
    }
    
    if (!localStorage.getItem('sb_blog_posts')) {
        localStorage.setItem('sb_blog_posts', JSON.stringify(sampleBlogPosts));
    }
}

function getSampleUser() {
    return sampleUsers[0];
}

function getSampleDealer() {
    return sampleDealers[0];
}

function getRandomSampleData(type, count = 1) {
    const dataMap = {
        users: sampleUsers,
        dealers: sampleDealers,
        projects: sampleProjects,
        quotations: sampleQuotations,
        orders: sampleOrders,
        notifications: sampleNotifications,
        blogPosts: sampleBlogPosts
    };
    
    const data = dataMap[type] || [];
    if (count === 1) {
        return data[Math.floor(Math.random() * data.length)];
    }
    
    return data.slice(0, count);
}

// Initialize sample data on page load
document.addEventListener('DOMContentLoaded', () => {
    generateSampleData();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleUsers,
        sampleDealers,
        sampleProjects,
        sampleQuotations,
        sampleOrders,
        sampleNotifications,
        sampleBlogPosts,
        generateSampleData,
        getSampleUser,
        getSampleDealer,
        getRandomSampleData
    };
}