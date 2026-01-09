/**
 * StoneBeam-NH - Login Logic
 * Handles authentication, password visibility, and session management.
 */

// 1. Expose togglePass to the global scope
// This is required because your HTML uses an inline 'onclick="togglePass(...)"'
window.togglePass = function (inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
};

// Real-time validation functions
function validateEmailRealtime() {
    const email = document.getElementById('loginInput').value.trim();
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email && !emailRegex.test(email)) {
        emailError.textContent = "Enter a valid email address";
        emailError.style.display = "block";
        return false;
    } else {
        emailError.style.display = "none";
        return true;
    }
}

function validatePasswordRealtime() {
    const pass = document.getElementById('loginPass').value;
    const passError = document.getElementById('pass-error');

    if (pass && pass.length < 6) {
        passError.textContent = "Password must be at least 6 characters";
        passError.style.display = "block";
        return false;
    } else {
        passError.style.display = "none";
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Clear login state when user visits login page
    localStorage.removeItem('sb_isLoggedIn');
    sessionStorage.removeItem('sb_currentUser');
    sessionStorage.removeItem('sb_currentDealer');
    
    const loginForm = document.getElementById('loginForm');
    const errorBox = document.getElementById('error-msg');
    const submitBtn = loginForm.querySelector('button');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const inputVal = document.getElementById('loginInput').value.trim();
        const passVal = document.getElementById('loginPass').value;

        // --- Validation Logic ---

        // Validate Email (Required, proper format)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!inputVal || !emailRegex.test(inputVal)) {
            showError("Please enter a valid email address.");
            return;
        }

        // Validate Password (Required, minimum length)
        if (!passVal || passVal.length < 6) {
            showError("Please enter a password (minimum 6 characters).");
            return;
        }

        // Reset error state
        errorBox.style.display = 'none';

        // UI Loading State
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Verifying...";
        submitBtn.style.opacity = "0.7";

        // Attempt login immediately
        attemptLogin(inputVal, passVal, submitBtn, originalBtnText);
    });

    function attemptLogin(identifier, password, btn, btnText) {
        console.log("Attempting login for:", identifier);

        // Use simple auth system for login
        if (window.simpleAuth) {
            const result = simpleAuth.login(identifier, password, 'user');
            if (result.success) {
                console.log('Login successful:', result.user.email);
                
                // Store user in sessionStorage
                sessionStorage.setItem('sb_currentUser', JSON.stringify(result.user));
                
                btn.innerText = "Success! Redirecting...";
                btn.style.background = "#27ae60";
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                return;
            } else {
                showError(result.error);
                resetButton(btn, btnText);
                return;
            }
        }

        // Fallback authentication
        const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        const user = users.find(u => u.email === identifier && u.password === password);
        
        if (user) {
            // Store user in sessionStorage
            sessionStorage.setItem('sb_currentUser', JSON.stringify(user));
            
            btn.innerText = "Success! Redirecting...";
            btn.style.background = "#27ae60";
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError("Invalid email or password");
            resetButton(btn, btnText);
        }
    }



    function showError(msg) {
        errorBox.style.display = 'block';
        errorBox.innerText = msg;
        // Shake animation effect for better UX
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    }

    function resetButton(btn, originalText) {
        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.opacity = "1";
    }
});