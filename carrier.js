// Job data
const jobs = [
    {
        id: 1,
        title: "Senior Site Operations Manager",
        department: "operations",
        type: "full-time",
        location: "Ahmedabad, Gujarat",
        salary: "₹8-12 LPA",
        description: "Lead construction projects with focus on digital quotation systems and on-time delivery guarantees. Manage site operations and ensure quality standards.",
        requirements: [
            "5+ years construction management experience",
            "Knowledge of digital project management tools",
            "Strong leadership and communication skills",
            "Civil Engineering degree preferred"
        ]
    },
    {
        id: 2,
        title: "Full Stack Developer",
        department: "engineering",
        type: "full-time",
        location: "Remote/Ahmedabad",
        salary: "₹6-10 LPA",
        description: "Develop and maintain our digital quotation platform. Work on both frontend and backend systems to enhance user experience.",
        requirements: [
            "3+ years full stack development experience",
            "Proficiency in React, Node.js, MongoDB",
            "Experience with payment gateways",
            "Knowledge of construction industry is a plus"
        ]
    },
    {
        id: 3,
        title: "Business Development Executive",
        department: "sales",
        type: "full-time",
        location: "Ahmedabad, Gujarat",
        salary: "₹4-7 LPA + Incentives",
        description: "Drive business growth by acquiring new contractors and clients. Build relationships with construction industry professionals.",
        requirements: [
            "2+ years sales experience",
            "Construction industry knowledge preferred",
            "Excellent communication skills",
            "MBA or equivalent preferred"
        ]
    },
    {
        id: 4,
        title: "Quality Assurance Engineer",
        department: "engineering",
        type: "full-time",
        location: "Ahmedabad, Gujarat",
        salary: "₹5-8 LPA",
        description: "Ensure platform quality through comprehensive testing. Develop automated testing frameworks for our quotation system.",
        requirements: [
            "3+ years QA experience",
            "Automation testing expertise",
            "Knowledge of web technologies",
            "Experience with CI/CD pipelines"
        ]
    },
    {
        id: 5,
        title: "Customer Support Specialist",
        department: "support",
        type: "full-time",
        location: "Ahmedabad, Gujarat",
        salary: "₹3-5 LPA",
        description: "Provide exceptional support to contractors and clients. Help resolve platform issues and guide users through quotation processes.",
        requirements: [
            "1+ years customer support experience",
            "Excellent communication skills",
            "Problem-solving abilities",
            "Basic technical knowledge"
        ]
    },
    {
        id: 6,
        title: "Digital Marketing Manager",
        department: "sales",
        type: "full-time",
        location: "Remote/Ahmedabad",
        salary: "₹5-9 LPA",
        description: "Lead digital marketing initiatives to promote our platform. Manage social media, content marketing, and online advertising campaigns.",
        requirements: [
            "3+ years digital marketing experience",
            "SEO/SEM expertise",
            "Social media management skills",
            "Analytics and reporting experience"
        ]
    },
    {
        id: 7,
        title: "Construction Technology Intern",
        department: "engineering",
        type: "internship",
        location: "Ahmedabad, Gujarat",
        salary: "₹15,000/month",
        description: "Learn about construction technology and digital platforms. Assist in developing features for our quotation system.",
        requirements: [
            "Engineering student (Civil/Computer)",
            "Basic programming knowledge",
            "Interest in construction technology",
            "6-month commitment"
        ]
    },
    {
        id: 8,
        title: "Project Coordinator",
        department: "operations",
        type: "full-time",
        location: "Ahmedabad, Gujarat",
        salary: "₹4-6 LPA",
        description: "Coordinate between clients, contractors, and internal teams. Ensure smooth project execution and timely delivery.",
        requirements: [
            "2+ years project coordination experience",
            "Construction industry knowledge",
            "Strong organizational skills",
            "Proficiency in project management tools"
        ]
    }
];

