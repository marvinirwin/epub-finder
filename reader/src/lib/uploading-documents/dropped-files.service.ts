import {ReplaySubject} from "rxjs";
import {BasicDocument} from "../../types";

import mammoth from 'mammoth';
import {interpolateSimpleCustomDoc} from "../../services/simple-custom-doc.service";
import { flatten } from "lodash";

const arrayBufferToString = (b: ArrayBuffer) => new TextDecoder().decode(b)
const extMap = {
    'docx': (b: ArrayBuffer) => mammoth.convertToHtml({arrayBuffer: b}),
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
    public droppedFiles$ = new ReplaySubject<File[]>(1);
    public uploadingFiles$ = new ReplaySubject<BasicDocument[]>(1)
    public droppedFileMessages$ = new ReplaySubject<string>(1);

    constructor() {
        this.droppedFiles$.subscribe(async droppedFiles => {
            await this.handleDroppedFiles(droppedFiles);
        })
    }

    private async handleDroppedFiles(droppedFiles: File[]) {
        const supportedFiles: File[] = [];
        for (let i = 0; i < droppedFiles.length; i++) {
            const droppedFile = droppedFiles[i];
            if (!DroppedFilesService.isFileExtSupported(droppedFile)) {
                this.droppedFileMessages$.next(`File extension of ${droppedFile.name} not supported.
        Current supported extensions: ${Object.keys(extMap).map((ext) => ext).join(', ')}`);
            } else {
                supportedFiles.push(droppedFile);
            }
        }

        this.uploadingFiles$.next(
            await Promise.all(supportedFiles.map(DroppedFilesService.fileToCustomDocument))
        )
    }

    private static isFileExtSupported(droppedFile: File): boolean {
        const extensions = Object.keys(extMap);
        for (let i = 0; i < extensions.length; i++) {
            const extension = extensions[i];
            if (DroppedFilesService.extensionFromFilename(droppedFile.name) === extension) {
                return true;
            }
        }
        return false;
    }

    private static extensionFromFilename(filename: string): string {
        return filename.split('.').reverse()[0] || ''
    }

    private static async fileToCustomDocument(file: File): Promise<BasicDocument> {
        const supportedExt = DroppedFilesService.extensionFromFilename(file.name) as keyof typeof extMap;
        return {name: file.name, html: extMap[supportedExt](await file.arrayBuffer())}
    }
}