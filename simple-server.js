/**
 * Simple Real-Time Updates Server
 * StoneBeam-NH Construction Management
 * Works with built-in Node.js modules only
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Store active connections
const connections = new Map();

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle different routes
    if (pathname === '/api/live-updates-sse') {
        handleSSEConnection(req, res);
    } else if (pathname === '/api/updates') {
        handleRESTUpdates(req, res);
    } else if (pathname === '/api/user-action') {
        handleUserAction(req, res);
    } else if (pathname === '/api/status') {
        handleStatus(req, res);
    } else {
        // Serve static files
        serveStaticFile(req, res, pathname);
    }
});

// Handle Server-Sent Events
function handleSSEConnection(req, res) {
    console.log('📡 New SSE connection');

    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial connection event
    res.write('event: connect\\n');
    res.write(`data: ${JSON.stringify({
        type: 'connection',
        timestamp: Date.now(),
        message: 'Connected to real-time updates'
    })}\\n\\n`);

    // Simulate real-time updates every 5 seconds
    const updateInterval = setInterval(() => {
        const update = generateRandomUpdate();
        res.write('event: update\\n');
        res.write(`data: ${JSON.stringify(update)}\\n\\n`);
        console.log('📨 Sent update:', update.type);
    }, 5000);

    // Clean up on disconnect
    req.on('close', () => {
        clearInterval(updateInterval);
        console.log('📡 SSE connection closed');
    });
}

// Handle REST API for updates
function handleRESTUpdates(req, res) {
    const userId = req.query.userId || 'anonymous';
    const lastId = parseInt(req.query.lastId) || 0;

    try {
        // Get updates from "database" (mock data for demo)
        const updates = getUpdatesForUser(userId, lastId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            updates: updates,
            lastId: updates.length > 0 ? Math.max(...updates.map(u => u.id)) : lastId,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('❌ Error getting updates:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Failed to get updates'
        }));
    }
}

// Handle user actions
function handleUserAction(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            console.log('🎯 User action received:', data);

            // Process the action
            const result = processUserAction(data);

            // Broadcast result to all connected users
            broadcastToAll({
                type: 'actionResult',
                action: data.action,
                result: result,
                timestamp: Date.now()
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                result: result
            }));
        } catch (error) {
            console.error('❌ Error processing user action:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Failed to process action'
            }));
        }
    });
}

// Handle status requests
function handleStatus(req, res) {
    const status = {
        connectedClients: connections.size,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: Date.now()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
}

// Serve static files
function serveStaticFile(req, res, pathname) {
    const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        const ext = path.extname(filePath);
        const contentType = getContentType(ext);

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Get content type based on file extension
function getContentType(ext) {
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon'
    };
    return types[ext] || 'text/plain';
}

// Mock database functions
function getUpdatesForUser(userId, lastId) {
    // Mock data for demonstration
    const mockUpdates = [
        {
            id: 1,
            type: 'quotation',
            action: 'new',
            data: {
                contractorName: 'Elite Builders',
                projectTitle: 'Kitchen Renovation',
                amount: '₹5,00,000'
            },
            timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 2,
            type: 'order',
            action: 'updated',
            data: {
                orderId: 'ORD-001',
                status: 'In Progress'
            },
            timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
            id: 3,
            type: 'notification',
            action: 'new',
            data: {
                title: 'System Update',
                message: 'New features available'
            },
            timestamp: new Date(Date.now() - 900000).toISOString()
        }
    ];

    return mockUpdates.filter(update => update.id > lastId);
}

function processUserAction(data) {
    console.log('⚙️ Processing user action:', data);

    // Mock processing
    return {
        success: true,
        processed: true,
        data: data.data,
        timestamp: Date.now()
    };
}

// Broadcast to all connected clients (for SSE)
function broadcastToAll(message) {
    console.log('📨 Broadcasting to all clients:', message.type);

    // In a real WebSocket implementation, this would broadcast to all WebSocket clients
    // For SSE, clients need to reconnect to get new messages
    console.log('Message broadcasted:', JSON.stringify(message));
    // Handle WebSocket upgrade (for future WebSocket support)
    server.on('upgrade', (request, socket, head) => {
        console.log('🔌 WebSocket upgrade requested');

        // Simple WebSocket handling without ws module
        // This is a basic implementation - for production, use the ws module
        const res = socket;
        res.writeHead(101, {
            'Upgrade': 'websocket',
            'Connection': 'Upgrade',
            'Sec-WebSocket-Accept': request.headers['sec-websocket-key']
        });

        res.end('WebSocket upgrade not implemented in this simple version');
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 StoneBeam-NH Real-Time Server running on port ${PORT}`);
        console.log(`📡 SSE: http://localhost:${PORT}/api/live-updates-sse`);
        console.log(`🌐 HTTP: http://localhost:${PORT}`);
        console.log(`📁 Static files: http://localhost:${PORT}/`);
        console.log('');
        console.log('🌟 Real-Time Features Available:');
        console.log('  ✅ Server-Sent Events (SSE)');
        console.log('  ✅ REST API endpoints');
        console.log('  ✅ Static file serving');
        console.log('  ✅ CORS support');
        console.log('  ✅ Real-time updates every 5 seconds');
        console.log('');
        console.log('📱 Open your browser and navigate to: http://localhost:3000');
        console.log('📡 SSE endpoint: http://localhost:3000/api/live-updates-sse');
        console.log('🔗 Status endpoint: http://localhost:3000/api/status');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Server shutting down gracefully');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('🛑 Server shutting down via Ctrl+C');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
