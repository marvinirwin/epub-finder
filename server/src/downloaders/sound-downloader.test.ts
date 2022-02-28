import fs from "fs";
import {downloadSoundWithCache} from "./sound-downloader";
import {getHashForString} from "../util/getHashForString";

const url = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
//const url = "https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav";
const urlHash  = getHashForString(url);
const numOfFiles = fs.readdirSync(__dirname).length;
const filePath = `${__dirname}\\${urlHash}.mp3`;

afterEach(() => {
  // deletes the downloaded test sound file after each test
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

describe("Downloading a sound file server side", () => {
  it("Downloads sound from a url and places it in the right directory", async () => {
    await downloadSoundWithCache({url, cacheDir: __dirname, cachedFiles: []});
    expect(fs.existsSync(filePath)).toBeTruthy();
    expect(fs.readdirSync(__dirname).length).toBe(numOfFiles+1);
  });

  it("Downloads a sound of some text", () => {
    /**
     * The code for this can be taken from
     * server/src/translate/transliterate.service.ts, which does this already
     */
    // expect(fileExistsSync("The filename I want"))
  });
});