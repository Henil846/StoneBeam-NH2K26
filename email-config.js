// Email Notification Setup Guide
// Follow these steps to enable email notifications to dealers:

// OPTION 1: EmailJS (Recommended - Free & Easy)
// 1. Go to https://www.emailjs.com/
// 2. Sign up for free account
// 3. Add email service (Gmail, Outlook, etc.)
// 4. Create email template with these variables:
//    - {{to_email}}
//    - {{subject}}
//    - {{message}}
// 5. Get your credentials from dashboard:
//    - Service ID
//    - Template ID
//    - Public Key
// 6. Replace in new-project.js:
//    const serviceID = 'YOUR_EMAILJS_SERVICE_ID';
//    const templateID = 'YOUR_EMAILJS_TEMPLATE_ID';
//    const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';

// OPTION 2: SendGrid API (Professional - Paid)
// Replace sendEmail function in new-project.js with:
/*
function sendEmail(to, subject, body) {
    const apiKey = 'YOUR_SENDGRID_API_KEY';
    
    fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{to: [{email: to}]}],
            from: {email: 'noreply@stonebeam-nh.com'},
            subject: subject,
            content: [{type: 'text/plain', value: body}]
        })
    });
}
*/

// OPTION 3: Mailgun API (Professional - Paid)
// Replace sendEmail function in new-project.js with:
/*
function sendEmail(to, subject, body) {
    const apiKey = 'YOUR_MAILGUN_API_KEY';
    const domain = 'YOUR_MAILGUN_DOMAIN';
    
    const formData = new FormData();
    formData.append('from', 'StoneBeam-NH <noreply@' + domain + '>');
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', body);
    
    fetch('https://api.mailgun.net/v3/' + domain + '/messages', {
        method: 'POST',
        headers: {'Authorization': 'Basic ' + btoa('api:' + apiKey)},
        body: formData
    });
}
*/

// IMPORTANT NOTES:
// - For production, use backend server to send emails (don't expose API keys in frontend)
// - Current implementation sends to ALL registered dealers
// - Emails are sent asynchronously (won't block project creation)
// - Check browser console for email send status
