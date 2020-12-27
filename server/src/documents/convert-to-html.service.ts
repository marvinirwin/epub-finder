import CloudConvert from "cloudconvert";
import {downloadFile} from "./download-file.service";
import {join} from "path";
import {UploadedDocument} from "./uploaded-document";
import FormData from 'form-data';
import * as fs from "fs";
import axios from "axios";
import {Job} from "cloudconvert/built/JobsResource";
import {BucketConfig} from "./bucket-config.interface";

export const cloudConvert = new CloudConvert(process.env.CLOUD_CONVERT_API_KEY, true);

export async function convertToHtml({inputBucket, outputBucket, key, inputFormat}: {
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string,
    inputFormat: string
}) {
    const job = await conversionJob({inputBucket, outputBucket, inputFormat, key});
    try {
/*
        const uploadUrl = job.tasks.find(({name}) => name === 'import').result.form.url;
*/
/*
        await uploadFileToImportJob(u, uploadUrl);
*/
        await downloadJobResult(job);
    } catch (e) {
        debugger;console.log();
        await cloudConvert.jobs.delete(job.id);
    }
}

/*
const uploadFileToImportJob = async (u: UploadedDocument, uploadUrl) => {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(u.uploadedFilePath));

    const result = await axios.put(
        uploadUrl,
        formData,
        {
            headers: {
                Authorization: `Bearer: ${process.env.CLOUD_CONVERT_API_KEY}`
            }
        }
    );
    if (result.status !== 200) {
        throw new Error(`Error uploading file ${result.data}`)
    }
}
*/
const downloadJobResult = async (job: Job) => {
    console.log(`Waiting for job ${job.id} to finish`);
    const jobResult = await cloudConvert.jobs.wait(job.id)
    console.log(`job ${job.id} finished`);
    if (jobResult.status !== 'finished') {
        throw new Error("Job failed " + JSON.stringify(jobResult))
    }

}

async function conversionJob({inputFormat, inputBucket, outputBucket, key}:{
    inputFormat: string
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string
                             }) {
    console.log(`Starting job for ${key} going from ${inputFormat} to html`);
    const j = await cloudConvert
        .jobs
        .create({
            tasks: {
                import: {
                    operation: "import/s3",
                    key,
                    ...inputBucket
                },
                convertPdfToDocx: {
                    operation: "convert",
                    input: "import",
                    input_format: "pdf",
                    output_format: "docx",
                },
                convertDocxToHtml: {
                    operation: "convert",
                    input: "convertPdfToDocx",
                    input_format: "docx",
                    output_format: "html",
                },
                export: {
                    operation: 'export/s3',
                    input: "convertDocxToHtml",
                    ...outputBucket,
                    key: `${key}.html`,

                }
            }
        });
    console.log(`Job created for ${key} going from ${inputFormat} to html`);
    return j;
}

