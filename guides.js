/**
 * StoneBeam-NH - Guides & Resources Logic
 * Handles searching, filtering, simulated downloads, and article modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration & Selectors ---
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    const categoryPills = document.querySelectorAll('.cat-pill');
    const articles = document.querySelectorAll('article.glass-card');
    const readButtons = document.querySelectorAll('.read-btn');
    const downloadLinks = document.querySelectorAll('.file-list a');

    // State
    let activeCategory = 'All Resources';
    let searchQuery = '';

    // --- 1. Filter & Search Logic ---

    // Event: Search Input (Real-time)
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });

    // Event: Search Button (Click)
    searchBtn.addEventListener('click', () => {
        // Optional: Add a search animation or API call here in future
        applyFilters(); 
    });

    // Event: Category Pills
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // 1. Visual Toggle
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            // 2. Set State
            activeCategory = pill.innerText;
            applyFilters();
        });
    });

    // Main Filter Function
    function applyFilters() {
        let visibleCount = 0;

        articles.forEach(article => {
            // Get Content
            const title = article.querySelector('h3').innerText.toLowerCase();
            const excerpt = article.querySelector('.excerpt').innerText.toLowerCase();
            const badgeText = article.querySelector('.badge').innerText; // e.g., "Safety", "Maintenance"

            // Check Search Match
            const matchesSearch = title.includes(searchQuery) || excerpt.includes(searchQuery);

            // Check Category Match
            // Logic: Does the Button text (e.g., "Safety Protocols") include the Badge text (e.g., "Safety")?
            let matchesCategory = false;
            if (activeCategory === 'All Resources') {
                matchesCategory = true;
            } else if (activeCategory.includes(badgeText)) {
                matchesCategory = true;
            }

            // Show or Hide
            if (matchesSearch && matchesCategory) {
                article.style.display = 'block';
                // Add a subtle fade-in animation
                article.style.animation = 'fadeIn 0.5s ease forwards';
                visibleCount++;
            } else {
                article.style.display = 'none';
            }
        });

        // Optional: Show "No Results" message if visibleCount === 0
        handleNoResults(visibleCount);
    }

    // Helper for Empty States
    function handleNoResults(count) {
        let noResultMsg = document.getElementById('no-results-msg');
        const grid = document.querySelector('.articles-grid');

        if (count === 0) {
            if (!noResultMsg) {
                noResultMsg = document.createElement('div');
                noResultMsg.id = 'no-results-msg';
                noResultMsg.innerHTML = `<p style="text-align:center; color:#fff; padding:20px;">No guides found matching your criteria.</p>`;
                grid.appendChild(noResultMsg);
            }
        } else {
            if (noResultMsg) noResultMsg.remove();
        }
    }


    // --- 2. Article Reader Modal ---
    // Since we don't have real pages, we simulate reading content in a popup
    readButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.glass-card');
            const title = card.querySelector('h3').innerText;
            const category = card.querySelector('.badge').innerText;
            
            openArticleModal(title, category);
        });
    });

    function openArticleModal(title, category) {
        // Create Modal HTML
        const modal = document.createElement('div');
        modal.className = 'guide-modal-overlay';
        modal.innerHTML = `
            <div class="guide-modal">
                <div class="modal-header">
                    <span class="badge ${category === 'Safety' ? 'peach' : 'purple'}">${category}</span>
                    <button class="close-modal"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <h2>${title}</h2>
                <div class="modal-content">
                    <p><strong>Overview</strong><br>This is a simulated preview of the technical guide. In a full production environment, this would load the full PDF or HTML content from the server.</p>
                    <hr>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <div class="info-box">
                        <i class="fa-solid fa-info-circle"></i> 
                        For the full technical schematic, please use the download section in the sidebar.
                    </div>
                </div>
                <button class="gradient-btn-small full-width close-modal-btn">Close Guide</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Close Events
        const closeFunc = () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.close-modal').addEventListener('click', closeFunc);
        modal.querySelector('.close-modal-btn').addEventListener('click', closeFunc);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeFunc();
        });

        // Animate In
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    }


    // --- 3. Simulated Download Logic ---
    downloadLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const fileName = link.querySelector('span').innerText;
            const iconBox = link.querySelector('.icon-box');
            
            // Loading State
            const originalIcon = iconBox.innerHTML;
            iconBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            
            // Simulate Network Delay
            setTimeout(() => {
                iconBox.innerHTML = '<i class="fa-solid fa-check" style="color: #2ecc71;"></i>';
                showToast(`Downloading: ${fileName}`);
                
                // Reset after 2 seconds
                setTimeout(() => {
                    iconBox.innerHTML = originalIcon;
                }, 2000);
            }, 1200);
        });
    });

    // Helper: Toast Notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'guide-toast';
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- 4. Inject Dynamic CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Modal Styles */
        .guide-modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .guide-modal-overlay.visible { opacity: 1; }
        
        .guide-modal {
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            width: 90%;
            max-width: 500px;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        .guide-modal-overlay.visible .guide-modal { transform: scale(1); }
        
        .guide-modal h2 { margin-bottom: 15px; background: linear-gradient(to right, #ff7e5f, #feb47b); -webkit-background-clip: text; color: transparent; }
        .guide-modal p { color: #ccc; line-height: 1.6; font-size: 0.95rem; margin-bottom: 15px; }
        .guide-modal hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0; }
        .modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .close-modal { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
        
        .info-box { background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #feb47b; display: flex; gap: 10px; align-items: center; margin-bottom: 20px; }
        
        /* Toast Styles */
        .guide-toast {
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: #333; color: #fff; padding: 12px 24px; border-radius: 50px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); border: 1px solid #feb47b;
            opacity: 0; transition: opacity 0.3s, bottom 0.3s; z-index: 3000;
        }
        .guide-toast.show { opacity: 1; bottom: 40px; }
    `;
    document.head.appendChild(style);
});