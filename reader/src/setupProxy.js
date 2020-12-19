const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/login',
        createProxyMiddleware({
            target: 'http://localhost:3001',
            changeOrigin: true,
            logLevel: 'debug'
        })
    );
    app.use(
        '/auth/*',
        createProxyMiddleware({
            target: 'http://localhost:3001',
            changeOrigin: true,
            logLevel: 'debug'
        })
    );
    app.use(
        '/documents/*',
        createProxyMiddleware({
            target: 'http://localhost:3001',
            changeOrigin: true,
            logLevel: 'debug'
        })
    )
};