import dotenv from "dotenv";

dotenv.config({path: ".env"});
import morgan from "morgan";
import logger from "morgan";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import path from "path";
import * as synthesisController from "./controllers/Speech";
import {imageSearchFunc} from "./controllers/ImageSearch";
import {translateFunc} from "./controllers/Translate";
import flash from "express-flash";
import passport from "passport";
import expressStatusMonitor from "express-status-monitor";
import sass from "node-sass-middleware";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";
import {isAuthenticated, isAuthorized, usePassportStrategies} from "./config/passport";
import {Connection, createConnection, Repository} from "typeorm";
import DatabaseConfig from "./config/database.config"
import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";
import {JsonCache} from "./entities/JsonCache";
import {User} from "./entities/User";
import {UsageEvent} from "./entities/UsageEvent";
import {VisitorLog} from "./entities/VisitorLog";
import {all} from "async";
import {userInfo} from "os";
import session from 'express-session';
import {Session} from "./entities/Session";
import {TypeormStore} from "typeorm-store";
import AnonymousUsers from 'config/anonymous-users';

export class Repositories {
    jsonCache: Repository<JsonCache>;
    session: Repository<Session>;
    user: Repository<User>;
    usageEvent: Repository<UsageEvent>;
    private visitorLog: Repository<VisitorLog>;
    constructor(public connection: Connection) {
        this.jsonCache = connection.getRepository(JsonCache);
        this.usageEvent = connection.getRepository(UsageEvent);
        this.user = connection.getRepository(User);
        this.visitorLog = connection.getRepository(VisitorLog);
        this.session = connection.getRepository(Session);
    }
}

function ip(req) {
    return req.headers['x-forwarded-for'] || req?.connection?.remoteAddress;
}

/*
// @ts-ignore
const upload = Multer.diskStorage({ dest: path.join(__dirname, "uploads") });
*/
async function connectedApp() {
    const app = express();
    const connection = await createConnection(DatabaseConfig as MysqlConnectionOptions);
    const repositories = new Repositories(connection);
    usePassportStrategies(repositories);
    app.set("port", process.env.SERVER_PORT || 3002);
    app.set("views", path.join(__dirname, "../views"));
    app.set("view engine", "pug");
    // @ts-ignore
    app.use(compression());
    // @ts-ignore
    app.use(bodyParser.json());
    // @ts-ignore
    app.use(bodyParser.urlencoded({extended: true}));
    // @ts-ignore
    app.use(morgan("combined"));
    /*
    app.use(lusca.xframe("SAMEORIGIN"));
    app.use(lusca.xssProtection(true));
    */
    app.use((req, res, next) => {
        res.locals.user = req.user;
        next();
    });

    /**
     * Express configuration.
     */
    app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "pug");
    // @ts-ignore
    app.use(expressStatusMonitor());
    // @ts-ignore
    app.use(compression());
    // @ts-ignore
    app.use(sass({
        src: path.join(__dirname, "public"),
        dest: path.join(__dirname, "public")
    }));
    // @ts-ignore
    app.use(logger("dev"));
    // @ts-ignore
    app.use(bodyParser.urlencoded({extended: true}));
    app.disable("x-powered-by");
    // @ts-ignore
    app.use(session({
        secret: 'shhhhhh',
        resave: false,
        saveUninitialized: false,
        store: new TypeormStore({repository: repositories.session})
    }))
