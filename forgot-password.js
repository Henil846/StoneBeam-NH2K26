/**
 * StoneBeam-NH - Password Recovery Logic
 * Handles user lookup and simulation of reset link delivery.
 */

document.addEventListener('DOMContentLoaded', () => {
    const forgotForm = document.getElementById('forgotForm');
    const recoveryInput = document.getElementById('recoveryInput');
    const msgBox = document.getElementById('msg-box');
    const submitBtn = forgotForm.querySelector('button');

    forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const inputVal = recoveryInput.value.trim();
        
        // 1. Initial UI State (Loading Simulation)
        setLoadingState(true);

        // 2. Fetch Users from LocalStorage
        // Note: 'sb_users' should be the key where your registration data is stored
        const users = JSON.parse(localStorage.getItem('sb_users')) || [];

        // 3. Logic to find user by Email or Phone
        // Using a slight delay to simulate a real server request
        setTimeout(() => {
            const user = users.find(u => u.phone === inputVal || u.email === inputVal);

            if (user) {
                // Scenario: User Found
                handleSuccess(user);
            } else {
                // Scenario: User Not Found
                handleError("No account found with these details. Please check and try again.");
            }
            
            setLoadingState(false);
        }, 1200); 
    });

    /**
     * Updates the message box with success styling
     */
    function handleSuccess(user) {
        const contactType = user.email === recoveryInput.value.trim() ? "Email" : "Phone";
        
        showMsg(
            `Success! A reset link has been sent to the ${contactType} associated with ${user.name}.`, 
            "success"
        );

        // Optional: Clear input after success
        recoveryInput.value = "";
    }

    /**
     * Updates the message box with error styling
     */
    function handleError(text) {
        showMsg(text, "error");
    }

    /**
     * Core function to display messages
     */
    function showMsg(text, type) {
        msgBox.style.display = 'block';
        msgBox.className = 'msg-box ' + type; // Adds 'success' or 'error' class
        msgBox.innerText = text;
    }

    /**
     * Disables button and changes text during "processing"
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Processing...";
            submitBtn.style.opacity = "0.7";
            msgBox.style.display = 'none'; // Hide previous messages
        } else {
            submitBtn.disabled = false;
            submitBtn.innerText = "Send Reset Link";
            submitBtn.style.opacity = "1";
        }
    }
});