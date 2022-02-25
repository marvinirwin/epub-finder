import fs from "fs";
import {join} from "path";

import {downloadSoundWithCache} from "./sound-downloader";

describe("Downloading a sound file server side", () => {
  it("Downloads sound from a url and places it in the right director", done => {
    const url = "";
    const fileName = "/test.wav";
    const dir = join(__dirname, fileName);

    downloadSoundWithCache({url, cacheDir:__dirname+fileName});
    setTimeout(() => {
      expect(fs.existsSync(dir)).toBeTruthy();
    }, 2000);
    done();
  });

  it("Downloads a sound of some text", () => {
    /**
     * The code for this can be taken from
     * server/src/translate/transliterate.service.ts, which does this already
     */
    // expect(fileExistsSync("The filename I want"))
  });
});