import fs from "fs";
import {join} from "path";
import {downloadPhotoWithCache} from "./photo-downloader";

describe("Downloading an image file server side", () => {
  it("Downloads an image from a url and places it in the right directory", done => {
    const url = "http://www.google.com/images/srpr/logo11w.png";
    const fileName = "/test.png";
    const dir = join(__dirname, fileName);

    downloadPhotoWithCache({url, cacheDir:__dirname+fileName});
    setTimeout(() => {
      expect(fs.existsSync(dir)).toBeTruthy();
    }, 2000);
    done();
  });

  it("Doesn't download a new file if one is already cached", done => {
    // assuming a file called "test_existing.png" is already in the cache directory
    const url = "http://www.google.com/images/srpr/logo11w.png";
    const fileName = "/test_existing.png";
    const dir = join(__dirname, fileName);
    const numOfFiles = fs.readdirSync(__dirname).length;

    downloadPhotoWithCache({url, cacheDir:__dirname+fileName});
    setTimeout(() => {
      expect(fs.existsSync(dir)).toBeTruthy();
      expect(fs.readdirSync(__dirname).length).toBe(numOfFiles);
    }, 2000);
    done();
  });
});
