import errorHandler from "errorhandler";
import initializedApp from "./app";
/**
 * Error Handler. Provides full stack - remove for production
 */
const server = initializedApp().then(app => {
    // @ts-ignore
    app.use(errorHandler());
    /**
     * Start Express server.
     */
    const port = 3001;
    try {
        const server = app.listen("3001", () => {
            console.log(
                "  App is running at http://localhost:%d in %s mode",
                port,
                app.get("env")
            );
            console.log("  Press CTRL-C to stop\n");
        });
    } catch(e) {
        console.error(e);
    }
})


export default server;
