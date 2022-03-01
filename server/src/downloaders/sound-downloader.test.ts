import fs from "fs";
import {downloadSoundWithCache} from "./sound-downloader";
import {getHashForString} from "../util/getHashForString";

const urlMp3 = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
const urlWav = "https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav";
const urlHashMp3  = getHashForString(urlMp3);
const urlHashWav  = getHashForString(urlWav);
const filePathMp3 = `${__dirname}\\${urlHashMp3}.mp3`;
const filePathWav = `${__dirname}\\${urlHashWav}.wav`;
const numOfFiles = fs.readdirSync(__dirname).length;

afterEach(() => {
  // deletes the downloaded test sound file(s) after each test
  if (fs.existsSync(filePathMp3)) fs.unlinkSync(filePathMp3);
  if (fs.existsSync(filePathWav)) fs.unlinkSync(filePathWav);
});

describe("Downloading a sound file server side", () => {
  it("Downloads sound (.wav) from a url and places it in the right directory", async () => {
    await downloadSoundWithCache({url: urlWav, cacheDir: __dirname, cachedFiles: []});
    expect(fs.existsSync(filePathWav)).toBeTruthy();
    expect(fs.readdirSync(__dirname).length).toBe(numOfFiles+1);
  });

  it("Downloads sound (.mp3) from a url and places it in the right directory", async () => {
    await downloadSoundWithCache({url: urlMp3, cacheDir: __dirname, cachedFiles: []});
    expect(fs.existsSync(filePathMp3)).toBeTruthy();
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