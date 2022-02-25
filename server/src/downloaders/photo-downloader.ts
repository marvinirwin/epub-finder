import http from "http";
import https from "https";
import Stream from "stream";
import fs from "fs";

export const downloadPhotoWithCache = ({url, cacheDir}: {url: string; cacheDir: string}) => {
    if (fs.existsSync(cacheDir)) return;

    const protocol = url.indexOf("https") === 0 ? https : http;
    protocol.request(url, (response) => {
        const data = new Stream.Transform();
        response.on("data", (chunk) => {
            data.push(chunk);
        });
        response.on("end", () => {
            fs.writeFileSync(cacheDir, data.read());
        });
    }).end();
};