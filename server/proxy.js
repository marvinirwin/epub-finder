const httpProxy = require('http-proxy');
const http = require('http');

// Create the proxy server
const proxy = httpProxy.createProxyServer();

// Set up the server to handle requests
const server = http.createServer((req, res) => {
    // Proxy requests to /test to localhost:8080
    if (req.url.startsWith('/realms')) {
        proxy.web(req, res, { target: 'http://localhost:8080' });
    } else {
        // Otherwise, proxy requests to localhost:3001
        proxy.web(req, res, { target: 'http://localhost:3001' });
    }
});

// Start the server
server.listen(process.env.PORT || 8000);