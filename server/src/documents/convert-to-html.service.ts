import CloudConvert from "cloudconvert";
import {Job} from "cloudconvert/built/JobsResource";
import {BucketConfig} from "./bucket-config.interface";
import {conversionJob} from "./pdf-to-docx.service";

export const cloudConvert = new CloudConvert(process.env.CLOUD_CONVERT_API_KEY, !!process.env.CLOUD_CONVERT_USE_SANDBOX);

export async function convertToHtml({inputBucket, outputBucket, key, inputFormat}: {
    inputBucket: BucketConfig,
    outputBucket: BucketConfig,
    key: string,
    inputFormat: string
}) {
    const {job: job1, outputKey} = await conversionJob("pdf", "docx")
    ({inputBucket, outputBucket, key});
    await waitForJobDone(job1)
/*
    const {job: job2} = await conversionJob("docx", "html")
    ({inputBucket, outputBucket, key});
    await waitForJobDone(job2);
*/
    /*
            const uploadUrl = job.tasks.find(({name}) => name === 'import').result.form.url;
    */
    /*
            await uploadFileToImportJob(u, uploadUrl);
    */
}

async function waitForJobDone(job: Job) {
    console.log(`Waiting for job ${job.id} to finish`);
    const result = await cloudConvert.jobs.wait(job.id);
    if (result.status !== 'finished') {
        throw new Error("Job failed " + JSON.stringify(result))
    }
    console.log(`job ${job.id} finished`);
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
    const jobResult = await waitForJobDone(job);
}

