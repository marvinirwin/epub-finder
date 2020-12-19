import {parse} from "path";

export class UploadedDocument {
    constructor(
        public uploadedFilePath: string,
        public sourceFilePath: string
    ) {
    }

    htmlFilePath() {
        return `${this.uploadedFilePath}.html`
    }

    ext() {
        return parse(this.sourceFilePath).ext;
    }
}