import {ReplaySubject} from "rxjs";

export class DroppedFilesService {
    public uploadFileRequests$ = new ReplaySubject<File[]>(1);

    constructor() {
    }

    public static extensionFromFilename(filename: string): string {
        return filename.split('.').reverse()[0] || ''
    }
}