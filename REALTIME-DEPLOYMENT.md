# 🚀 Real-Time StoneBeam-NH Deployment Guide

Your web application now has **professional real-time capabilities** that work like modern web applications!

## 🌟 **What You Now Have**

### **Real-Time Features**
- ✅ **WebSocket Connections** - Instant bidirectional communication
- ✅ **Server-Sent Events (SSE)** - Reliable one-way updates
- ✅ **HTTP Polling Fallback** - Works on any network
- ✅ **Automatic Reconnection** - Handles network interruptions
- ✅ **Connection Status Indicator** - Visual feedback
- ✅ **Heartbeat System** - Keeps connections alive
- ✅ **Live Notifications** - Real-time alerts
- ✅ **Cross-Browser Support** - Works everywhere

## 🏗️ **Architecture Overview**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client Side    │     │   Server Side    │     │   Real-Time     │
│                │     │                │     │   Communication  │
│ • WebSocket     │◄──►│ • Express.js    │◄──►│ • WebSocket     │
│ • SSE          │     │ • HTTP Routes   │     │ • Server-Sent   │
│ • HTTP Polling  │     │ • WebSocket     │     │   Events         │
│ • Auto Reconnect│     │ • CORS Support   │     │ • JSON Messages  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 **Quick Start**

### **Option 1: Development Mode**
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

### **Option 2: Production Deployment**
```bash
# Install production dependencies
npm install --production

# Start with PM2 (process manager)
pm2 start server.js

# Or deploy to any cloud platform
# See deployment sections below
```

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file in your project root:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000
WS_MAX_RECONNECT_ATTEMPTS=5

# CORS Configuration
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Database (when implemented)
DB_CONNECTION_STRING=mongodb://localhost:27017/stonebeam
REDIS_URL=redis://localhost:6379
```

### **Client Configuration**
The client automatically detects the best connection method:

1. **WebSocket** (Priority 1) - Full duplex, lowest latency
2. **Server-Sent Events** (Priority 2) - Reliable, automatic reconnection
3. **HTTP Polling** (Fallback) - Universal compatibility

## 🌐 **Deployment Options**

### **1. Traditional Web Hosting**
```bash
# Upload to any web server
# Works with: Apache, Nginx, IIS, Caddy

# Example Nginx configuration:
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/stonebeam;
        try_files $uri $uri/ =404;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### **2. Cloud Platform Deployment**

#### **Vercel (Recommended)**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

Deploy:
```bash
npm i -g vercel
vercel deploy
```

#### **Netlify**
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=. --functions=server
```

#### **Heroku**
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
heroku create stonebeam-realtime
heroku config:set NODE_ENV=production
git push heroku main
```

#### **AWS EC2**
```bash
# Using PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "stonebeam-realtime"

# Monitor
pm2 monit

# Setup with systemd (Linux)
sudo systemctl enable stonebeam-realtime
sudo systemctl start stonebeam-realtime
```

#### **Google Cloud Platform**
```bash
# app.yaml for App Engine
runtime: nodejs18

env_variables:
  PORT: 8080
  NODE_ENV: production

automatic_scaling:
  min_instances: 1
  max_instances: 10

# Deploy
gcloud app deploy
```

#### **DigitalOcean**
```bash
# Using Docker
docker build -t stonebeam-realtime .
docker run -d -p 3000:3000 --name stonebeam stonebeam-realtime

# Or direct deployment
npm install -g pm2
pm2 start server.js --name stonebeam
```

## 🔌 **WebSocket Endpoints**

### **Client Connection**
```javascript
// Client automatically connects to:
const wsUrl = `ws://${window.location.host}/api/live-updates`;

// Messages are JSON objects:
{
  "type": "subscribe|heartbeat|userAction",
  "userId": "user-id",
  "channels": ["quotations", "orders", "messages"],
  "timestamp": 1234567890
}
```

### **Server Responses**
```javascript
// Real-time updates sent to clients:
{
  "type": "quotation|order|message|notification|system",
  "action": "new|updated|deleted",
  "data": { /* update data */ },
  "timestamp": 1234567890
}
```

## 📡 **Server-Sent Events**

### **Client Connection**
```javascript
const eventSource = new EventSource('/api/live-updates-sse');

// Automatic reconnection and event handling
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

