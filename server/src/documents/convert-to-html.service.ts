import CloudConvert from "cloudconvert";
import {downloadFile} from "./download-file.service";
import {join} from "path";
import {UploadedDocument} from "./uploaded-document";
import FormData from 'form-data';
import * as fs from "fs";
import axios from "axios";
import {Job} from "cloudconvert/built/JobsResource";
import {BucketConfig} from "./bucket-config.interface";

export const cloudConvert = new CloudConvert(process.env.CLOUD_CONVERT_API_KEY);

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
    const jobResult = await cloudConvert.jobs.wait(job.id)
    if (jobResult.status !== 'finished') {
        throw new Error("Job failed " + JSON.stringify(jobResult))
    }

/*
    const {filename, url} = jobResult
        .tasks
        .find(({name}) => name === 'export')
        .result
        .files[0];

    await downloadFile(url, join(process.env.UPLOADED_FILE_DIRECTORY, filename))
*/
}

async function conversionJob({inputFormat, inputBucket, outputBucket, key}:{
    inputFormat: string
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string
                             }) {
    return await cloudConvert
        .jobs
        .create({
            tasks: {
                import: {
                    operation: "import/s3",
                    key,
                    ...inputBucket
                },
                convert: {
                    operation: "convert",
                    input: "import",
                    input_format: inputFormat,
                    output_format: "html",
                },
                export: {
                    input: "convert",
                    operation: 'export/s3',
                    ...outputBucket,
                    key: `${key}.html`,

                }
            }
        });
}

