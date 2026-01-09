# StoneBeam-NH Construction Management Web Application

A comprehensive web application for construction project management, quotation requests, and contractor-client interactions.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 12 or higher) - Download from [nodejs.org](https://nodejs.org/)

### Running the Application

#### Option 1: Using the Batch File (Windows)
1. Double-click `start-web-server.bat`
2. The server will start automatically
3. Open your browser and go to `http://localhost:3000`

#### Option 2: Using Command Line
1. Open Command Prompt or PowerShell
2. Navigate to the project folder:
   ```cmd
   cd "C:\Users\praja\OneDrive\New folder\StartUp"
   ```
3. Start the server:
   ```cmd
   node server.js
   ```
4. Open your browser and go to `http://localhost:3000`

## 📱 Features

### For Users
- **Project Creation**: Create new construction projects
- **Quotation Requests**: Request quotes from verified contractors
- **Real-time Notifications**: Get notified when dealers respond
- **Quote Management**: Accept or reject received quotations
- **Profile Management**: Manage your user profile and preferences

### For Dealers/Contractors
- **Dashboard**: View all quotation requests
- **Quote Submission**: Submit competitive quotes for projects
- **Notification System**: Get notified of new requests and quote responses
- **Profile Management**: Manage business profile and credentials

### Key Pages
- **Home** (`/`) - Main landing page
- **Login** (`/login.html`) - User authentication
- **Dealer Login** (`/dealer-login.html`) - Contractor authentication
- **Request Quotations** (`/request-quotations.html`) - Submit quotation requests
- **View Quotations** (`/view-quotations.html`) - Manage received quotes
- **Dealer Dashboard** (`/dealer-dashboard.html`) - Contractor workspace
- **Notification Demo** (`/notification-demo.html`) - Test notification system

## 🔧 Technical Features

### Notification System
- Real-time notifications between users and dealers
- Visual notification bell with unread count
- Toast notifications for immediate feedback
- Persistent notification storage

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Cross-browser compatibility

### Data Storage
- Local storage for demo purposes
- Firebase integration ready
- Session management

## 🎯 How to Use

### As a User:
1. Visit the home page
2. Select "User" when prompted
3. Create an account or login
4. Create a new project or request quotations
5. Receive notifications when dealers respond
6. Accept or reject quotations

### As a Dealer:
1. Visit the home page
2. Select "Dealer" when prompted
3. Create a dealer account or login
4. View available quotation requests
5. Submit competitive quotes
6. Get notified when quotes are accepted/rejected

## 🛠️ Development

### File Structure
```
StartUp/
├── index.html              # Main landing page
├── server.js               # Web server
├── notification-system.js  # Notification functionality
├── index-simple.js        # Main page logic
├── index.css              # Main stylesheet
├── firebase.js            # Firebase configuration
├── request-quotations.html # Quote request form
├── view-quotations.html   # Quote management
├── dealer-dashboard.html  # Dealer workspace
└── notification-demo.html # Notification testing
```

### Adding New Features
1. Create new HTML files for pages
2. Add corresponding JavaScript files
3. Update navigation in existing pages
4. Test with the notification system

## 🔒 Security Notes
- This is a demo application using local storage
- For production, implement proper authentication
- Use HTTPS in production environment
- Validate all user inputs server-side

## 📞 Support
For issues or questions about the application, check the notification demo page to test functionality.

## 🚀 Deployment
For production deployment:
1. Set up a proper web server (Apache, Nginx)
2. Configure Firebase for real-time data
3. Implement proper authentication
4. Set up SSL certificates
5. Configure domain and DNS

---

**StoneBeam-NH** - Building Your Vision, Brick By Brick