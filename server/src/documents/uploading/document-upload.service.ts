import {parse} from "path";
import {copyS3WithExtension, inputConfig, outputConfig} from "./s3.service";
import {conversionJob, convertPdfToHtml} from "./convert-to-html.service";

export type UploadedFile = { originalname: string, bucket: string, key: string, location: string };

export const handleUploadedDocument = async (file: UploadedFile) => {
    const ext = parse(file.originalname).ext.replace('.', '');
    const key = file.key;
    console.log(`Uploaded ${file.originalname} to S3 ${key}`);
    const inputBucketOutputBucketKey = {
        inputBucket: inputConfig,
        outputBucket: outputConfig,
        key: key,
        filename: file.originalname
    };
    switch(ext) {
        case "html":
        case "pdf":
            return await convertPdfToHtml(inputBucketOutputBucketKey);
        case "docx":
            return await conversionJob( ["docx", "html"], file.originalname,
            ) (inputBucketOutputBucketKey);
        case "txt":
            return await conversionJob(
                ["txt", "html"],
                file.originalname,
            ) (inputBucketOutputBucketKey);
        default:
            throw new Error(`Unsupported file extension: ${ext}`);
    }
}