/**
 * StoneBeam-NH - Terms & Conditions Logic
 * Handles section highlighting, critical warning emphasis, and navigation.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Dynamic "Last Updated" Date ---
    // Keeps the legal document looking current
    const dateElement = document.querySelector('.last-updated');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.innerText = `Last Updated: ${today.toLocaleDateString('en-US', options)}`;
    }

    // --- 2. Scroll Reveal Animation ---
    // Fades in sections as you scroll to make reading less tiring
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // If this is the specific "Cancellation" section with the alert box
                const alertBox = entry.target.querySelector('.alert-box');
                if (alertBox) {
                    highlightCriticalWarning(alertBox);
                }
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => {
        section.classList.add('fade-section'); // Add initial hidden state
        observer.observe(section);
    });

    // --- 3. Critical Warning Highlighter ---
    // Ensures the user doesn't miss the 50% Fee Clause
    function highlightCriticalWarning(element) {
        // Add a "Pulse" animation class
        element.style.animation = "pulseWarning 2s infinite";
        
        // Optional: Add a temporary 'Read Me' badge
        const badge = document.createElement('div');
        badge.innerText = "IMPORTANT";
        Object.assign(badge.style, {
            position: 'absolute',
            top: '-15px',
            right: '20px',
            background: '#e74c3c',
            color: '#fff',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            opacity: '0',
            transition: 'opacity 0.5s'
        });
        
        // Only append if not already there
        if(!element.querySelector('div[style*="IMPORTANT"]')) {
            element.style.position = 'relative'; // Ensure parent is relative
            element.appendChild(badge);
            setTimeout(() => badge.style.opacity = '1', 500);
        }
    }

    // --- 4. "Back to Top" Button ---
    // Creates a button dynamically that appears after scrolling down
    createBackToTopButton();

    function createBackToTopButton() {
        const btn = document.createElement('button');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        btn.className = 'back-to-top';
        
        // Append to body
        document.body.appendChild(btn);

        // Click Event
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Scroll Event to Show/Hide
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        });
    }

    // --- 5. Inject Dynamic CSS ---
    // Since we cannot edit the CSS file, we inject necessary styles here
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        /* Scroll Reveal Styles */
        .fade-section {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-section.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Warning Pulse Animation */
        @keyframes pulseWarning {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
            70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }

        /* Back to Top Button */
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #333;
            color: #d4af37; /* Gold */
            border: 2px solid #d4af37;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .back-to-top:hover {
            background: #d4af37;
            color: #fff;
            transform: translateY(-5px);
        }
        .back-to-top.show {
            opacity: 1;
            pointer-events: all;
        }
    `;
    document.head.appendChild(styleSheet);
});