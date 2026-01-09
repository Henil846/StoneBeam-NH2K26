/**
 * Blog Page Functionality
 * StoneBeam-NH Blog System
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Blog Filtering System ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const blogPosts = document.querySelectorAll('.blog-post');
    const searchInput = document.getElementById('blog-search-input');
    const searchBtn = document.getElementById('blog-search-btn');
    
    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            filterPosts(category);
        });
    });
    
    function filterPosts(category) {
        blogPosts.forEach(post => {
            const postCategory = post.getAttribute('data-category');
            
            if (category === 'all' || postCategory === category) {
                post.style.display = 'block';
                post.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                post.style.display = 'none';
            }
        });
        
        updatePostCount();
    }
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show all posts if search is empty
            blogPosts.forEach(post => {
                post.style.display = 'block';
            });
            // Reset filter buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            filterBtns[0].classList.add('active'); // Activate "All Posts"
        } else {
            blogPosts.forEach(post => {
                const title = post.querySelector('h2').textContent.toLowerCase();
                const content = post.querySelector('p').textContent.toLowerCase();
                const category = post.querySelector('.post-category').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm) || category.includes(searchTerm)) {
                    post.style.display = 'block';
                    post.style.animation = 'fadeIn 0.5s ease-in';
                } else {
                    post.style.display = 'none';
                }
            });
            
            // Reset filter buttons when searching
            filterBtns.forEach(btn => btn.classList.remove('active'));
        }
        
        updatePostCount();
    }
    
    function updatePostCount() {
        const visiblePosts = Array.from(blogPosts).filter(post => post.style.display !== 'none');
        console.log(`Showing ${visiblePosts.length} posts`);
    }
    
    // --- Interactive Post Features ---
    blogPosts.forEach(post => {
        const heartIcon = post.querySelector('.fa-heart');
        const eyeIcon = post.querySelector('.fa-eye');
        
        // Like functionality
        if (heartIcon) {
            heartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const likesSpan = heartIcon.parentElement;
                let currentLikes = parseInt(likesSpan.textContent.trim());
                
                if (heartIcon.classList.contains('fa-regular')) {
                    heartIcon.classList.remove('fa-regular');
                    heartIcon.classList.add('fa-solid');
                    heartIcon.style.color = '#e74c3c';
                    currentLikes++;
                    showNotification('Post liked!', 'success');
                } else {
                    heartIcon.classList.remove('fa-solid');
                    heartIcon.classList.add('fa-regular');
                    heartIcon.style.color = '';
                    currentLikes--;
                }
                
                likesSpan.innerHTML = `<i class="${heartIcon.classList.contains('fa-solid') ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${currentLikes}`;
                
                // Store like status in localStorage
                const postTitle = post.querySelector('h2 a').textContent;
                const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
                
                if (heartIcon.classList.contains('fa-solid')) {
                    if (!likedPosts.includes(postTitle)) {
                        likedPosts.push(postTitle);
                    }
                } else {
                    const index = likedPosts.indexOf(postTitle);
                    if (index > -1) {
                        likedPosts.splice(index, 1);
                    }
                }
                
                localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            });
        }
        
        // View tracking
        post.addEventListener('click', (e) => {
            if (!e.target.closest('.post-stats') && !e.target.closest('.read-more')) {
                const viewsSpan = post.querySelector('.fa-eye').parentElement;
                let currentViews = parseInt(viewsSpan.textContent.trim());
                currentViews++;
                viewsSpan.innerHTML = `<i class="fa-regular fa-eye"></i> ${formatNumber(currentViews)}`;
            }
        });
    });
    
    // Load liked posts from localStorage
    function loadLikedPosts() {
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        
        blogPosts.forEach(post => {
            const postTitle = post.querySelector('h2 a').textContent;
            const heartIcon = post.querySelector('.fa-heart');
            
            if (likedPosts.includes(postTitle) && heartIcon) {
                heartIcon.classList.remove('fa-regular');
                heartIcon.classList.add('fa-solid');
                heartIcon.style.color = '#e74c3c';
            }
        });
    }
    
    // --- Sidebar Functionality ---
    const sidebarCategories = document.querySelectorAll('.categories a');
    const sidebarNewsletterForm = document.querySelector('.sidebar-newsletter-form');
    
    // Sidebar category filtering
    sidebarCategories.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            
            // Update main filter buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            const targetBtn = document.querySelector(`[data-category="${category}"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
            }
            
            filterPosts(category);
            
            // Scroll to posts
            document.querySelector('.blog-posts').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Sidebar newsletter subscription
    if (sidebarNewsletterForm) {
        sidebarNewsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = sidebarNewsletterForm.querySelector('input[type="email"]').value.trim();
            
            if (email && isValidEmail(email)) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                sidebarNewsletterForm.reset();
                
                // Store subscription
                const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
                }
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
    
    // --- Pagination Functionality ---
    const pageButtons = document.querySelectorAll('.page-btn');
    
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.disabled && !btn.classList.contains('active')) {
                // Update active page
                pageButtons.forEach(b => b.classList.remove('active'));
                
                if (!isNaN(btn.textContent)) {
                    btn.classList.add('active');
                    
                    // Simulate page loading
                    showNotification(`Loading page ${btn.textContent}...`, 'info');
                    
                    // Scroll to top of posts
                    document.querySelector('.blog-posts').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // --- Navigation Enhancement ---
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Search icon in navigation
    const navSearchIcon = document.querySelector('.fa-magnifying-glass');
    if (navSearchIcon) {
        navSearchIcon.addEventListener('click', () => {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // --- Utility Functions ---
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fa-solid fa-times"></i></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-info-circle';
        }
    }
    
    // Initialize page
    loadLikedPosts();
    loadUserPosts();
    updatePostCount();
    
    // Load user posts function
    function loadUserPosts() {
        const userPosts = JSON.parse(localStorage.getItem('user_blog_posts') || '[]');
        const blogPostsContainer = document.getElementById('blog-posts');
        
        userPosts.forEach(post => {
            const postElement = createPostElement(post);
            blogPostsContainer.insertBefore(postElement, blogPostsContainer.firstChild);
        });
    }
    
    function createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-post';
        article.setAttribute('data-category', post.category);
        
        const publishDate = new Date(post.publishDate || post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        article.innerHTML = `
            <div class="post-image">
                <img src="${post.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop'}" alt="${post.title}">
                <div class="post-category">${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</div>
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${publishDate}</span>
                    <span><i class="fa-regular fa-user"></i> ${post.author}</span>
                    <span><i class="fa-regular fa-clock"></i> ${Math.ceil(post.content.length / 1000)} min read</span>
                </div>
                <h2><a href="#">${post.title}</a></h2>
                <p>${post.excerpt}</p>
                <div class="post-footer">
                    <a href="#" class="read-more">Read Full Article <i class="fa-solid fa-arrow-right"></i></a>
                    <div class="post-stats">
                        <span><i class="fa-regular fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fa-regular fa-heart"></i> ${post.likes || 0}</span>
                        <span><i class="fa-regular fa-comment"></i> ${post.comments || 0}</span>
                    </div>
                </div>
            </div>
        `;
        
        return article;
    }
    
    console.log('Blog page initialized successfully');
});

// --- CSS Styles for Blog Page ---
const blogPageStyles = document.createElement('style');
blogPageStyles.textContent = `
    .blog-header {
        background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);
        color: white;
        padding: 100px 0 60px 0;
        text-align: center;
    }
    
    .blog-header h1 {
        font-size: 3rem;
        margin-bottom: 20px;
        font-weight: 700;
    }
    
    .blog-header p {
        font-size: 1.2rem;
        margin-bottom: 40px;
        opacity: 0.9;
    }
    
    .blog-search {
        display: flex;
        max-width: 500px;
        margin: 0 auto;
        gap: 10px;
    }
    
    .blog-search input {
        flex: 1;
        padding: 15px 20px;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        outline: none;
    }
    
    .blog-search button {
        background: white;
        color: #8e44ad;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .blog-search button:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
    }
    
    .blog-layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 40px;
        margin-top: 40px;
    }
    
    .blog-filters {
        display: flex;
        gap: 15px;
        margin-bottom: 40px;
        flex-wrap: wrap;
    }
    
    .filter-btn {
        background: white;
        border: 2px solid #e9ecef;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .filter-btn:hover, .filter-btn.active {
        background: #8e44ad;
        color: white;
        border-color: #8e44ad;
    }
    
    .blog-posts {
        display: grid;
        gap: 30px;
    }
    
    .blog-post {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 0;
    }
    
    .blog-post:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .post-image {
        position: relative;
        height: 200px;
        overflow: hidden;
    }
    
    .post-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .blog-post:hover .post-image img {
        transform: scale(1.05);
    }
    
    .post-category {
        position: absolute;
        top: 15px;
        left: 15px;
        background: rgba(142, 68, 173, 0.9);
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .post-content {
        padding: 25px;
        display: flex;
        flex-direction: column;
    }
    
    .post-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #666;
        flex-wrap: wrap;
    }
    
    .post-meta i {
        margin-right: 5px;
    }
    
    .post-content h2 {
        margin: 0 0 15px 0;
        font-size: 20px;
        line-height: 1.4;
    }
    
    .post-content h2 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s ease;
    }
    
    .post-content h2 a:hover {
        color: #8e44ad;
    }
    
    .post-content p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
        flex: 1;
    }
    
    .post-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
    }
    
    .read-more {
        color: #8e44ad;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.3s ease;
    }
    
    .read-more:hover {
        color: #6c3483;
    }
    
    .post-stats {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #666;
    }
    
    .post-stats span {
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .post-stats span:hover {
        color: #8e44ad;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 50px;
    }
    
    .page-btn {
        background: white;
        border: 2px solid #e9ecef;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .page-btn:hover, .page-btn.active {
        background: #8e44ad;
        color: white;
        border-color: #8e44ad;
    }
    
    .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .blog-sidebar {
        position: sticky;
        top: 20px;
        height: fit-content;
    }
    
    .sidebar-widget {
        background: white;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .sidebar-widget h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
    }
    
    .popular-posts {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .popular-post {
        display: flex;
        gap: 15px;
        align-items: center;
    }
    
    .popular-post img {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
    }
    
    .popular-post h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        line-height: 1.3;
    }
    
    .popular-post h4 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s ease;
    }
    
    .popular-post h4 a:hover {
        color: #8e44ad;
    }
    
    .popular-post span {
        font-size: 12px;
        color: #666;
    }
    
    .categories {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .categories a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #333;
        text-decoration: none;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        transition: color 0.3s ease;
    }
    
    .categories a:hover {
        color: #8e44ad;
    }
    
    .categories span {
        background: #f8f9fa;
        color: #666;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
    }
    
    .newsletter-widget {
        background: linear-gradient(135deg, #8e44ad, #6c3483);
        color: white;
    }
    
    .newsletter-widget h3 {
        color: white;
    }
    
    .sidebar-newsletter-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .sidebar-newsletter-form input {
        padding: 12px 15px;
        border: none;
        border-radius: 8px;
        outline: none;
    }
    
    .sidebar-newsletter-form button {
        background: white;
        color: #8e44ad;
        border: none;
        padding: 12px 15px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .sidebar-newsletter-form button:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .blog-layout {
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        .blog-post {
            grid-template-columns: 1fr;
        }
        
        .post-image {
            height: 200px;
        }
        
        .blog-header h1 {
            font-size: 2rem;
        }
        
        .blog-search {
            flex-direction: column;
        }
        
        .blog-filters {
            justify-content: center;
        }
    }
`;
document.head.appendChild(blogPageStyles);