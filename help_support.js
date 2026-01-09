/**
 * StoneBeam-NH - Help & Support Logic
 * Handles searching, FAQ interactions, and support category filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-container input');
    const searchBtn = document.querySelector('.search-container button');
    const categoryCards = document.querySelectorAll('.category-grid .card');
    const faqItems = document.querySelectorAll('.faq-item');

    // --- 1. Live Search Logic ---
    // Filters both Category Cards and FAQ items based on user input
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();

        // Filter Category Cards
        categoryCards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const text = card.querySelector('p').innerText.toLowerCase();
            
            if (title.includes(query) || text.includes(query)) {
                card.style.display = 'flex';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
            }
        });

        // Filter FAQ Items
        faqItems.forEach(item => {
            const question = item.querySelector('summary').innerText.toLowerCase();
            const answer = item.querySelector('p').innerText.toLowerCase();

            if (question.includes(query) || answer.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    };

    // Trigger search on button click
    searchBtn.addEventListener('click', handleSearch);

    // Trigger search while typing (Live Search)
    searchInput.addEventListener('keyup', (e) => {
        handleSearch();
        if (e.key === 'Enter') handleSearch();
    });

    // --- 2. FAQ Accordion Logic ---
    // Optional: Ensure only one FAQ is open at a time
    const summaries = document.querySelectorAll('summary');
    summaries.forEach((summary) => {
        summary.addEventListener('click', (e) => {
            // If you want to auto-close other FAQs when one opens:
            summaries.forEach((other) => {
                if (other !== summary && other.parentNode.hasAttribute('open')) {
                    other.parentNode.removeAttribute('open');
                }
            });
        });
    });

    // --- 3. Contact Button Feedback ---
    const contactButtons = document.querySelectorAll('.btn-contact');
    contactButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const content = this.innerText.trim();
            
            // If it's a phone number or email (not a link), copy to clipboard
            if (content.includes('@') || content.includes('+91')) {
                navigator.clipboard.writeText(content).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                });
            }
        });
    });

    // --- 4. Category Card "Quick-Link" Simulation ---
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.querySelector('h3').innerText;
            console.log(`Navigating to Knowledge Base: ${topic}`);
            // In a production app, you would redirect to a specific help page
            // window.location.href = `/help/${topic.toLowerCase().replace(/\s+/g, '-')}`;
        });
        
        // Add a pointer cursor to cards to indicate they are clickable
        card.style.cursor = 'pointer';
    });
});