# RFQ (Request for Quotation) System Implementation

## Overview
The RFQ system enables real-time quotation workflow between Users and Dealers using Firebase Firestore. It replaces localStorage mock data with persistent cloud storage and real-time updates.

## Files Created/Modified

### New Files:
1. **`rfq-manager.js`** - Core RFQ functionality with Firebase Firestore
2. **`rfq-test.html`** - Test page for RFQ functionality
3. **`RFQ-IMPLEMENTATION.md`** - This documentation

### Modified Files:
1. **`profile.js`** - Updated ProfileManager class with RFQ integration
2. **`profile.html`** - Added RFQ manager script

## Implementation Details

### 1. User Request (`sendRequestForQuote`)
```javascript
// Usage in your application
const projectDetails = {
    title: 'Kitchen Renovation',
    description: 'Complete kitchen makeover with modern appliances',
    budget: '500000',
    location: 'Mumbai, Maharashtra',
    category: 'Kitchen'
};

const quoteId = await rfqManager.sendRequestForQuote(projectDetails);
```

**Firestore Document Structure:**
```javascript
{
    userId: "user_firebase_uid",
    userEmail: "user@email.com",
    projectTitle: "Kitchen Renovation",
    projectDescription: "Complete kitchen makeover...",
    budget: "500000",
    location: "Mumbai, Maharashtra",
    category: "Kitchen",
    status: "pending_dealer",
    createdAt: serverTimestamp,
    updatedAt: serverTimestamp
}
```

### 2. Dealer Response Simulation (`simulateDealerResponse`)
```javascript
// Console command for testing
await rfqManager.simulateDealerResponse('quote_id_here', '450000');
```

**Updated Document:**
```javascript
{
    // ... existing fields
    dealerPrice: "450000",
    dealerResponse: "Quote for ₹450000",
    status: "quoted",
    quotedAt: serverTimestamp,
    updatedAt: serverTimestamp
}
```

### 3. Real-time Listener
The system automatically listens for quote status changes and:
- Shows toast notifications when quotes are received
- Updates the Quotes tab with Accept/Reject buttons
- Refreshes the UI in real-time

### 4. Accept/Reject Logic
```javascript
// Accept a quote
await rfqManager.acceptQuote('quote_id_here');

// Reject a quote  
await rfqManager.rejectQuote('quote_id_here');
```

## Integration with ProfileManager

The ProfileManager class has been updated to:
1. Load quotes from Firestore instead of localStorage
2. Handle both Firestore and localStorage quotes for backward compatibility
3. Integrate with RFQ manager for real-time updates
4. Provide `sendRequestForQuote` method for new quote requests

## Testing the System

### Option 1: Use the Test Page
1. Open `rfq-test.html` in your browser
2. Fill out the quote request form
3. Submit the form and note the Quote ID in console
4. Use the Dealer Simulation section to respond to the quote
5. Watch for real-time notifications and UI updates

### Option 2: Console Testing
```javascript
// 1. Send a test quote request
const quoteId = await testRFQ.sendTestQuote();
console.log('Quote ID:', quoteId);

// 2. Simulate dealer response (use the quote ID from step 1)
await testRFQ.simulateDealer('your_quote_id_here', '450000');

// 3. Accept or reject the quote
await rfqManager.acceptQuote('your_quote_id_here');
// OR
await rfqManager.rejectQuote('your_quote_id_here');
```

## Firestore Security Rules

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Quotations collection
    match /quotations/{quoteId} {
      // Users can read/write their own quotes
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == resource.data.userId);
      
      // Allow creation of new quotes
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Status Flow

1. **pending_dealer** - Initial status when user creates quote request
2. **quoted** - Dealer has provided a price quote
3. **approved** - User has accepted the quote
4. **rejected** - User has rejected the quote

## Error Handling

The system includes comprehensive error handling:
- Firebase connection errors
- Authentication errors
- Document not found errors
- Network connectivity issues
- Fallback to localStorage for offline functionality

## Real-time Features

- **Instant Notifications**: Toast messages when quotes are received
- **Live UI Updates**: Quotes tab updates automatically
- **Status Synchronization**: All connected devices see updates immediately
- **Offline Support**: Graceful degradation when Firebase is unavailable

## Next Steps

1. **Dealer Dashboard**: Create a separate interface for dealers to view and respond to quotes
2. **Email Notifications**: Add email alerts for quote updates
3. **Quote Expiration**: Implement automatic quote expiration
4. **Advanced Filtering**: Add filters for quote status, date, amount, etc.
5. **Quote History**: Maintain detailed history of all quote interactions

## Troubleshooting

### Common Issues:

1. **RFQ Manager not initialized**
   - Ensure Firebase is properly configured
   - Check browser console for initialization errors
   - Verify user is authenticated

2. **Real-time updates not working**
   - Check Firestore security rules
   - Verify user authentication
   - Check browser console for listener errors

3. **Quotes not displaying**
   - Check if user is logged in
   - Verify Firestore permissions
   - Check browser network tab for API errors

### Debug Commands:
```javascript
// Check if RFQ manager is available
console.log('RFQ Manager:', window.rfqManager);

// Check Firebase connection
console.log('Firebase Auth:', window.auth.currentUser);
console.log('Firestore:', window.db);

// Test quote loading
rfqManager.loadQuotes().then(quotes => console.log('Loaded quotes:', quotes));
```

## Security Considerations

1. **Authentication Required**: All operations require user authentication
2. **User Isolation**: Users can only access their own quotes
3. **Input Validation**: All user inputs are validated before saving
4. **Rate Limiting**: Consider implementing rate limiting for quote requests
5. **Data Sanitization**: User inputs are sanitized to prevent XSS attacks