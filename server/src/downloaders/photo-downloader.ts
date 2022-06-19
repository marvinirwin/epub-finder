import {join} from 'path';
import {getHashForString} from "../util/getHashForString";
import fs from "fs";
import { resolveExtFromResponseHeaders } from "../shared/resolve-ext-from-reponse-headers";
const fsPromises = fs.promises;
const fetch = require('node-fetch');

export const downloadPhotoWithCache = async ({url, cacheDir, cachedFiles}:{url: string, cacheDir: string, cachedFiles: string[]}) => {
    const urlHash  = getHashForString(url);
    const foundCachedFile = cachedFiles.find(cachedFile => cachedFile.includes(urlHash));
    if (foundCachedFile) {
        return foundCachedFile;
    }

    const response = await fetch(url);
    const responseArrayBuffer = await response.arrayBuffer();
    const fileExtension = resolveExtFromResponseHeaders(response);

    const filePath = join(cacheDir, `${urlHash}.${fileExtension}`);
    await fsPromises.writeFile(filePath, Buffer.from(responseArrayBuffer));
    return filePath;
};