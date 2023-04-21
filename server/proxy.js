const httpProxy = require('http-proxy');
const http = require('http');
const net = require('net');

// Create the proxy server
const proxy = httpProxy.createProxyServer();

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
                    'X-Forwarded-Proto': assumedProtocol,
                    'X-Forwarded-Scheme': assumedProtocol,
                    'X-Scheme': assumedProtocol,
                    'X-Original-Forwarded-For': req.headers['x-forwarded-for'] || '',
                    Proxy: ''
                }
            }
        );
    } else {
        proxy.web(req, res, { target: 'http://localhost:3001' });
    }
});

function checkIfListening(host, port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(60000);
        socket.on('connect', () => {
            socket.end();
            resolve(true);
        }).on('timeout', () => {
            socket.destroy();
            resolve(false);
        }).on('error', (err) => {
            socket.destroy();
            resolve(false);
        }).connect(port, host);
    });
}

async function startServer() {
    const target1 = await checkIfListening('localhost', 8080);
    const target2 = await checkIfListening('localhost', 3001);

    if (target1 && target2) {
        server.listen(process.env.PORT || 8000, () => {
            console.log('Server started on port', process.env.PORT || 8000);
        });
    } else {
        console.error('One or both of the targets are not listening. Server not started.');
    }
}

startServer();
