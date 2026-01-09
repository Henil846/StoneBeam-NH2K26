// Help & Support System
class SupportManager {
    constructor() {
        this.tickets = this.loadTickets();
        this.faqs = this.loadFAQs();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupServiceQuotes();
        this.setupLiveChat();
        this.renderFAQs();
    }

    setupEventListeners() {
        // Service quote buttons
        document.querySelectorAll('.service-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceType = e.target.dataset.service;
                this.showQuoteModal(serviceType);
            });
        });

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Live chat toggle
        this.setupChatWidget();
    }

    setupServiceQuotes() {
        // Add quote functionality to service cards
        const services = {
            residential: {
                name: 'Residential Construction',
                basePrice: 2500000,
                features: ['Custom Architectural Design', 'Premium Interior Finishing', 'Smart Home Integration', 'Landscaping & Exteriors']
            },
            commercial: {
                name: 'Commercial Construction',
                basePrice: 8500000,
                features: ['Corporate Office Buildings', 'Retail & Shopping Centers', 'Industrial Warehouses', 'Mixed-Use Developments']
            },
            industrial: {
                name: 'Industrial Construction',
                basePrice: 35000000,
                features: ['Manufacturing Facilities', 'Processing Plants', 'Logistics Centers', 'Heavy Industrial Infrastructure']
            },
            renovation: {
                name: 'Renovation & Remodeling',
                basePrice: 1200000,
                features: ['Complete Space Transformation', 'Structural Upgrades', 'Modern System Integration', 'Sustainable Retrofitting']
            },
            infrastructure: {
                name: 'Infrastructure Development',
                basePrice: 25000000,
                features: ['Highway & Road Construction', 'Bridge Engineering', 'Urban Infrastructure', 'Utility Development']
            }
        };

        this.services = services;
    }

    showQuoteModal(serviceType) {
        const service = this.services[serviceType];
        if (!service) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content quote-modal">
                <div class="modal-header">
                    <h3>Get Quote - ${service.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form class="quote-form">
                    <div class="service-summary">
                        <h4>${service.name}</h4>
                        <p>Starting from ₹${this.formatPrice(service.basePrice)}</p>
                        <ul class="feature-list">
                            ${service.features.map(feature => `<li><i class="fa-solid fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="form-section">
                        <h4>Project Details</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="project-name">Project Name</label>
                                <input type="text" id="project-name" required>
                            </div>
                            <div class="form-group">
                                <label for="project-location">Location</label>
                                <input type="text" id="project-location" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="project-size">Project Size (sq ft)</label>
                                <input type="number" id="project-size" min="100" required>
                            </div>
                            <div class="form-group">
                                <label for="project-budget">Budget Range</label>
                                <select id="project-budget" required>
                                    <option value="">Select budget range</option>
                                    <option value="low">₹5L - ₹20L</option>
                                    <option value="medium">₹20L - ₹1Cr</option>
                                    <option value="high">₹1Cr - ₹5Cr</option>
                                    <option value="premium">₹5Cr+</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="project-timeline">Expected Timeline</label>
                            <select id="project-timeline" required>
                                <option value="">Select timeline</option>
                                <option value="urgent">Less than 3 months</option>
                                <option value="normal">3-6 months</option>
                                <option value="flexible">6-12 months</option>
                                <option value="long-term">More than 12 months</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="project-description">Project Description</label>
                            <textarea id="project-description" rows="4" placeholder="Describe your project requirements..."></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Contact Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="client-name">Full Name</label>
                                <input type="text" id="client-name" required>
                            </div>
                            <div class="form-group">
                                <label for="client-email">Email</label>
                                <input type="email" id="client-email" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="client-phone">Phone Number</label>
                                <input type="tel" id="client-phone" required>
                            </div>
                            <div class="form-group">
                                <label for="client-company">Company (Optional)</label>
                                <input type="text" id="client-company">
                            </div>
                        </div>
                    </div>

                    <div class="quote-estimate">
                        <h4>Estimated Quote</h4>
                        <div class="estimate-breakdown">
                            <div class="estimate-item">
                                <span>Base Cost:</span>
                                <span id="base-cost">₹${this.formatPrice(service.basePrice)}</span>
                            </div>
                            <div class="estimate-item">
                                <span>Size Factor:</span>
                                <span id="size-factor">₹0</span>
                            </div>
                            <div class="estimate-item total">
                                <span>Estimated Total:</span>
                                <span id="total-estimate">₹${this.formatPrice(service.basePrice)}</span>
                            </div>
                        </div>
                        <p class="estimate-note">*This is a preliminary estimate. Final quote will be provided after site inspection.</p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancel</button>
                        <button type="submit" class="btn-submit">Request Quote</button>
                    </div>
                </form>
            </div>
        `;

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Dynamic quote calculation
        const sizeInput = modal.querySelector('#project-size');
        sizeInput.addEventListener('input', () => {
            this.updateQuoteEstimate(modal, service);
        });

        // Form submission
        modal.querySelector('.quote-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuoteRequest(modal, serviceType);
        });

        document.body.appendChild(modal);
    }

    updateQuoteEstimate(modal, service) {
        const sizeInput = modal.querySelector('#project-size');
        const size = parseInt(sizeInput.value) || 0;
        
        const baseCost = service.basePrice;
        const sizeFactor = size * 1000; // ₹1000 per sq ft
        const total = baseCost + sizeFactor;

        modal.querySelector('#base-cost').textContent = `₹${this.formatPrice(baseCost)}`;
        modal.querySelector('#size-factor').textContent = `₹${this.formatPrice(sizeFactor)}`;
        modal.querySelector('#total-estimate').textContent = `₹${this.formatPrice(total)}`;
    }

    submitQuoteRequest(modal, serviceType) {
        const formData = {
            id: Date.now().toString(),
            serviceType: serviceType,
            projectName: modal.querySelector('#project-name').value,
            location: modal.querySelector('#project-location').value,
            size: modal.querySelector('#project-size').value,
            budget: modal.querySelector('#project-budget').value,
            timeline: modal.querySelector('#project-timeline').value,
            description: modal.querySelector('#project-description').value,
            clientName: modal.querySelector('#client-name').value,
            clientEmail: modal.querySelector('#client-email').value,
            clientPhone: modal.querySelector('#client-phone').value,
            clientCompany: modal.querySelector('#client-company').value,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Save quote request
        const quotes = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
        quotes.push(formData);
        localStorage.setItem('quoteRequests', JSON.stringify(quotes));

        modal.remove();
        this.showNotification('Quote request submitted successfully! We will contact you within 24 hours.', 'success');
        
        // Send confirmation email (simulated)
        this.sendConfirmationEmail(formData);
    }

    sendConfirmationEmail(quoteData) {
        // Simulate email sending
        setTimeout(() => {
            this.showNotification(`Confirmation email sent to ${quoteData.clientEmail}`, 'info');
        }, 2000);
    }

    setupLiveChat() {
        // Create chat widget
        const chatWidget = document.createElement('div');
        chatWidget.className = 'chat-widget';
        chatWidget.innerHTML = `
            <div class="chat-toggle" id="chat-toggle">
                <i class="fa-solid fa-comments"></i>
                <span class="chat-badge">1</span>
            </div>
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <div class="chat-title">
                        <i class="fa-solid fa-headset"></i>
                        <span>Live Support</span>
                    </div>
                    <button class="chat-minimize" id="chat-minimize">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <i class="fa-solid fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>Hello! I'm here to help you with any questions about our construction services. How can I assist you today?</p>
                            <div class="message-time">${new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type your message...">
                    <button id="chat-send">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatWidget);

        // Chat functionality
        const chatToggle = document.getElementById('chat-toggle');
        const chatWindow = document.getElementById('chat-window');
        const chatMinimize = document.getElementById('chat-minimize');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');

        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            document.querySelector('.chat-badge').style.display = 'none';
        });

        chatMinimize.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            this.addChatMessage(message, 'user');
            chatInput.value = '';

            // Simulate bot response
            setTimeout(() => {
                const response = this.getBotResponse(message);
                this.addChatMessage(response, 'bot');
            }, 1000);
        };

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fa-solid fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    getBotResponse(message) {
        const responses = {
            'hello': 'Hello! Welcome to StoneBeam-NH. How can I assist you with your construction project today?',
            'hi': 'Hi there! I\'m here to help with any questions about our construction services.',
            'price': 'Our pricing varies by project complexity. Residential projects start from ₹25L, commercial from ₹85L, and industrial from ₹3.5Cr. Would you like a detailed quote?',
            'quote': 'I can help you get a personalized quote! Please click on any service card to fill out our detailed quote form, or tell me about your specific construction needs.',
            'timeline': 'Project timelines depend on scope and complexity. Residential: 4-8 months, Commercial: 8-18 months, Industrial: 12-24 months. We provide detailed schedules during planning.',
            'contact': 'You can reach us at stonebeamnh@gmail.com or call +91-9106120047. Our Ahmedabad office is open 9 AM to 6 PM, Monday to Saturday.',
            'services': 'We specialize in residential construction, commercial buildings, industrial facilities, complete renovations, and infrastructure development across Gujarat and India.',
            'experience': 'StoneBeam-NH has 15+ years in construction, completing 500+ projects with 98% client satisfaction. We\'re based in Ahmedabad with projects across Gujarat.',
            'location': 'We\'re headquartered in Ahmedabad, Gujarat, and handle projects across India. Our recent projects include developments in Gandhinagar, Surat, Vadodara, and Rajkot.',
            'safety': 'Safety is our top priority. We follow OSHA standards, conduct daily safety briefings, use certified equipment, and maintain comprehensive insurance coverage.',
            'materials': 'We source premium materials from certified suppliers, including JSW Steel, UltraTech Cement, and other top brands. All materials meet ISI standards.',
            'permits': 'We handle all regulatory approvals including building permits, environmental clearances, and municipal approvals. Our team manages the entire compliance process.',
            'default': 'I\'d be happy to help you with that. For detailed assistance, please contact our expert team at stonebeamnh@gmail.com or call +91-9106120047.'
        };

        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        return responses.default;
    }

    renderFAQs() {
        const faqContainer = document.querySelector('.faq-container');
        if (!faqContainer) return;

        faqContainer.innerHTML = this.faqs.map((faq, index) => `
            <div class="faq-item">
                <div class="faq-question" onclick="supportManager.toggleFAQ(${index})">
                    <h4>${faq.question}</h4>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `).join('');
    }

    toggleFAQ(index) {
        const faqItems = document.querySelectorAll('.faq-item');
        const item = faqItems[index];
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.fa-chevron-down');

        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
        } else {
            // Close all other FAQs
            faqItems.forEach((faqItem, i) => {
                if (i !== index) {
                    faqItem.querySelector('.faq-answer').style.display = 'none';
                    faqItem.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                }
            });
            
            answer.style.display = 'block';
            icon.style.transform = 'rotate(180deg)';
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-IN').format(price);
    }

    loadTickets() {
        return JSON.parse(localStorage.getItem('supportTickets') || '[]');
    }

    loadFAQs() {
        return [
            {
                question: "What types of construction services do you offer?",
                answer: "We offer comprehensive construction services including residential construction, commercial buildings, industrial facilities, renovation & remodeling, and infrastructure development. Each service is tailored to meet specific client requirements."
            },
            {
                question: "How do I get a quote for my project?",
                answer: "You can get a quote by clicking the 'Get Quote' button on any service card, filling out our online form, or contacting us directly. We provide free initial consultations and detailed quotes within 24-48 hours."
            },
            {
                question: "What is your typical project timeline?",
                answer: "Project timelines vary based on size and complexity. Residential projects typically take 3-6 months, commercial projects 6-12 months, and industrial projects 12-18 months. We provide detailed timelines during the planning phase."
            },
            {
                question: "Do you provide project management services?",
                answer: "Yes, we provide comprehensive project management services including planning, scheduling, quality control, safety management, and regular progress reporting. Our experienced project managers ensure timely completion within budget."
            },
            {
                question: "What areas do you serve?",
                answer: "We operate across India with offices in Mumbai, Delhi, Bangalore, Chennai, and Pune. We can handle projects nationwide and have experience working in various geographical and climatic conditions."
            },
            {
                question: "Do you offer financing options?",
                answer: "Yes, we partner with leading financial institutions to offer flexible financing options for qualified projects. Our team can help you explore various funding solutions including construction loans and payment plans."
            },
            {
                question: "What safety measures do you implement?",
                answer: "Safety is our top priority. We follow strict safety protocols, provide regular safety training, use certified equipment, conduct daily safety inspections, and maintain comprehensive insurance coverage for all projects."
            },
            {
                question: "Can I track my project progress online?",
                answer: "Yes, we provide a client portal where you can track project progress, view photos, access documents, communicate with the project team, and receive real-time updates on milestones and timelines."
            }
        ];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// CSS for support functionality
const supportStyles = `
    .quote-modal {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .service-summary {
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 25px;
    }
    
    .service-summary h4 {
        color: #667eea;
        margin-bottom: 10px;
    }
    
    .service-summary p {
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 15px;
    }
    
    .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .feature-list li {
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .feature-list li i {
        color: #27ae60;
    }
    
    .form-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .form-section h4 {
        color: white;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .quote-estimate {
        background: rgba(118, 75, 162, 0.1);
        border: 1px solid rgba(118, 75, 162, 0.3);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 25px;
    }
    
    .estimate-breakdown {
        margin-bottom: 15px;
    }
    
    .estimate-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .estimate-item.total {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 10px;
        font-weight: 600;
        font-size: 1.1rem;
        color: white;
    }
    
    .estimate-note {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        font-style: italic;
        margin: 0;
    }
    
    .chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .chat-toggle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        position: relative;
    }
    
    .chat-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
    }
    
    .chat-toggle i {
        color: white;
        font-size: 1.5rem;
    }
    
    .chat-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .chat-window {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 350px;
        height: 500px;
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        backdrop-filter: blur(20px);
        display: none;
        flex-direction: column;
        overflow: hidden;
    }
    
    .chat-window.open {
        display: flex;
        animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .chat-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .chat-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: white;
        font-weight: 600;
    }
    
    .chat-minimize {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        border-radius: 3px;
        transition: all 0.3s ease;
    }
    
    .chat-minimize:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .message {
        display: flex;
        gap: 10px;
        align-items: flex-start;
    }
    
    .message-avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .bot-message .message-avatar {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
    }
    
    .user-message {
        flex-direction: row-reverse;
    }
    
    .user-message .message-avatar {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .message-content {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 12px 15px;
    }
    
    .user-message .message-content {
        background: rgba(102, 126, 234, 0.2);
        border-color: rgba(102, 126, 234, 0.3);
    }
    
    .message-content p {
        color: white;
        margin: 0 0 8px 0;
        line-height: 1.4;
    }
    
    .message-time {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
    }
    
    .chat-input-area {
        padding: 15px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 10px;
    }
    
    .chat-input-area input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.3);
        color: white;
        outline: none;
    }
    
    .chat-input-area input:focus {
        border-color: #667eea;
    }
    
    .chat-input-area button {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .chat-input-area button:hover {
        transform: scale(1.1);
    }
    
    .faq-container {
        margin-top: 30px;
    }
    
    .faq-item {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        margin-bottom: 15px;
        overflow: hidden;
    }
    
    .faq-question {
        padding: 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }
    
    .faq-question:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    
    .faq-question h4 {
        color: white;
        margin: 0;
        font-size: 1.1rem;
    }
    
    .faq-question i {
        color: #667eea;
        transition: transform 0.3s ease;
    }
    
    .faq-answer {
        display: none;
        padding: 0 20px 20px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .faq-answer p {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
        margin: 15px 0 0 0;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .chat-window {
            width: 300px;
            height: 400px;
        }
        
        .quote-modal {
            width: 95%;
            margin: 20px;
        }
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = supportStyles;
document.head.appendChild(styleSheet);

// Initialize support manager when page loads
let supportManager;
document.addEventListener('DOMContentLoaded', () => {
    supportManager = new SupportManager();
});