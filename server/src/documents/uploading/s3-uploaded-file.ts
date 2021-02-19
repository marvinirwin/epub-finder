import {parse} from "path";
import {getS3FileString, inputConfig, outputConfig, uploadToS3} from "./s3.service";
import {S3File} from "./cloud-convert/job-output.service";
import {ConversionProcess} from "./cloud-convert/conversion-process";
import {InterpolateService} from "../../shared";

/**
 * WHat's a word describing documents which are ready for insertion?
 * It can't be s3 files beacuse they're in s3 before they're converted
 * It can't be procssed because html files aren't processed :/
 */

export class S3UploadedFile {
    constructor(
        public file: { originalname: string; bucket: string; key: string; location: string },
        public isSandboxFile: boolean
    ) {
    }

    formatChain(): string[] {
        switch (this.ext()) {
            case "pdf":
                return ["pdf", "html"];
            case "docx":
                return ["docx", "html"];
            case "txt":
                return ["txt", "html"];
            default:
                throw new Error(`No format chain found for ${this.ext()}`);
        }
    }

    ext() {
        return parse(this.file.originalname).ext.replace(".", "");
    }

    async output(): Promise<UploadOutput> {
        const ext = this.ext();
        const key = this.file.key;
        const inputBucketOutputBucketKey = {
            inputBucket: inputConfig,
            outputBucket: outputConfig,
            key: key,
            filename: this.file.originalname
        };
        switch (ext) {
            case "html":
                return new UploadOutput(
                    [
                        {
                            dir: "",
                            s3Key: this.file.key,
                            filename: "index.html"
                        }
                    ]
                );
            case "txt":
                // Load the file into memory, split it by lines and interpolate it as html
                const str = await getS3FileString(key);
                const uploadResult = await uploadToS3(
                    Buffer.from(InterpolateService.sentences(str.split('\n')), 'utf8')
                )
                return new S3UploadedFile(
                    {
                        originalname: `${parse(this.file.originalname).name}.html`,
                        bucket: inputConfig.bucket,
                        key: uploadResult.Key,
                        location: inputConfig.region,
                    },
                    this.isSandboxFile
                ).output()
            case "pdf":
            case "docx":
                return new ConversionProcess(this).convert();
            default:
                throw new Error(`Cannot upload file with extension: ${ext}`);
        }
    }
};


export class UploadOutput {
    constructor(private f: S3File[]) {
    }

    files() {
        return this.f;
    }

    index() {
        return this.f.find(file => file.filename.endsWith(".html"));
    }

}