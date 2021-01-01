import CloudConvert from "cloudconvert";
import {Job} from "cloudconvert/built/JobsResource";
import {BucketConfig} from "./bucket-config.interface";

export const cloudConvert = new CloudConvert(process.env.CLOUD_CONVERT_API_KEY, !!process.env.CLOUD_CONVERT_USE_SANDBOX);

type ConversionParams = {
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string,
};

/*
let inputFormat1 = "pdf";
let outputFormat = "docx";
*/
export const conversionJob = (inputFormat, outputFormat, engine) => async ({inputBucket, outputBucket, key}: {
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string
}) => {
    console.log(`Starting job for ${key} going from ${inputFormat} to ${outputFormat}`);
    let outputKey = `${key}.${outputFormat}`;
    const job = await cloudConvert
        .jobs
        .create({
            tasks: {
                import: {
                    operation: "import/s3",
                    key,
                    ...inputBucket,
                },
                convert: {
                    operation: "convert",
                    input: ["import"],
                    input_format: inputFormat,
                    output_format: outputFormat,
                    engine
                },
                export: {
                    input: "convert",
                    operation: 'export/s3',
                    ...outputBucket,
                    key: outputKey,

                }
            },
        });
    console.log(`Job created for ${key} going from ${inputFormat} to ${outputFormat}`);

    console.log(`Waiting for job ${job.id} to finish`);
    const result = await cloudConvert.jobs.wait(job.id);
    if (result.status !== 'finished') {
        throw new Error(JSON.stringify(result.tasks.map(task => task.message), null, '\t'))
    }
    console.log(`job ${job.id} finished`);
    return {job, outputKey};
}

export async function convertPdfToHtml({inputBucket, outputBucket, key}: ConversionParams) {
    const {job: job1, outputKey} = await conversionJob("pdf", "docx", "bcl")
    ({inputBucket, outputBucket, key});
    const {job: job2} = await conversionJob("docx", "html", "office")
    ({inputBucket, outputBucket, key: outputKey});
}

