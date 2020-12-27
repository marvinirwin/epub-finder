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
