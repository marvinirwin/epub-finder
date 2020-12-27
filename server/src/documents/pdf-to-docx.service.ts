import {BucketConfig} from "./bucket-config.interface";
import {cloudConvert} from "./convert-to-html.service";

/*
let inputFormat1 = "pdf";
let outputFormat = "docx";
*/
export const conversionJob = (inputFormat1, outputFormat) => async ({inputBucket, outputBucket, key}: {
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string
}) => {
    console.log(`Starting job for ${key} going from ${inputFormat1} to html`);
    let outputKey = `${key}.${outputFormat}`;
    const job = await cloudConvert
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
                    input_format: inputFormat1,
                    output_format: outputFormat,
                },
                export: {
                    input: "convert",
                    operation: 'export/s3',
                    ...outputBucket,
                    key: outputKey,

                }
            },
/*
            tasks: {
                import: {
                    operation: "import/s3",
                    key,
                    ...inputBucket
                },
                convert: {
                    operation: "convert",
                    input: "import",
                    input_format: inputFormat1,
                    output_format: outputFormat,
                },
                export: {
                    operation: 'export/s3',
                    input: "convert",
                    ...outputBucket,
                    key: outputKey,
                }
            }
*/
        });
    console.log(`Job created for ${key} going from ${inputFormat1} to ${outputFormat}`);
    return {job, outputKey};
}