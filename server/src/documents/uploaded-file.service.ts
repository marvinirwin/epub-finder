import mammoth from 'mammoth';
import pdftohtml from '../pdftohtmljs/pdftohtmljs';
import {basename, dirname, join, resolve} from 'path';
import {InterpolateService} from "../shared";
import fs from 'fs-extra';
import {Subject} from "rxjs";
import {hashElement} from 'folder-hash';
import {UploadedDocument} from "./uploaded-document";


export class UploadedFileService {

    public static async normalise(uploadedFile: UploadedDocument): Promise<void> {
    }

    private static handlePdf(filepath: UploadedDocument) {
        return this.convertPdfToHtml(filepath, new Subject<string>());
    }

    private static handleDocx(uploadedDocument: UploadedDocument) {
        return mammoth.convertToHtml({
            path: uploadedDocument.uploadedFilePath,
            convertImage: false
        })
            .then(async (o) => {
                const html = InterpolateService.html("", o.value);
                await fs.writeFile(uploadedDocument.htmlFilePath(), html);
            });
    }

    private static async handleTxt(uploadedFile: UploadedDocument) {
        const text = (await fs.readFile(uploadedFile.uploadedFilePath)).toString("utf8");
        await fs.writeFile(uploadedFile.htmlFilePath(), InterpolateService.text(text))
    }

    constructor() {
    }

    private static async convertPdfToHtml(uploadedFile: UploadedDocument, progress$: Subject<string>) {
        const volume = `${resolve(dirname(uploadedFile.uploadedFilePath))}:/pdf`;
        let pdfToHtmlBin = 'docker';
        let additional = [
            'run',
            '--rm',
            '-v',
            volume,
            'iapain/pdf2htmlex',
            'pdf2htmlEX',
        ];
        const converter = pdftohtml(
            basename(uploadedFile.uploadedFilePath),
            basename(uploadedFile.htmlFilePath()),
            {
                bin: pdfToHtmlBin,
                additional: additional
            }
        )

        // If you would like to tap into progress then create
        // progress handler
        // @ts-ignore
        converter.progress((ret) => {
            const progress = (ret.current * 100.0) / ret.total;
            progress$.next(`${progress} %`)
        })

        // @ts-ignore
        await converter.convert();
    }

    /*
        private static replaceExtInPath(filepath: string, ext: string) {
            let name = parse(filepath).name;
            return join(dirname(filepath), `${name}.${ext}`);
        }
    */

    public static fileHash(path: string): Promise<string> {
        return hashElement(basename(path), dirname(path))
            .then(result => result.hash)
    }
}