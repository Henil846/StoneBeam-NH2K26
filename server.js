const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Remove leading slash and resolve file path
    const filePath = path.join(__dirname, pathname.substring(1));
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Page Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #000; color: #fff; }
                        h1 { color: #a569bd; }
                        a { color: #a569bd; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The requested file <strong>${pathname}</strong> was not found.</p>
                    <p><a href="/">Go back to home</a></p>
                </body>
                </html>
            `);
            return;
        }
        
        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>500 - Server Error</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #000; color: #fff; }
                            h1 { color: #e74c3c; }
                            a { color: #a569bd; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <h1>500 - Server Error</h1>
                        <p>An error occurred while reading the file.</p>
                        <p><a href="/">Go back to home</a></p>
                    </body>
                    </html>
                `);
                return;
            }
            
            // Set appropriate headers
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 StoneBeam-NH Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🌐 Open your browser and navigate to: http://localhost:${PORT}`);
    console.log(`\n📋 Available pages:`);
    console.log(`   • Home: http://localhost:${PORT}`);
    console.log(`   • Login: http://localhost:${PORT}/login.html`);
    console.log(`   • Dealer Login: http://localhost:${PORT}/dealer-login.html`);
    console.log(`   • Request Quotations: http://localhost:${PORT}/request-quotations.html`);
    console.log(`   • View Quotations: http://localhost:${PORT}/view-quotations.html`);
    console.log(`   • Notification Demo: http://localhost:${PORT}/notification-demo.html`);
    console.log(`\n⚡ Press Ctrl+C to stop the server`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});