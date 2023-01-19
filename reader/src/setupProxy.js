const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function(app) {
  app.use(
    "/login",
    createProxyMiddleware({
      target: `${process.env.SERVER_URL}`,
      changeOrigin: true,
      logLevel: "debug"
    })
  );
  app.use(
    "/languagetrainer-auth/*",
    createProxyMiddleware({
      target: `${process.env.SERVER_URL}`,
      changeOrigin: true,
      logLevel: "debug"
    })
  );
  app.use(
    "/keycloak/*",
    createProxyMiddleware({
      target: `${process.env.KEYCLOAK_URL}`,
      changeOrigin: true,
      logLevel: "debug"
    })
  );
  app.use(
    "/documents/*",
    createProxyMiddleware({
      target: `${process.env.SERVER_URL}`,
      changeOrigin: true,
      logLevel: "debug"
    })
  );
  app.use(
    "/translate/*",
    createProxyMiddleware({
      target: `${process.env.SERVER_URL}`,
      changeOrigin: true,
      logLevel: "info"
    })
  );
  app.use(
    "/api/",
    createProxyMiddleware({
      target: `${process.env.SERVER_URL}`,
      changeOrigin: true,
      logLevel: "info",
      pathRewrite: {'^/api' : ''}
    })
  );
};
