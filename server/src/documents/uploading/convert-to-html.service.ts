import CloudConvert from "cloudconvert";
import {v4 as uuidv4} from 'uuid';
import {BucketConfig} from "../bucket-config.interface";
import {FinishedConversion} from "./finished-conversion";

export const cloudConvert = new CloudConvert(process.env.CLOUD_CONVERT_API_KEY, !!process.env.CLOUD_CONVERT_USE_SANDBOX);

type ConversionParams = {
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string,
    filename: string
};

/*
let inputFormat1 = "pdf";
let outputFormat = "docx";
*/
export const conversionJob = (
    formatChain: [
        string,
        string,
        ...string[]
    ],
    filename,
) => async ({outputBucket, key}: {
    outputBucket: BucketConfig,
    key: string
}) => {
    console.log(`Starting job for ${key} traversing ${formatChain.join(' -> ')}`);
    const outputKey = `${key}.${formatChain[formatChain.length - 1]}`;
    const convert = {};
    let lastInputKey = 'import';
    for (let i = 0; i < formatChain.length - 1; i++) {
        const inputFormat = formatChain[i];
        const convertOperationKey = `convert_${i}`;
        const outputFormat = formatChain[i + 1];
        const convertOperation = {
            operation: "convert",
            input: lastInputKey,
            input_format: inputFormat,
            output_format: outputFormat,
        };
        convert[convertOperationKey] = convertOperation;
        if (convertOperation.output_format === 'html') {
            convertOperation["embed_images"] = true;
        }
        lastInputKey = convertOperationKey;
    }
    let data = {
        tasks: {
            import: {
                operation: "import/url",
                filename,
                url: `https://languagetrainer-documents.s3-us-west-2.amazonaws.com/${key}`,
            },
            ...convert,
            export: {
                input: lastInputKey,
                operation: 'export/s3',
                ...outputBucket,
                key: uuidv4(),
            }
        },
    };
    console.log(JSON.stringify(data, null, '\t'));
    const job = await cloudConvert
        .jobs
        // @ts-ignore
        .create(data);

    console.log(`Waiting for job ${job.id} to finish`);
    const result = await cloudConvert.jobs.wait(job.id);
    if (result.status !== 'finished') {
        throw new Error(JSON.stringify(result.tasks.map(task => task.message), null, '\t'))
    }
    console.log(`job ${job.id} finished`);
    return new FinishedConversion(result);
}

export async function convertPdfToHtml({inputBucket, outputBucket, key, filename}: ConversionParams) {
    return conversionJob(["pdf", "docx", "html"], filename)
    ({ outputBucket, key});
}


