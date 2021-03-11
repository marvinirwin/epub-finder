import {config} from 'dotenv';
import {BucketConfig} from "../bucket-config.interface";
import AWS from "aws-sdk";
import * as stream from "stream";
import {v4 as uuidv4} from 'uuid';
config({path: '.env'});


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

const streamToString = stream => {
    const chunks = []
    return new Promise<string>((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
};

export function s3ReadStream(filename: string): Promise<stream.Readable> {
    return new Promise((resolve, reject) => {
        const o = s3.getObject({Bucket: bucket, Key: filename})
            .on('error', e => reject(e));
        resolve(o.createReadStream())
    })
};

export const getS3FileString = (filename: string) => s3ReadStream(filename).then(streamToString)


export async function copyS3WithExtension(file: { originalname: string; bucket: string; key: string; location: string }, ext: string) {
    await s3.copyObject({
        Bucket: inputConfig.bucket,
        CopySource: `/${file.bucket}/${file.key}`,
        Key: `${file.key}.${ext}`
    }).promise()
}

export const uploadToS3 = (content: Buffer) => s3.upload(
    {
        Bucket: inputConfig.bucket,
        Key: uuidv4(),
        Body: content,
        ACL: 'public-read'
    }
).promise();