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
        key: key
    };
    switch(ext) {
        case "html":
            break;
        case "pdf":
            await convertPdfToHtml(inputBucketOutputBucketKey);
            break;
        case "docx":
            await conversionJob(
                "docx",
                "html",
                "office"
            ) (inputBucketOutputBucketKey);
            break;
        case "txt":
            await conversionJob("txt", "html", "libreoffice") (inputBucketOutputBucketKey);
            break;
        default:
            throw new Error(`Unsupported file extension: ${ext}`);
    }
}