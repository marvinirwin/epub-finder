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
        splitByMultipleKeepDelim(['。', '\n'], arrayBufferToString(b))
            .map(sentence => sentence.trim())
            .filter(sentence => !!sentence)
            .map(sentence => `<div>${sentence}</div>`)
            .join('\n')
    )
}

const splitByMultipleKeepDelim = (separators: string[], text: string): string[] => {
    let arr: string[] = [text];
    separators.forEach(separator => {
        arr = flatten(arr.map(sentence => sentence.split(separator)
            .filter(splitResult => !!splitResult.trim())
            .map(sentence => `${sentence}${separator}`)
        ));
    })
    return arr;
}

export class DroppedFilesService {
    public uploadFileRequests$ = new ReplaySubject<File[]>(1);

    constructor() {
    }

    public static extensionFromFilename(filename: string): string {
        return filename.split('.').reverse()[0] || ''
    }
}