import {BucketConfig} from "../../bucket-config.interface";
import {v4 as uuidv4} from 'uuid';
import {getJobOutputFiles} from "./job-output.service";
import {cloudConvertRegular, cloudConvertSandbox} from "./cloud-convert.configs";
import {HttpException} from "@nestjs/common";
import {S3UploadedFile, UploadOutput} from "../s3-uploaded-file";
import {outputConfig} from "../s3.service";

export class ConversionProcess {
    constructor(
        public u: S3UploadedFile,
    ) {
    }

    async convert() {
        const cloudConvert = this.u.isSandboxFile ? cloudConvertSandbox : cloudConvertRegular;
        console.log(`Starting job for ${this.u.file.originalname} traversing ${this.u.formatChain().join(' -> ')}`);
        const convert = {};
        let lastInputKey = 'import';
        for (let i = 0; i < this.u.formatChain().length - 1; i++) {
            const inputFormat = this.u.formatChain()[i];
            const convertOperationKey = `convert_${i}`;
            const outputFormat = this.u.formatChain()[i + 1];
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
        console.log(`Waiting for job  to finish`);
        const result = await cloudConvert.jobs.wait((await cloudConvert
            .jobs
            .create({
                tasks: {
                    import: {
                        operation: "import/url",
                        filename: this.u.file.originalname,
                        url: `https://languagetrainer-documents.s3-us-west-2.amazonaws.com/${this.u.file.key}`,
                    },
                    ...convert,
                    export: {
                        input: lastInputKey,
                        operation: 'export/s3',
                        ...outputConfig,
                        key: uuidv4(),
                    }
                },
            })).id);
        if (result.status !== 'finished') {
            throw new HttpException(
                JSON.stringify(result.tasks.map(task => task.message), null, '\t'),
                500
            )
        }
        console.log(`job  finished`);
        return new UploadOutput(getJobOutputFiles(result));
    }

}

