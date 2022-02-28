import {join} from "path";
import {resolveExtFromResponseHeaders} from '../../../reader/src/lib/resolve-ext-from-response-headers';
import {getHashForString} from "../util/getHashForString";
import fs from "fs";
const fsPromises = fs.promises;
const fetch = require('node-fetch');

export const downloadSoundWithCache = async ({url, cacheDir, cachedFiles}: {url: string, cacheDir: string, cachedFiles: string[]}) => {
    const urlHash  = getHashForString(url);
    const foundCachedFile = cachedFiles.find(cachedFile => cachedFile.includes(urlHash));
    if (foundCachedFile) {
        return foundCachedFile;
    }

    const response = await fetch(url);
    console.log(response.headers.get('content-type'));
    const responseArrayBuffer = await response.arrayBuffer();
    const fileExtension = resolveExtFromResponseHeaders(response);

    const filePath = join(cacheDir, `${urlHash}.${fileExtension}`);
    await fsPromises.writeFile(filePath, Buffer.from(responseArrayBuffer));
    return filePath;
};

export const downloadTransliterationWithCache = () => {
  // The code for this can be extracted from
  // server/src/translate/transliterate.service.ts
}