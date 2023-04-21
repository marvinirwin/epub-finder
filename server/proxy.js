const httpProxy = require('http-proxy');
const http = require('http');

// Create the proxy server
const proxy = httpProxy.createProxyServer();


/*
proxy.on(
    'proxyReq',
    (proxyReq, req, res, options) => {
    }
)
*/

// Set up the server to handle requests
const assumedProtocol = 'https';
const server = http.createServer((req, res) => {
    if (req.url.startsWith('/realms') || req.url.startsWith('/resources')) {
        proxy.web(
            req,
            res,
            {
                target: 'http://localhost:8080',
                changeOrigin: true,
                headers: {
                    Host: req.headers.host,
                    'X-Forwarded-For': req.connection.remoteAddress,
                    'X-Forwarded-Host': req.headers.host,
                    'X-Forwarded-Port': '443',
                    // TODO change these to use the actual req.protocl
                    'X-Forwarded-Proto': assumedProtocol,
                    'X-Forwarded-Scheme': assumedProtocol,
                    'X-Scheme': assumedProtocol,
                    'X-Original-Forwarded-For': req.headers['x-forwarded-for'] || '',
                    Proxy: ''
                }
            }
        );
    } else {
        // Otherwise, proxy requests to localhost:3001
        proxy.web(req, res, {target: 'http://localhost:3001'});
    }
});

// Start the server
server.listen(process.env.PORT || 8000);