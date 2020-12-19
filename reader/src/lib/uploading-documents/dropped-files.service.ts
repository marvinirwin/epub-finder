import {ReplaySubject} from "rxjs";
import {BasicDocument} from "../../types";

import mammoth from 'mammoth';
import {interpolateSimpleCustomDoc} from "../../services/simple-custom-doc.service";
import { flatten } from "lodash";

const arrayBufferToString = (b: ArrayBuffer) => new TextDecoder().decode(b)
const extMap = {
    'docx': async (b: ArrayBuffer) => mammoth.convertToHtml({arrayBuffer: b})
        // @ts-ignore
        .then(({value}) => {
        return interpolateSimpleCustomDoc(value);
    }),
    'html': arrayBufferToString,
    'txt': (b: ArrayBuffer) => interpolateSimpleCustomDoc(
    )
}


export class DroppedFilesService {
    public uploadFileRequests$ = new ReplaySubject<File[]>(1);

    constructor() {
    }

    public static extensionFromFilename(filename: string): string {
        return filename.split('.').reverse()[0] || ''
    }
}