// @ts-ignore
    /*
        app.use(session({
            resave: true,
            saveUninitialized: true,
            // What is the session_secret?
            // @ts-ignore
            secret: process.env.SESSION_SECRET,
            cookie: {maxAge: 1209600000}, // two weeks in milliseconds
            // @ts-ignore
            store: new TypeormStore({
                cleanupLimit: 2,
                limitSubquery: false, // If using MariaDB.
                ttl: 86400
            }).connect(connection.getRepository(Session)),
        }));
    */
    // This wont work because of (this)
    app.use(AnonymousUsers(repositories).assignAnonymousUser);
    app.use(async (req, res, next) => {
        const l = new VisitorLog();
        // @ts-ignore
        l.ip = ip(req);
        await visitRepo.save(l);
    });
    app.use(passport.initialize());
    app.use(passport.session());
    /*
    app.use((req, res, next) => {
        if (req.path === "/api/upload") {
            // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
            next();
        } else {
            lusca.csrf()(req, res, next);
        }
    });
    */
    /*
    app.use(lusca.xframe("SAMEORIGIN"));
    app.use(lusca.xssProtection(true));
    */
    app.use((req, res, next) => {
        res.locals.user = req.user;
        next();
    });
    /*
    app.use((req, res, next) => {
        // After successful login, redirect back to the intended page
        if (!req.user
            && req.path !== "/login"
            && req.path !== "/signup"
            && !req.path.match(/^\/auth/)
            && !req.path.match(/\./)) {
            // @ts-ignore
            req.session.returnTo = req.originalUrl;
        } else if (req.user
            && (req.path === "/account" || req.path.match(/^\/api/))) {
            // @ts-ignore
            req.session.returnTo = req.originalUrl;
        }
        next();
    });
    */
    app.use("/", express.static(path.join(__dirname, "public"), {maxAge: 31557600000}));
    app.use("/video", express.static('public/video'));
    app.post("/login", userController.postLogin);
    app.get("/logout", userController.logout);
    /*
        app.get("/reset/:token", userController.getReset);
    */
    /*
        app.post("/reset/:token", userController.postReset);
    */
    app.post("/signup", userController.postSignup);
    app.post("/contact", contactController.postContact);
    /*
        app.get("/account/verify", passportConfig.isAuthenticated, userController.getVerifyEmail);
        app.get("/account/verify/:token", passportConfig.isAuthenticated, userController.getVerifyEmailToken);
        app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
        app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
        app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
        app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
        app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);
    */
    app.get("/profile", isAuthenticated, userController.getProfile);
    /**
     * API examples routes.
     */
    app.get("/api", apiController.getApi);
    /**
     * OAuth authentication routes. (Sign in)
     */
    app.get("/auth/instagram", passport.authenticate("instagram", {scope: ["basic", "public_content"]}));
    app.get("/auth/instagram/callback", passport.authenticate("instagram", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/snapchat", passport.authenticate("snapchat"));
    app.get("/auth/snapchat/callback", passport.authenticate("snapchat", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/facebook", passport.authenticate("facebook", {scope: ["email", "public_profile"]}));
    app.get("/auth/facebook/callback", passport.authenticate("facebook", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/github", passport.authenticate("github"));
    app.get("/auth/github/callback", passport.authenticate("github", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/google", passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets.readonly"],
        accessType: "offline",
        prompt: "consent"
    }));
    app.get("/auth/google/callback", passport.authenticate("google", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/twitter", passport.authenticate("twitter"));
    app.get("/auth/twitter/callback", passport.authenticate("twitter", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/linkedin", passport.authenticate("linkedin", {state: "SOME STATE"}));
    app.get("/auth/linkedin/callback", passport.authenticate("linkedin", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });
    app.get("/auth/twitch", passport.authenticate("twitch", {}));
    app.get("/auth/twitch/callback", passport.authenticate("twitch", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo || "/");
    });

    /**
     * OAuth authorization routes. (API examples)
     */
    app.get("/auth/foursquare", passport.authorize("foursquare"));
    app.get("/auth/foursquare/callback", passport.authorize("foursquare", {failureRedirect: "/api"}), (req, res) => {
        res.redirect("/api/foursquare");
    });
    app.get("/auth/tumblr", passport.authorize("tumblr"));
    app.get("/auth/tumblr/callback", passport.authorize("tumblr", {failureRedirect: "/api"}), (req, res) => {
        res.redirect("/api/tumblr");
    });
    app.get("/auth/steam", passport.authorize("openid", {state: "SOME STATE"}));
    app.get("/auth/steam/callback", passport.authorize("openid", {failureRedirect: "/api"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo);
    });
    app.get("/auth/pinterest", passport.authorize("pinterest", {scope: "read_public write_public"}));
    app.get("/auth/pinterest/callback", passport.authorize("pinterest", {failureRedirect: "/login"}), (req, res) => {
        res.redirect("/api/pinterest");
    });
    app.get("/auth/quickbooks", passport.authorize("quickbooks", {
        scope: ["com.intuit.quickbooks.accounting"],
        state: "SOME STATE"
    }));
    app.get("/auth/quickbooks/callback", passport.authorize("quickbooks", {failureRedirect: "/login"}), (req, res) => {
        // @ts-ignore
        res.redirect(req.session.returnTo);
    });

    app.get("/login-options", (req, res) => {
        // Send back all supported auth strategies
        res.send(
            {
                "google": "/auth/google",
                "github": "/auth/github",
                "twitter": "/auth/twitter",
                "local": "/auth/local"
            },
        )
    });

    app.post("/auth/local", passport.authorize('local'));

    app.post("/translate", /*passportConfig.isAuthenticated, enforceBudget,*/ translateFunc(cacheRepo, usageRepo));
    app.post("/image-search", /*passportConfig.isAuthenticated, enforceBudget,*/ imageSearchFunc(cacheRepo));
    app.post("/get-speech", /*passportConfig.isAuthenticated, enforceBudget,*/ synthesisController.TextToSpeech);
    app.post("/speech-recognition-token", /*passportConfig.isAuthenticated, enforceBudget,*/ synthesisController.GetSpeechRecognitionToken);

    return app;
}

/*
app.get("/api/lastfm", apiController.getLastfm);
app.get("/api/nyt", apiController.getNewYorkTimes);
app.get("/api/steam", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get("/api/stripe", apiController.getStripe);
app.post("/api/stripe", apiController.postStripe);
app.get("/api/scraping", apiController.getScraping);
app.get("/api/twilio", apiController.getTwilio);
app.post("/api/twilio", apiController.postTwilio);
app.get("/api/clockwork", apiController.getClockwork);
app.post("/api/clockwork", apiController.postClockwork);
app.get("/api/foursquare", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get("/api/tumblr", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get("/api/github", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get("/api/twitter", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post("/api/twitter", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get("/api/twitch", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitch);
app.get("/api/instagram", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get("/api/paypal", apiController.getPayPal);
app.get("/api/paypal/success", apiController.getPayPalSuccess);
app.get("/api/paypal/cancel", apiController.getPayPalCancel);
app.get("/api/lob", apiController.getLob);
app.get("/api/upload", lusca({ csrf: true }), apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), lusca({ csrf: true }), apiController.postFileUpload);
app.get("/api/pinterest", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post("/api/pinterest", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get("/api/here-maps", apiController.getHereMaps);
app.get("/api/google-maps", apiController.getGoogleMaps);
app.get("/api/google/drive", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleDrive);
app.get("/api/chart", apiController.getChart);
app.get("/api/google/sheets", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleSheets);
app.get("/api/quickbooks", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getQuickbooks);
*/
export default connectedApp;
