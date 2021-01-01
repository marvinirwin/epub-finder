import {BucketConfig} from "./bucket-config.interface";
import AWS from "aws-sdk";

const inputAccessKeyId = process.env.DOCUMENT_S3_ACCESS_KEY_ID;
const inputSecretAccessKey = process.env.DOCUMENT_S3_ACCESS_KEY_SECRET;
const converterOutputKeyId = process.env.DOCUMENT_CONVERTER_OUTPUT_S3_ACCESS_KEY_ID;
const converterOutputSecretKeyId = process.env.DOCUMENT_CONVERTER_OUTPUT_S3_ACCESS_KEY_SECRET;
const s3Region = process.env.DOCUMENT_S3_REGION;
export const bucket = process.env.DOCUMENT_S3_BUCKET as string;
export const s3 = new AWS.S3({
    accessKeyId: inputAccessKeyId,
    secretAccessKey: inputSecretAccessKey,
});
export const inputConfig: BucketConfig = {
    region: s3Region,
    access_key_id: inputAccessKeyId,
    secret_access_key: inputSecretAccessKey,
    bucket
}
export const outputConfig: BucketConfig = {
    region: s3Region,
    access_key_id: converterOutputKeyId,
    secret_access_key: converterOutputSecretKeyId,
    bucket
};

export function readStream(filename: string, reject: (reason?: any) => void) {
    return s3.getObject({Bucket: bucket, Key: filename})
        .on('error', e => reject(e))
        .createReadStream();
}


export async function copyS3WithExtension(file: { originalname: string; bucket: string; key: string; location: string }, ext: string) {
    await s3.copyObject({
        Bucket: inputConfig.bucket,
        CopySource: `/${file.bucket}/${file.key}`,
        Key: `${file.key}.${ext}`
    }).promise()
}