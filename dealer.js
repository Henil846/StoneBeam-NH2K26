document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const projects = JSON.parse(localStorage.getItem('sb_projects') || '[]');
    const quotations = JSON.parse(localStorage.getItem('sb_quotations') || '[]');

    if (projects.length === 0) {
        ordersContainer.innerHTML = '<div class="no-orders">No orders available</div>';
        return;
    }

    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        // Check if quotation exists for this order
        const existingQuot = quotations.find(q => q.orderId === project.id);
        let statusBadge = '';
        
        if(existingQuot){
            if(existingQuot.status === 'accepted'){
                statusBadge = '<span class="status-badge status-accepted">✓ Accepted</span>';
            } else if(existingQuot.status === 'rejected'){
                statusBadge = '<span class="status-badge status-rejected">✗ Rejected</span>';
            } else {
                statusBadge = '<span class="status-badge status-pending">⏳ Pending</span>';
            }
        }
        
        const header = document.createElement('div');
        header.className = 'order-header';
        header.innerHTML = `
            <div>
                <span class="order-id">Order #${project.id} ${statusBadge}</span>
                <div style="font-size:0.85rem;color:#6b7280;margin-top:4px"><i class="fa-solid fa-location-dot"></i> ${project.deliveryAddress || 'No address'}</div>
            </div>
            <span class="order-date">${project.userName || 'Unknown User'} - ${new Date(project.createdAt).toLocaleString()}</span>
        `;
        
        const table = document.createElement('table');
        table.className = 'items-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Rate (₹)</th>
                    <th>Delivery (₹)</th>
                    <th>Amount (₹)</th>
                </tr>
            </thead>
            <tbody id="tbody-${index}"></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        project.items.forEach((item, itemIndex) => {
            const row = document.createElement('tr');
            const existingRate = existingQuot ? existingQuot.items[itemIndex]?.rate || '' : '';
            const existingDelivery = existingQuot ? existingQuot.items[itemIndex]?.delivery || '' : '';
            row.innerHTML = `
                <td>${item.material}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td><input type="number" class="rate-input" data-order="${index}" data-item="${itemIndex}" min="0" step="0.01" placeholder="0.00" value="${existingRate}" ${existingQuot ? 'readonly' : ''}></td>
                <td><input type="number" class="delivery-input" data-order="${index}" data-item="${itemIndex}" min="0" step="0.01" placeholder="0.00" value="${existingDelivery}" ${existingQuot ? 'readonly' : ''}></td>
                <td class="amount-cell" id="amount-${index}-${itemIndex}">${existingQuot ? existingQuot.items[itemIndex]?.amount.toFixed(2) : '0.00'}</td>
            `;
            tbody.appendChild(row);
        });
        
        const totalRow = document.createElement('div');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `<span>Total Bill:</span> <span id="total-${index}">₹ ${existingQuot ? existingQuot.total.toFixed(2) : '0.00'}</span>`;
        
        card.appendChild(header);
        card.appendChild(table);
        card.appendChild(totalRow);
        
        if(!existingQuot){
            const submitBtn = document.createElement('button');
            submitBtn.className = 'submit-btn';
            submitBtn.textContent = 'Submit Quotation';
            submitBtn.onclick = () => submitQuotation(index, project);
            card.appendChild(submitBtn);
        }
        
        ordersContainer.appendChild(card);
    });

    // Calculate amounts on rate input
    document.querySelectorAll('.rate-input:not([readonly]), .delivery-input:not([readonly])').forEach(input => {
        input.addEventListener('input', (e) => {
            const orderIndex = e.target.dataset.order;
            const itemIndex = e.target.dataset.item;
            const rateInput = document.querySelector(`.rate-input[data-order="${orderIndex}"][data-item="${itemIndex}"]`);
            const deliveryInput = document.querySelector(`.delivery-input[data-order="${orderIndex}"][data-item="${itemIndex}"]`);
            const rate = parseFloat(rateInput.value) || 0;
            const delivery = parseFloat(deliveryInput.value) || 0;
            const qty = parseFloat(projects[orderIndex].items[itemIndex].quantity) || 0;
            const amount = (rate * qty) + delivery;
            
            document.getElementById(`amount-${orderIndex}-${itemIndex}`).textContent = amount.toFixed(2);
            updateTotal(orderIndex);
        });
    });

    function updateTotal(orderIndex) {
        let total = 0;
        const itemCount = projects[orderIndex].items.length;
        for(let i = 0; i < itemCount; i++) {
            const amount = parseFloat(document.getElementById(`amount-${orderIndex}-${i}`).textContent) || 0;
            total += amount;
        }
        document.getElementById(`total-${orderIndex}`).textContent = `₹ ${total.toFixed(2)}`;
    }

    function submitQuotation(orderIndex, project) {
        const rates = [];
        const deliveries = [];
        let allFilled = true;
        
        document.querySelectorAll(`[data-order="${orderIndex}"]`).forEach(input => {
            if(input.classList.contains('rate-input')) {
                const rate = parseFloat(input.value);
                if (!rate || rate <= 0) {
                    allFilled = false;
                }
                rates.push(rate || 0);
            }
        });
        
        document.querySelectorAll(`.delivery-input[data-order="${orderIndex}"]`).forEach(input => {
            const delivery = parseFloat(input.value) || 0;
            deliveries.push(delivery);
        });

        if (!allFilled) {
            alert('Please fill all rates before submitting');
            return;
        }

        const total = parseFloat(document.getElementById(`total-${orderIndex}`).textContent.replace('₹ ', ''));
        
        const quotation = {
            orderId: project.id,
            items: project.items.map((item, i) => ({
                ...item,
                rate: rates[i],
                delivery: deliveries[i],
                amount: (rates[i] * (parseFloat(item.quantity) || 0)) + deliveries[i]
            })),
            total,
            submittedAt: new Date().toISOString()
        };

        const quotations = JSON.parse(localStorage.getItem('sb_quotations') || '[]');
        quotations.push(quotation);
        localStorage.setItem('sb_quotations', JSON.stringify(quotations));

        alert(`Quotation submitted successfully! Total: ₹${total.toFixed(2)}`);
        location.reload();
    }
});
