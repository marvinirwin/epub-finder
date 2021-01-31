import {s3, inputConfig} from "./s3.service";
import fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import {S3UploadedFile} from "./s3-uploaded-file";
import {parse} from "path";

export class UploadToS3Service {
    public static async upload(path: string, isSandboxFile: boolean) {
        const content = await fs.promises.readFile(path);
        const uploadResult = await s3.upload(
            {
                Bucket: inputConfig.bucket,
                Key: uuidv4(),
                Body: content,
                ACL: 'public-read'
            }
        ).promise();
        return new S3UploadedFile(
            {
                originalname: `${parse(path).name}.${parse(path).ext}`,
                bucket: inputConfig.bucket,
                key: uploadResult.Key,
                location: inputConfig.region,
            },
            isSandboxFile
        ).output()
    }
}