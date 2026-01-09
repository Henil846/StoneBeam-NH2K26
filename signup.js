/**
 * StoneBeam-NH - Signup Logic
 * Handles user registration, input validation, and secure local storage.
 */

// 1. Expose togglePass to global scope (Required for HTML onclick attribute)
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
function validateNameRealtime() {
    const name = document.getElementById('regName').value.trim();
    const nameError = document.getElementById('name-error');

    if (name && name.length < 2) {
        nameError.textContent = "Name must be at least 2 characters";
        nameError.style.display = "block";
        return false;
    } else {
        nameError.style.display = "none";
        return true;
    }
}

function validatePhoneRealtime() {
    const phone = document.getElementById('regPhone').value.trim();
    const phoneError = document.getElementById('phone-error');
    const phoneRegex = /^[6-9][0-9]{9}$/;

    if (phone && !phoneRegex.test(phone)) {
        phoneError.textContent = "Enter valid 10-digit Indian mobile number";
        phoneError.style.display = "block";
        return false;
    } else {
        phoneError.style.display = "none";
        return true;
    }
}

function validateEmailRealtime() {
    const email = document.getElementById('regEmail').value.trim();
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
    const pass = document.getElementById('regPass').value;
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
    const signupForm = document.getElementById('signupForm');
    const msgBox = document.getElementById('msg-box');
    const submitBtn = signupForm.querySelector('button');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get Values
        const name = document.getElementById('regName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPass').value;

        // --- 1. Validation Logic ---

        // Validate Name (Required, at least 2 characters)
        if (!name || name.length < 2) {
            showMsg("Please enter a valid name (at least 2 characters).", "error");
            return;
        }

        // Validate Phone (Must be exactly 10 digits)
        const phoneRegex = /^[6-9][0-9]{9}$/; // Indian mobile numbers start with 6-9
        if (!phoneRegex.test(phone)) {
            showMsg("Please enter a valid 10-digit Indian mobile number starting with 6-9.", "error");
            return;
        }

        // Validate Email (Required, proper format)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            showMsg("Please enter a valid email address.", "error");
            return;
        }

        // Validate Password (Required, minimum 6 characters)
        if (!pass || pass.length < 6) {
            showMsg("Password must be at least 6 characters long.", "error");
            return;
        }

        // --- 2. Check for existing users ---
        let users = JSON.parse(localStorage.getItem('sb_users') || '[]');

        // Check for duplicates
        if (users.some(u => u.email === email)) {
            showMsg("Email already registered! Please use a different email.", "error");
            return;
        }

        if (users.some(u => u.phone === phone)) {
            showMsg("Phone number already registered! Please use a different number.", "error");
            return;
        }

        // UI Loading State
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Creating Account...";
        submitBtn.style.opacity = "0.7";

        // Use simple auth system for registration
        if (window.simpleAuth) {
            const userData = {
                displayName: name,
                email: email,
                phone: phone,
                password: pass
            };
            
            const result = simpleAuth.register(userData, 'user');
            if (result.success) {
                console.log('Registration successful:', result.user.email);
                
                // Store user info for login page display
                sessionStorage.setItem('newUserInfo', JSON.stringify({
                    name: name,
                    email: email
                }));
                
                // Success Feedback
                showMsg("Account created successfully! Redirecting...", "success");
                submitBtn.innerText = "Success";
                submitBtn.style.background = "#27ae60";
                
                // Redirect to Login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            } else {
                showMsg(result.error, "error");
                resetButton(submitBtn, originalBtnText);
                return;
            }
        }

        // Fallback registration
        const newUser = {
            id: Date.now().toString(),
            name: name,
            phone: phone,
            email: email,
            password: pass,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('sb_users', JSON.stringify(users));

        // Store user info for login page display
        sessionStorage.setItem('newUserInfo', JSON.stringify({
            name: name,
            email: email
        }));

        // Success Feedback
        showMsg("Account created successfully! Redirecting...", "success");
        submitBtn.innerText = "Success";
        submitBtn.style.background = "#27ae60";

        // Redirect to Login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });

    function resetButton(btn, originalText) {
        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.opacity = "1";
    }

    // Helper function to display messages
    function showMsg(text, type) {
        msgBox.style.display = 'block';
        msgBox.className = 'msg-box ' + type; // Applies .error or .success CSS
        msgBox.innerText = text;

        // If it's an error, shake the form slightly
        if (type === 'error') {
            signupForm.classList.add('shake');
            setTimeout(() => signupForm.classList.remove('shake'), 500);
        }
    }
});

// Inject "Shake" animation for error feedback
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
    }
    .shake {
        animation: shake 0.3s ease-in-out;
    }
    .msg-box.success {
        background-color: rgba(46, 204, 113, 0.1);
        color: #27ae60;
        border: 1px solid #2ecc71;
    }
    .msg-box.error {
        background-color: rgba(231, 76, 60, 0.1);
        color: #c0392b;
        border: 1px solid #e74c3c;
    }
`;
document.head.appendChild(styleSheet);