// Downloads a file, fails silently :/
import fs from "fs-extra";
import http from "http";

export const downloadFile = (url, destFilename) =>
    new Promise((resolve) => {
            var file = fs.createWriteStream(destFilename);
            http.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close();
                    resolve()
                });
            });
        }
    )