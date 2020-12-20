import mammoth from 'mammoth';
import pdftohtml from '../pdftohtmljs/pdftohtmljs';
import {basename, dirname, extname, join, parse} from 'path';
import {InterpolateService} from "../shared";
import fs from 'fs-extra';
import {Subject} from "rxjs";
import {hashElement} from 'folder-hash';
import {UploadedDocument} from "./uploaded-document";

export class UploadedFileService {
    public static async normalise(uploadedFile: UploadedDocument): Promise<void> {
        switch (uploadedFile.ext()) {
            case '.html':
                // Do nothing
                return;
            case '.docx':
                return this.handleDocx(uploadedFile);
            case '.txt':
                return this.handleTxt(uploadedFile);
            case '.pdf':
                return this.handlePdf(uploadedFile);
            default:
                throw new Error(`Unsupported file extension: ${uploadedFile.ext()}`);
        }
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
        UploadedFileService.convertPdfToHtml(
            new UploadedDocument(
                process.env.TEST_PDF_TO_HTML_FILE,
                process.env.TEST_PDF_TO_HTML_FILE
            ),
            new Subject<string>());
        UploadedFileService.handleDocx(new UploadedDocument(
            process.env.TEST_DOCX_TO_HTML_FILE,
            process.env.TEST_DOCX_TO_HTML_FILE
        ))
    }

    private static async convertPdfToHtml(uploadedFile: UploadedDocument, progress$: Subject<string>) {
        const filePathInDocker = join('/pdf', basename(uploadedFile.uploadedFilePath));
        const volume = `${join(process.cwd(), dirname(uploadedFile.uploadedFilePath))}:/pdf`;
        const converter = pdftohtml(
            basename(uploadedFile.uploadedFilePath),
            basename(uploadedFile.htmlFilePath()),
            {
                bin: 'docker',
                additional: [
                    'run',
                    '--rm',
                    '-v',
                    volume,
                    'iapain/pdf2htmlex',
                    'pdf2htmlEX',
                    '--process-nontext',
                    '0',
                    '--process-outline',
                    '0',
                    '--optimize-text',
                    '1',
                ]
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