### **Server Events**
```javascript
// Server sends:
event: connect
data: {"type": "connection", "timestamp": 1234567890}

event: heartbeat  
data: {"type": "heartbeat", "timestamp": 1234567890}

event: update
data: {"type": "quotation", "data": {...}, "timestamp": 1234567890}
```

## 🔄 **API Endpoints**

### **GET /api/updates**
```bash
curl "http://localhost:3000/api/updates?userId=user123&lastId=0"
```

Response:
```json
{
  "success": true,
  "updates": [
    {
      "id": 1,
      "type": "quotation",
      "action": "new",
      "data": {...},
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "lastId": 1
}
```

### **POST /api/user-action**
```bash
curl -X POST "http://localhost:3000/api/user-action" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "action": "quotationUpdate",
    "data": {"quotationId": "Q123", "status": "approved"}
  }'
```

## 🎯 **Usage Examples**

### **Client-Side**
```javascript
// Subscribe to real-time updates
realTimeUpdates.subscribe('quotationUpdate', (data) => {
  console.log('New quotation:', data);
  // Update UI automatically
});

// Send user action
realTimeUpdates.sendUserAction('approveQuotation', {
  quotationId: 'Q123',
  notes: 'Approved by client'
});

// Check connection status
const status = realTimeUpdates.getConnectionStatus();
console.log('Connected:', status.isConnected);
console.log('Type:', status.type);
```

### **Server-Side**
```javascript
// Broadcast to all users
broadcastToAll({
  type: 'system',
  message: 'Server maintenance in 5 minutes'
});

// Send to specific user
broadcastToUser('user123', {
  type: 'quotation',
  action: 'new',
  data: {
    contractorName: 'Elite Builders',
    amount: 500000
  }
});
```

## 🔧 **Advanced Features**

### **Connection Management**
- **Automatic reconnection** with exponential backoff
- **Connection pooling** for multiple tabs/windows
- **Graceful degradation** (WebSocket → SSE → Polling)
- **Heartbeat monitoring** to detect dead connections
- **Status indicators** in the UI

### **Performance Optimization**
- **Message batching** for high-frequency updates
- **Compression** for WebSocket messages
- **Caching** of frequently accessed data
- **Lazy loading** of update history

### **Security Features**
- **CORS configuration** for cross-origin requests
- **Rate limiting** on API endpoints
- **Input validation** for all user inputs
- **Connection authentication** (optional)

## 📊 **Monitoring & Debugging**

### **Client Debugging**
```javascript
// Enable debug mode
localStorage.setItem('debug-realtime', 'true');

// Monitor connection events
realTimeUpdates.subscribe('connectionChange', (status) => {
  console.log('Connection status:', status);
});

// View network activity
console.log('Network type:', navigator.connection.effectiveType);
```

### **Server Debugging**
```bash
# Enable debug logging
DEBUG=stonebeam:* npm start

# Monitor WebSocket connections
echo "Active connections:" && ss -tuln | grep :3000

# View real-time logs
tail -f logs/stonebeam.log
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **WebSocket Connection Fails**
```bash
# Check if port is open
telnet localhost 3000

# Verify WebSocket support
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://localhost:3000/api/live-updates
```

#### **SSE Not Working**
```bash
# Check CORS headers
curl -H "Accept: text/event-stream" \
     http://localhost:3000/api/live-updates-sse

# Verify Content-Type header
curl -I http://localhost:3000/api/live-updates-sse
```

#### **High Memory Usage**
```bash
# Monitor Node.js process
ps aux | grep node

# Check for memory leaks
node --inspect server.js
```

## 🎉 **Production Checklist**

- [ ] **Environment variables configured**
- [ ] **HTTPS certificates installed** (for production)
- [ ] **Firewall rules configured**
- [ ] **Load balancer setup** (for scaling)
- [ ] **Monitoring enabled**
- [ ] **Backup strategy implemented**
- [ ] **Error logging configured**
- [ ] **Performance testing completed**

---

**🚀 Your StoneBeam-NH application now has enterprise-grade real-time capabilities!**

**Features:**
- ⚡ **Instant WebSocket communication**
- 📡 **Reliable Server-Sent Events** 
- 🔄 **Automatic reconnection handling**
- 🌐 **Cross-browser compatibility**
- 📱 **Mobile-optimized connections**
- 🔔 **Real-time notifications**
- 📊 **Connection status monitoring**

**Deploy to any platform and enjoy real-time updates!** 🌟
