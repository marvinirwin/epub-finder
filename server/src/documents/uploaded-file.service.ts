import {bucket, s3} from "./s3.service";
import {createHash} from "crypto";


export class UploadedFileService {
    /*
        private static replaceExtInPath(filepath: string, ext: string) {
            let name = parse(filepath).name;
            return join(dirname(filepath), `${name}.${ext}`);
        }
    */

    public static fileHash(key: string): Promise<string> {
        return new Promise(resolve => {
            console.log(`Hashing ${key}: getting read stream`)
            const readStream = s3.getObject({Bucket: bucket, Key: key}).createReadStream();
            console.log(`Hashing ${key}: got read stream`)
            const hash = createHash('sha1');
            hash.setEncoding('hex');
            readStream.on('end', () => {
                console.log(`Hashing ${key}: readStream ended`)
                hash.end();
                resolve(hash.read())
            });
            readStream.pipe(hash);
        })
    }
}