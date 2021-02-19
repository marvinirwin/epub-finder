import {inputConfig, uploadToS3} from "./s3.service";
import fs from 'fs';
import {S3UploadedFile} from "./s3-uploaded-file";
import {parse} from "path";

export class UploadToS3Service {
    public static async upload(path: string, isSandboxFile: boolean) {
        const content = await fs.promises.readFile(path);
        const uploadResult = await uploadToS3(content);
        return new S3UploadedFile(
            {
                originalname: `${parse(path).name}${parse(path).ext}`,
                bucket: inputConfig.bucket,
                key: uploadResult.Key,
                location: inputConfig.region,
            },
            isSandboxFile
        ).output()
    }
}