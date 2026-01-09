// RFQ (Request for Quotation) Manager with Firebase Firestore
class RFQManager {
    constructor() {
        this.db = window.db;
        this.auth = window.auth;
        this.quotesListener = null;
        this.init();
    }

    init() {
        if (!this.db) {
            console.error('Firebase Firestore not initialized');
            return;
        }
        this.setupRealtimeListener();
    }

    // 1. User Request: Create new quotation request
    async sendRequestForQuote(projectDetails) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User must be logged in to request quotes');
            }

            const quoteData = {
                userId: user.uid,
                userEmail: user.email,
                projectTitle: projectDetails.title,
                projectDescription: projectDetails.description,
                budget: projectDetails.budget,
                location: projectDetails.location,
                category: projectDetails.category,
                status: 'pending_dealer',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('quotations').add(quoteData);
            console.log('Quote request created with ID:', docRef.id);
            
            if (window.profileManager) {
                window.profileManager.showToast('Quote request sent successfully!', 'success');
            }
            
            return docRef.id;
        } catch (error) {
            console.error('Error sending quote request:', error);
            if (window.profileManager) {
                window.profileManager.showToast('Failed to send quote request', 'error');
            }
            throw error;
        }
    }

    // 2. Dealer Response Simulation
    async simulateDealerResponse(quoteId, amount) {
        try {
            const quoteRef = this.db.collection('quotations').doc(quoteId);
            
            await quoteRef.update({
                dealerPrice: amount,
                dealerResponse: `Quote for ₹${amount}`,
                status: 'quoted',
                quotedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Dealer response simulated for quote ${quoteId}: ₹${amount}`);
            return true;
        } catch (error) {
            console.error('Error simulating dealer response:', error);
            throw error;
        }
    }

    // 3. Real-time listener for quote updates
    setupRealtimeListener() {
        const user = this.auth.currentUser;
        if (!user) {
            console.log('No user logged in, skipping real-time listener setup');
            return;
        }

        this.quotesListener = this.db.collection('quotations')
            .where('userId', '==', user.uid)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'modified') {
                        const data = change.doc.data();
                        const quoteId = change.doc.id;
                        
                        if (data.status === 'quoted') {
                            this.handleQuoteReceived(quoteId, data);
                        }
                    }
                });
            }, (error) => {
                console.error('Error in quotes listener:', error);
            });
    }

    // Handle when a quote is received
    handleQuoteReceived(quoteId, quoteData) {
        // a. Trigger UI notification
        if (window.profileManager) {
            window.profileManager.showToast(
                `New quote received for ${quoteData.projectTitle}: ₹${quoteData.dealerPrice}`, 
                'success'
            );
        }

        // b. Update the Quotes tab
        this.updateQuotesTab(quoteId, quoteData);
    }

    // Update Quotes tab with Accept/Reject buttons
    updateQuotesTab(quoteId, quoteData) {
        const quotesList = document.getElementById('quotesList');
        if (!quotesList) return;

        // Create or update quote card
        let quoteCard = document.getElementById(`quote-${quoteId}`);
        if (!quoteCard) {
            quoteCard = document.createElement('div');
            quoteCard.id = `quote-${quoteId}`;
            quoteCard.className = 'quote-card';
            quotesList.appendChild(quoteCard);
        }

        quoteCard.innerHTML = `
            <div class="quote-header">
                <h4>${quoteData.projectTitle}</h4>
                <span class="quote-status ${quoteData.status}">${quoteData.status.charAt(0).toUpperCase() + quoteData.status.slice(1)}</span>
            </div>
            <div class="quote-details">
                <div class="quote-meta">
                    <span><i class="fa-solid fa-rupee-sign"></i> ₹${quoteData.dealerPrice}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${new Date(quoteData.quotedAt?.toDate()).toLocaleDateString()}</span>
                </div>
                <p>${quoteData.projectDescription}</p>
            </div>
            <div class="quote-actions">
                <button class="btn-primary" onclick="rfqManager.acceptQuote('${quoteId}')">
                    <i class="fa-solid fa-check"></i> Accept
                </button>
                <button class="btn-secondary" onclick="rfqManager.rejectQuote('${quoteId}')">
                    <i class="fa-solid fa-times"></i> Reject
                </button>
            </div>
        `;
    }

    // 4. Accept Quote
    async acceptQuote(quoteId) {
        try {
            const quoteRef = this.db.collection('quotations').doc(quoteId);
            
            await quoteRef.update({
                status: 'approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update UI
            const quoteCard = document.getElementById(`quote-${quoteId}`);
            if (quoteCard) {
                const statusSpan = quoteCard.querySelector('.quote-status');
                const actionsDiv = quoteCard.querySelector('.quote-actions');
                
                statusSpan.textContent = 'Approved';
                statusSpan.className = 'quote-status approved';
                actionsDiv.innerHTML = '<span class="approved-text"><i class="fa-solid fa-check-circle"></i> Quote Approved</span>';
            }

            if (window.profileManager) {
                window.profileManager.showToast('Quote accepted successfully!', 'success');
            }

        } catch (error) {
            console.error('Error accepting quote:', error);
            if (window.profileManager) {
                window.profileManager.showToast('Failed to accept quote', 'error');
            }
        }
    }

    // 4. Reject Quote
    async rejectQuote(quoteId) {
        try {
            const quoteRef = this.db.collection('quotations').doc(quoteId);
            
            await quoteRef.update({
                status: 'rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update UI
            const quoteCard = document.getElementById(`quote-${quoteId}`);
            if (quoteCard) {
                const statusSpan = quoteCard.querySelector('.quote-status');
                const actionsDiv = quoteCard.querySelector('.quote-actions');
                
                statusSpan.textContent = 'Rejected';
                statusSpan.className = 'quote-status rejected';
                actionsDiv.innerHTML = '<span class="rejected-text"><i class="fa-solid fa-times-circle"></i> Quote Rejected</span>';
            }

            if (window.profileManager) {
                window.profileManager.showToast('Quote rejected', 'warning');
            }

        } catch (error) {
            console.error('Error rejecting quote:', error);
            if (window.profileManager) {
                window.profileManager.showToast('Failed to reject quote', 'error');
            }
        }
    }

    // Load existing quotes from Firestore
    async loadQuotes() {
        try {
            const user = this.auth.currentUser;
            if (!user) return [];

            const snapshot = await this.db.collection('quotations')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();

            const quotes = [];
            snapshot.forEach(doc => {
                quotes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return quotes;
        } catch (error) {
            console.error('Error loading quotes:', error);
            return [];
        }
    }

    // Cleanup listener
    destroy() {
        if (this.quotesListener) {
            this.quotesListener();
            this.quotesListener = null;
        }
    }
}

// Global instance
let rfqManager;

// Initialize RFQ Manager when Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be initialized
    const initRFQ = () => {
        if (window.db && window.auth) {
            rfqManager = new RFQManager();
            window.rfqManager = rfqManager;
            console.log('RFQ Manager initialized');
        } else {
            setTimeout(initRFQ, 100);
        }
    };
    initRFQ();
});

// Console helper functions for testing
window.testRFQ = {
    // Test sending a quote request
    sendTestQuote: () => {
        const projectDetails = {
            title: 'Test Kitchen Renovation',
            description: 'Complete kitchen makeover with modern appliances',
            budget: '500000',
            location: 'Mumbai, Maharashtra',
            category: 'Kitchen'
        };
        return rfqManager.sendRequestForQuote(projectDetails);
    },
    
    // Test dealer response (use the quote ID from sendTestQuote)
    simulateDealer: (quoteId, amount = '450000') => {
        return rfqManager.simulateDealerResponse(quoteId, amount);
    }
};