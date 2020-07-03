import morgan from "morgan";
import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import path from "path";
import * as synthesisController from "./controllers/Speech";
import {getLocations, getTrendForLocation} from "./controllers/Twitter";
import {imageSearchFunc} from "./controllers/ImageSearch";
import {translateFunc} from "./controllers/Translate";

const app = express();

app.set("port", process.env.PORT || 3002);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.post("/translate", translateFunc);
app.post("/image-search", imageSearchFunc);
app.post("/trend-locations", getLocations);
app.post("/trends", getTrendForLocation);
app.post("/get-speech", synthesisController.TextToSpeech);
app.post("/speech-recognition-token", synthesisController.GetSpeechRecognitionToken);

export default app;
