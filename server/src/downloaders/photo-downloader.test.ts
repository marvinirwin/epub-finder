jest.setTimeout(30000);

import fs from "fs";
import {downloadPhotoWithCache} from "./photo-downloader";
import {getHashForString} from "../util/getHashForString";

const url = "http://www.google.com/images/srpr/logo11w.png";
const urlHash  = getHashForString(url);
const numOfFiles = fs.readdirSync(__dirname).length;
const filePath = `${__dirname}\\${urlHash}.png`;

afterEach(() => {
  // deletes the downloaded test image after each test
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

describe("Downloading an image file server side", () => {
  it("Downloads an image from a url and places it in the right directory", async() => {
    await downloadPhotoWithCache({url, cacheDir: __dirname, cachedFiles: []});
    expect(fs.existsSync(filePath)).toBeTruthy();
    expect(fs.readdirSync(__dirname).length).toBe(numOfFiles+1);
  });

  it("Doesn't download a new file if one is already cached", async () => {
    const cachedFiles = [urlHash];
    await downloadPhotoWithCache({url, cacheDir: __dirname, cachedFiles});
    expect(fs.existsSync(filePath)).toBeFalsy();
    expect(fs.readdirSync(__dirname).length).toBe(numOfFiles);
    expect(cachedFiles.length).toBe(1);
    expect(cachedFiles[0]).toBe(urlHash);
  });
});
