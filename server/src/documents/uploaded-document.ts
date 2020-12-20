import {dirname, join, parse} from "path";

export class UploadedDocument {
    constructor(
        public uploadedFilePath: string,
        public sourceFilePath: string
    ) {
    }

    htmlFilePath() {
        return `${join(dirname(this.uploadedFilePath), parse(this.uploadedFilePath).name)}.html`
    }

    ext() {
        return parse(this.sourceFilePath).ext;
    }
}