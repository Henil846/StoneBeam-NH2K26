document.addEventListener('DOMContentLoaded', () => {
    const selectPlanButtons = document.querySelectorAll('.select-plan');
    const paymentModal = document.getElementById('payment-modal');
    const closePayment = document.querySelector('.close-payment');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');
    const payButtons = document.querySelectorAll('.pay-button');

    let selectedPlan = '';
    let selectedPrice = '';

    // Handle plan selection
    selectPlanButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            selectedPlan = e.target.dataset.plan;
            selectedPrice = e.target.dataset.price;
            
            // Update modal content
            document.getElementById('selected-plan').textContent = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) + ' Plan';
            document.getElementById('plan-price').textContent = selectedPrice;
            document.getElementById('paypal-plan').textContent = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
            document.getElementById('paypal-amount').textContent = selectedPrice;
            document.querySelector('.pay-amount').textContent = selectedPrice;
            
            // Show payment modal
            paymentModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close payment modal
    closePayment.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close modal on outside click
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
            
            // Hide all payment forms
            paymentForms.forEach(form => form.style.display = 'none');
            
            // Show selected payment form
            const method = option.dataset.method;
            document.getElementById(method + '-form').style.display = 'block';
        });
    });

    // Set default payment method (card)
    document.querySelector('[data-method="card"]').click();

    // Handle card number formatting
    const cardNumberInput = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Handle expiry date formatting
    const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // Handle payment processing
    payButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const originalText = button.textContent;
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            showToast('Payment successful! Welcome to ' + selectedPlan + ' plan!', 'success');
            
            // Reset button
            button.disabled = false;
            button.textContent = originalText;
            
            // Close modal
            paymentModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Store subscription info
            localStorage.setItem('premiumSubscription', JSON.stringify({
                plan: selectedPlan,
                price: selectedPrice,
                subscribedAt: new Date().toISOString(),
                status: 'active'
            }));
        });
    });

    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Handle quotation form
    const quotationForm = document.querySelector('.premium-form');
    if (quotationForm) {
        quotationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(quotationForm);
            const data = Object.fromEntries(formData);
            
            // Store quotation request
            const quotations = JSON.parse(localStorage.getItem('quotationRequests') || '[]');
            quotations.push({
                ...data,
                requestedAt: new Date().toISOString(),
                status: 'pending'
            });
            localStorage.setItem('quotationRequests', JSON.stringify(quotations));
            
            showToast('Quotation request submitted successfully!', 'success');
            quotationForm.reset();
        });
    }
});