let filteredJobs = [...jobs];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    renderJobs(jobs);
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('job-search').addEventListener('input', filterJobs);
    document.getElementById('department-filter').addEventListener('change', filterJobs);
    document.getElementById('type-filter').addEventListener('change', filterJobs);
    document.getElementById('application-form').addEventListener('submit', submitApplication);
}

// Render jobs
function renderJobs(jobsToRender) {
    const container = document.getElementById('jobs-container');
    const jobCount = document.getElementById('job-count');
    
    jobCount.textContent = `(${jobsToRender.length} positions)`;
    
    if (jobsToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #6b7280;">
                <i class="fa-solid fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobsToRender.map(job => `
        <div class="job-card">
            <div class="job-header">
                <h3 class="job-title">${job.title}</h3>
            </div>
            <div class="job-meta">
                <span class="job-tag department">${job.department.charAt(0).toUpperCase() + job.department.slice(1)}</span>
                <span class="job-tag type">${job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}</span>
                <span class="job-tag location"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
                <span class="job-tag salary"><i class="fa-solid fa-rupee-sign"></i> ${job.salary}</span>
            </div>
            <div class="job-description">
                ${job.description}
            </div>
            <div class="job-requirements">
                <h4>Requirements:</h4>
                <ul>
                    ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            <div class="job-actions">
                <button class="btn-apply" onclick="openApplicationModal(${job.id})">
                    <i class="fa-solid fa-paper-plane"></i> Apply Now
                </button>
                <button class="btn-save" onclick="saveJob(${job.id})">
                    <i class="fa-regular fa-bookmark"></i> Save Job
                </button>
            </div>
        </div>
    `).join('');
}

// Filter jobs
function filterJobs() {
    const searchTerm = document.getElementById('job-search').value.toLowerCase();
    const departmentFilter = document.getElementById('department-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    
    filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm) || 
                            job.description.toLowerCase().includes(searchTerm) ||
                            job.requirements.some(req => req.toLowerCase().includes(searchTerm));
        
        const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
        const matchesType = typeFilter === 'all' || job.type === typeFilter;
        
        return matchesSearch && matchesDepartment && matchesType;
    });
    
    renderJobs(filteredJobs);
}

// Open application modal
function openApplicationModal(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    document.getElementById('job-id').value = jobId;
    document.querySelector('#application-modal .modal-header h3').textContent = `Apply for ${job.title}`;
    document.getElementById('application-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close application modal
function closeApplicationModal() {
    document.getElementById('application-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('application-form').reset();
}

// Submit application
function submitApplication(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const applicationData = {
        jobId: document.getElementById('job-id').value,
        name: document.getElementById('applicant-name').value,
        email: document.getElementById('applicant-email').value,
        phone: document.getElementById('applicant-phone').value,
        experience: document.getElementById('experience').value,
        coverLetter: document.getElementById('cover-letter').value,
        resume: document.getElementById('resume').files[0]?.name || 'No file selected',
        appliedAt: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
        alert(`Thank you ${applicationData.name}! Your application has been submitted successfully. We'll review it and get back to you within 3-5 business days.`);
        closeApplicationModal();
        
        // Store application in localStorage for demo
        const applications = JSON.parse(localStorage.getItem('job-applications') || '[]');
        applications.push(applicationData);
        localStorage.setItem('job-applications', JSON.stringify(applications));
    }, 1000);
}

// Save job
function saveJob(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const savedJobs = JSON.parse(localStorage.getItem('saved-jobs') || '[]');
    
    if (savedJobs.find(j => j.id === jobId)) {
        alert('Job already saved!');
        return;
    }
    
    savedJobs.push(job);
    localStorage.setItem('saved-jobs', JSON.stringify(savedJobs));
    alert(`${job.title} has been saved to your favorites!`);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('application-modal');
    if (event.target === modal) {
        closeApplicationModal();
    }
}

console.log('StoneBeam-NH Careers Portal Initialized - Full Functionality Active');