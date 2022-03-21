import {S3File} from "./cloud-convert/job-output.service";

export class UploadOutput {
    constructor(private f: S3File[]) {
    }

    files() {
        return this.f;
    }

    index() {
        return this.f.find((file) => file.filename.endsWith(".html"));
    }
}