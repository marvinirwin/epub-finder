import {bucket, s3} from "./s3.service";
import {createHash} from "crypto";

const s3Exists = (s3: AWS.S3, Bucket: string, Key: string) => new Promise(resolve => {
    s3.headObject({Bucket, Key}, (err, data) => {
        resolve(!err)
    })
})

export class HashService {
    /*
        private static replaceExtInPath(filepath: string, ext: string) {
            let name = parse(filepath).name;
            return join(dirname(filepath), `${name}.${ext}`);
        }
    */

    public static hashS3(key: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const params = {Bucket: bucket, Key: key};
            if (!await s3Exists(s3, bucket, key)) {
                throw new Error(`Cannot find ${key}`);
            }
            const readStream = s3.getObject(params)
                .on('error', () => reject)
                .createReadStream();
            const hash = createHash('sha1');
            hash.setEncoding('hex');
            readStream.on('end', () => {
                hash.end();
                resolve(hash.read())
            });
            readStream.pipe(hash);
        })
    }
}