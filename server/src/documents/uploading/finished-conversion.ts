import {Job} from "cloudconvert/built/JobsResource";
import {BucketConfig} from "../bucket-config.interface";

export class FinishedConversion {
    constructor(
        private finishedJob: Job
    ) {
    }

    outputFiles(): ConversionOutputFile[] {
        const lastConversionTask = this.finishedJob.tasks[1];
        const exportTask = this.finishedJob.tasks[0];
        return lastConversionTask
            .result
            .files
            .map((file, index) => ({
                ...file,
                s3Key: exportTask.result.files[index].filename
            }))

    }

    htmlFile(): ConversionOutputFile {
        return this.outputFiles().find(file => file.filename.endsWith('.html'))
    }
}

export interface ConversionOutputFile {
    filename: string;
    dir?: string;
    s3Key: string;
}

export class ConversionBucketConfigs {
    constructor(
        public inputBucket: BucketConfig,
        public outputBucket: BucketConfig
    ) {
    }
}