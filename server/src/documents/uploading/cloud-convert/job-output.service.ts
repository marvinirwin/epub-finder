import {Job} from "cloudconvert/built/JobsResource";
import {BucketConfig} from "../../bucket-config.interface";


export interface S3File {
    filename: string;
    dir?: string;
    s3Key: string;
}

export const getJobOutputFiles = (job: Job): S3File[] => {
    const lastConversionTask = job.tasks[1];
    const exportTask = job.tasks[0];
    return lastConversionTask
        .result
        .files
        .map((file, index) => ({
            ...file,
            s3Key: exportTask.result.files[index].filename
        }))
}

