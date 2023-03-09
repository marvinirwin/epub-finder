const httpProxy = require('http-proxy');
const http = require('http');

// Create the proxy server
const proxy = httpProxy.createProxyServer();


proxy.on(
    'proxyReq',
    (proxyReq, req, res, options) => {
        // Add custom header to request
        proxyReq.setHeader('Host', req.headers.host);
        proxyReq.setHeader('X-Real-IP', req.socket.remoteAddress);
        proxyReq.setHeader('X-Forwarded-For', req.headers['x-forwarded-for'] || '');
        proxyReq.setHeader('X-Forwarded-Proto', req.headers['x-forwarded-proto'] || '');

    }
)

// Set up the server to handle requests
const server = http.createServer((req, res) => {
    // Proxy requests to /test to localhost:8080
    if (req.url.startsWith('/realms') || req.url.startsWith('/resources')) {
        proxy.web(req, res, { target: 'http://localhost:8080' });
    } else {
        // Otherwise, proxy requests to localhost:3001
        proxy.web(req, res, { target: 'http://localhost:3001' });
    }
});

// Start the server
server.listen(process.env.PORT || 8000);