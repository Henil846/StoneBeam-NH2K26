// new-project.js — simple dynamic fields
document.addEventListener('DOMContentLoaded', function(){
    const addBtn = document.getElementById('add-field');
    const fieldsContainer = document.getElementById('fields-container');
    const saveBtn = document.getElementById('save-btn');

    let fieldCount = fieldsContainer.querySelectorAll('.field-row').length;

    function createField(){
        fieldCount++;
        const row = document.createElement('div');
        row.className = 'field-row';

        const label = document.createElement('label');
        label.textContent = `Material ${fieldCount}`;

        // Try to clone the first row's material select so we preserve long hardcoded option lists
        let material;
        const firstRow = fieldsContainer.querySelector('.field-row');
        const firstMat = firstRow ? firstRow.querySelector('.material-select') : null;
        if(firstMat){
            material = firstMat.cloneNode(true);
            material.name = 'material[]';
            material.className = 'material-select';
            // clear any selection by default
            material.value = '';
        } else {
            material = document.createElement('select');
            material.name = 'material[]';
            material.className = 'material-select';
            const placeholderMat = document.createElement('option');
            placeholderMat.value = '';
            placeholderMat.textContent = 'Select material';
            material.appendChild(placeholderMat);
        }

        const qty = document.createElement('input');
        qty.type = 'number';
        qty.name = 'quantity[]';
        qty.className = 'qty-input';
        qty.placeholder = 'Qty';
        qty.min = 0;
        qty.step = 'any';

        // Try to clone the first row's unit select to preserve any hardcoded unit options
        let unit;
        const firstUnit = firstRow ? firstRow.querySelector('.unit-select') : null;
        if(firstUnit){
            unit = firstUnit.cloneNode(true);
            unit.name = 'unit[]';
            unit.className = 'unit-select';
            unit.value = '';
        } else {
            unit = document.createElement('select');
            unit.name = 'unit[]';
            unit.className = 'unit-select';
            const placeholderOpt = document.createElement('option');
            placeholderOpt.value = '';
            placeholderOpt.textContent = 'unit';
            unit.appendChild(placeholderOpt);
        }

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-btn';
        remove.innerHTML = '<i class="fa-solid fa-trash"></i>';
        remove.addEventListener('click', function(){
            row.remove();
            refreshLabels();
        });

        // update unit select when material changes
        material.addEventListener('change', function(){
            const unitKey = materialsMap[material.value];
            fillUnitSelect(unit, unitKey);
        });

        row.appendChild(label);
        row.appendChild(material);
        row.appendChild(qty);
        row.appendChild(unit);
        row.appendChild(remove);

        // if materials list already loaded, populate this material select
        if(Object.keys(materialsMap).length) fillMaterialSelect(material, material.value);

        return row;
    }

    function refreshLabels(){
        const rows = fieldsContainer.querySelectorAll('.field-row');
        fieldCount = rows.length;
        rows.forEach((r, i)=>{
            const lbl = r.querySelector('label');
            if(lbl) lbl.textContent = `Field ${i+1}`;
            const remBtn = r.querySelector('.remove-btn');
            if(remBtn) remBtn.hidden = (i===0 && rows.length===1);
        });
    }

    addBtn.addEventListener('click', function(){
        const newField = createField();
        fieldsContainer.appendChild(newField);
        refreshLabels();
    });

    // Initialize: ensure first remove button is hidden
    refreshLabels();

    // Populate material selects by fetching local JSON files (materials + units APIs)
    const materialsMap = {}; // materialName -> unitKey
    const unitsMap = {}; // unitKey -> {symbol,name}

    function populateMaterials(arr){
        arr.forEach(item => {
            const name = item.name || item;
            const unitKey = item.unit || 'unit';
            materialsMap[name] = unitKey;
        });

        // update existing material selects and unit selects
        updateExistingUnits();
    }

    function fillMaterialSelect(selectElement, selectedName){
        // Ensure a placeholder option exists as the first option
        let placeholder = selectElement.querySelector('option[value=""]');
        if(!placeholder){
            placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Select material';
            selectElement.insertBefore(placeholder, selectElement.firstChild);
        }

        // Build a set of existing option values to avoid duplicates
        const existing = new Set(Array.from(selectElement.options).map(o => o.value));

        // Add any materials from materialsMap that don't already exist in the select
        Object.keys(materialsMap).forEach(name => {
            if(!existing.has(name)){
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                selectElement.appendChild(opt);
            }
        });

        // Preserve or set the selected value if provided
        if(selectedName) selectElement.value = selectedName;
    }

    function fillUnitSelect(selectElement, selectedKey){
        // Ensure a placeholder option exists as the first option
        let placeholder = selectElement.querySelector('option[value=""]');
        if(!placeholder){
            placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'unit';
            selectElement.insertBefore(placeholder, selectElement.firstChild);
        }

        // Build a set of existing option values to avoid duplicates
        const existing = new Set(Array.from(selectElement.options).map(o => o.value));

        // Add any units from unitsMap that don't already exist in the select
        Object.keys(unitsMap).forEach(key => {
            if(!existing.has(key)){
                const opt = document.createElement('option');
                opt.value = key;
                const u = unitsMap[key];
                opt.textContent = (u && u.symbol) ? u.symbol : key;
                selectElement.appendChild(opt);
            }
        });

        // Preserve or set the selected value if provided
        if(selectedKey) selectElement.value = selectedKey;
    }

    function updateExistingUnits(){
        document.querySelectorAll('.field-row').forEach(r=>{
            const matSelect = r.querySelector('.material-select');
            const matInput = r.querySelector('.material-input');
            const matEl = matSelect || matInput;
            const uSelect = r.querySelector('.unit-select');
            if(matEl && uSelect){
                const unitKey = materialsMap[matEl.value];
                // ensure unit dropdown options exist
                fillUnitSelect(uSelect, unitKey);
                // if material select exists and materialsMap is populated, ensure its options are filled
                if(matSelect && Object.keys(materialsMap).length) fillMaterialSelect(matSelect, matEl.value);
            }
        });
    }

    // Fetch materials and units in parallel; both act as simple local APIs
    Promise.all([
        fetch('materials.json'),
        fetch('units.json')
    ])
    .then(responses => Promise.all(responses.map(r => { if(!r.ok) throw new Error('Fetch failed'); return r.json(); })))
    .then(([materialsData, unitsData]) => {
        // build unitsMap
        if(Array.isArray(unitsData)){
            unitsData.forEach(u => {
                if(u && u.key) unitsMap[u.key] = { symbol: u.symbol || u.key, name: u.name || u.key };
            });
        }

        // normalize materials and populate
        if(Array.isArray(materialsData) && materialsData.length){
            const normalized = materialsData.map(d => (typeof d === 'string') ? {name:d, unit:'unit'} : d);
            populateMaterials(normalized);
            // fill any existing material selects
            document.querySelectorAll('.material-select').forEach(sel => fillMaterialSelect(sel, sel.value));
        } else {
            throw new Error('Invalid materials data');
        }
    })
    .catch(()=>{
        // fallback: small built-in lists
        const fallbackUnits = [
            {key:'bag',symbol:'bag',name:'Bag (50 kg)'},
            {key:'m3',symbol:'m3',name:'Cubic meter'},
            {key:'kg',symbol:'kg',name:'Kilogram'},
            {key:'nos',symbol:'nos',name:'Number / Pieces'},
            {key:'sheet',symbol:'sheet',name:'Sheet'}
        ];
        fallbackUnits.forEach(u=> unitsMap[u.key]= {symbol:u.symbol,name:u.name});

        const fallback = [
            {name:'Cement',unit:'bag'},{name:'Sand',unit:'m3'},{name:'Gravel',unit:'m3'},{name:'Concrete',unit:'m3'},{name:'Rebar',unit:'kg'}
        ];
        populateMaterials(fallback);
        document.querySelectorAll('.material-select').forEach(sel => fillMaterialSelect(sel, sel.value));
    });

    saveBtn.addEventListener('click', function(){
        const deliveryAddress = document.getElementById('delivery-address').value.trim();
        
        if(!deliveryAddress){
            alert('Please enter delivery address');
            return;
        }
        
        const rows = Array.from(document.querySelectorAll('.field-row'));
        const items = [];
        rows.forEach(r=>{
            const matEl = r.querySelector('select[name="material[]"]');
            const qtyEl = r.querySelector('input[name="quantity[]"]');
            const unitEl = r.querySelector('select[name="unit[]"]');
            if(!matEl) return;
            const material = matEl.value;
            if(!material) return; // skip empty rows
            const quantity = qtyEl ? qtyEl.value : '';
            const unit = unitEl ? unitEl.value : '';
            items.push({ material, quantity, unit });
        });

        if(items.length === 0){
            alert('No materials entered');
            return;
        }

        const currentUser = JSON.parse(sessionStorage.getItem('sb_currentUser'));
        const userName = currentUser ? currentUser.name || currentUser.email : 'Unknown User';

        const project = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            userName: userName,
            deliveryAddress: deliveryAddress,
            items
        };

        const existing = JSON.parse(localStorage.getItem('sb_projects') || '[]');
        existing.push(project);
        localStorage.setItem('sb_projects', JSON.stringify(existing));

        // Also save to dealer-accessible projects list
        const dealerProjects = JSON.parse(localStorage.getItem('dealer_projects') || '[]');
        dealerProjects.push({
            ...project,
            status: 'open',
            quotesReceived: 0,
            postedAt: new Date().toISOString()
        });
        localStorage.setItem('dealer_projects', JSON.stringify(dealerProjects));

        // Send email notification to all dealers
        notifyDealers(project);

        alert('Project saved successfully! Dealers will be notified.');
        window.location.href = 'index.html';
    });
    
    function notifyDealers(project) {
        const dealers = JSON.parse(localStorage.getItem('sb_dealers') || '[]');
        
        if(dealers.length === 0) return;
        
        const emailSubject = `New Project Available - Order #${project.id}`;
        const emailBody = `
New Project Created!

Project ID: ${project.id}
Customer: ${project.userName}
Delivery Address: ${project.deliveryAddress}
Materials: ${project.items.length} items

Login to submit your quotation: ${window.location.origin}/dealer-login.html
        `;
        
        dealers.forEach(dealer => {
            sendEmail(dealer.email, emailSubject, emailBody);
        });
    }
    
    function sendEmail(to, subject, body) {
        // Using EmailJS service (free email service)
        // Sign up at https://www.emailjs.com/ and get your credentials
        
        const serviceID = 'YOUR_EMAILJS_SERVICE_ID';
        const templateID = 'YOUR_EMAILJS_TEMPLATE_ID';
        const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';
        
        // EmailJS API call
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                service_id: serviceID,
                template_id: templateID,
                user_id: publicKey,
                template_params: {
                    to_email: to,
                    subject: subject,
                    message: body
                }
            })
        })
        .then(response => {
            if(response.ok) {
                console.log(`Email sent to ${to}`);
            } else {
                console.log(`Email failed for ${to}`);
            }
        })
        .catch(error => {
            console.error('Email error:', error);
        });
    }
});