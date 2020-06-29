import errorHandler from "errorhandler";

import app from "./app";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const port = 3001;
const server = app.listen("3001", () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        port,
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

export default server;
