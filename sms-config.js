// SMS API Configuration for OTP
// Follow these steps to enable real SMS OTP:

// OPTION 1: Fast2SMS (Free for India - Recommended)
// 1. Go to https://www.fast2sms.com/
// 2. Sign up and verify your account
// 3. Get your API key from Dashboard
// 4. Replace 'YOUR_FAST2SMS_API_KEY' in signup.html with your actual key
// 5. Test with Indian phone numbers (10 digits without +91)

// OPTION 2: Twilio (International - Paid)
// 1. Go to https://www.twilio.com/
// 2. Sign up and get Account SID, Auth Token, and Phone Number
// 3. Use this code in signup.html:

/*
function sendOTP(phone, otp) {
    const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
    const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
    const twilioPhone = 'YOUR_TWILIO_PHONE_NUMBER';
    
    fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `From=${twilioPhone}&To=+91${phone}&Body=Your StoneBeam-NH OTP is: ${otp}`
    })
    .then(response => response.json())
    .then(data => {
        if(data.sid) {
            showMsg(`OTP sent to ${phone}`, 'success');
        }
    })
    .catch(error => {
        console.error('SMS Error:', error);
        alert(`OTP: ${otp}\n(SMS service error)`);
    });
}
*/

// OPTION 3: MSG91 (India - Paid)
// 1. Go to https://msg91.com/
// 2. Sign up and get Auth Key and Template ID
// 3. Use this code in signup.html:

/*
function sendOTP(phone, otp) {
    const authKey = 'YOUR_MSG91_AUTH_KEY';
    const templateId = 'YOUR_TEMPLATE_ID';
    
    fetch(`https://api.msg91.com/api/v5/otp?authkey=${authKey}&template_id=${templateId}&mobile=91${phone}&otp=${otp}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if(data.type === 'success') {
            showMsg(`OTP sent to ${phone}`, 'success');
        }
    })
    .catch(error => {
        console.error('SMS Error:', error);
        alert(`OTP: ${otp}\n(SMS service error)`);
    });
}
*/

// IMPORTANT NOTES:
// - For production, NEVER expose API keys in frontend code
// - Use a backend server to handle SMS API calls
// - Store API keys in environment variables
// - Implement rate limiting to prevent abuse
// - Add OTP expiry time (currently not implemented)
