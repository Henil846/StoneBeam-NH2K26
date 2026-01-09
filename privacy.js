/**
 * StoneBeam-NH - Privacy Policy Logic
 * Handles dynamic dates, reading progress, and cookie consent simulation.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Dynamic "Last Updated" Date ---
    // Automatically updates the date to today (or keeps it static if you prefer)
    updateDate();

    // --- 2. Reading Progress Bar ---
    // Injects a progress bar at the top of the screen to show how much is left to read
    createProgressBar();

    // --- 3. Section Fade-in Animation ---
    // Makes reading long text less overwhelming by fading in sections as you scroll
    initScrollAnimations();

    // --- 4. Cookie Consent Banner (Simulated) ---
    // Since Section 4 mentions cookies, this adds a functional consent banner
    checkCookieConsent();
});

// ----------------------------------------------------------------
// FEATURE 1: Date Management
// ----------------------------------------------------------------
function updateDate() {
    const dateSpan = document.getElementById('date');
    if (dateSpan) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // Updates the text to current date (e.g., "October 24, 2025")
        // This makes the policy look actively maintained.
        dateSpan.innerText = today.toLocaleDateString('en-US', options);
    }
}

// ----------------------------------------------------------------
// FEATURE 2: Reading Progress Bar
// ----------------------------------------------------------------
function createProgressBar() {
    // 1. Create the bar element dynamically
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    
    // 2. Inject Styles (Since we can't touch CSS file)
    Object.assign(progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        height: '5px',
        backgroundColor: '#2ecc71', // StoneBeam Green
        width: '0%',
        zIndex: '1000',
        transition: 'width 0.1s ease'
    });

    document.body.prepend(progressBar);

    // 3. Update width on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.width = scrolled + "%";
    });
}

// ----------------------------------------------------------------
// FEATURE 3: Scroll Animations (Fade In)
// ----------------------------------------------------------------
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Apply initial styles and observe
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
}

// ----------------------------------------------------------------
// FEATURE 4: Cookie Consent Banner
// ----------------------------------------------------------------
function checkCookieConsent() {
    // Check if user has already accepted
    if (localStorage.getItem('sb_cookie_consent')) return;

    setTimeout(() => {
        // Create Banner Container
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="flex: 1;">
                <p style="margin: 0; font-size: 0.9rem;">
                    <strong>We use cookies.</strong> 
                    As mentioned in Section 4, we use tracking technologies to improve your experience.
                </p>
            </div>
            <button id="accept-cookies" style="
                margin-left: 15px;
                padding: 8px 16px;
                background: #2ecc71;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">Accept</button>
        `;

        // Style the Banner
        Object.assign(banner.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            maxWidth: '400px',
            backgroundColor: '#fff',
            padding: '20px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            zIndex: '9999',
            borderLeft: '5px solid #2ecc71',
            fontFamily: 'Arial, sans-serif',
            animation: 'slideUp 0.5s ease-out'
        });

        document.body.appendChild(banner);

        // Handle Click
        document.getElementById('accept-cookies').addEventListener('click', () => {
            localStorage.setItem('sb_cookie_consent', 'true');
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 500);
        });

        // Add Keyframe for animation
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes slideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleSheet);

    }, 1500); // Show after 1.5 seconds
}