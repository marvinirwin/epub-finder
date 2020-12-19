import mammoth from 'mammoth';
import pdftohtml from 'pdftohtmljs';
import {dirname, extname, join, parse} from 'path';
import {InterpolateService} from "../shared/interpolate.service";
import fs from 'fs-extra';
import {Subject} from "rxjs";

export class UploadedFileService {
    public static async normalise(filepath: string) {
        const ext = extname(filepath)
        switch (ext) {
            case 'html':
                return filepath;
            case 'docx':
                return this.handleDocx(filepath);
            case 'txt':
                return this.handleTxt(filepath);
            case 'pdf':
                return this.handlePdf(filepath);
            default:
                throw new Error(`Unsupported file extension: ${ext}`);
        }
    }

    private static handlePdf(filepath: string) {
        return this.convertPdfToHtml(filepath, new Subject<string>());
    }

    private static handleDocx(filepath: string) {
        return mammoth.convertToHtml({path: filepath, convertImage: false})
            .then(async (o) => {
                const html = InterpolateService.html("", o.value);
                const newPath = this.replaceExtInPath(filepath, 'html');
                await fs.writeFile(newPath, html);
                return newPath;
            })
    }

    private static async handleTxt(filepath: string) {
        const text = (await fs.readFile(filepath)).toString("utf8");
        const newPath = this.replaceExtInPath(filepath, 'html');
        await fs.writeFile(newPath, InterpolateService.text(text))
        return newPath;
    }

    constructor() {
        UploadedFileService.convertPdfToHtml(process.env.TEST_PDF_TO_HTML_FILE, new Subject<string>());
        UploadedFileService.handleDocx(`docx/${process.env.TEST_DOCX_TO_HTML_FILE}`)
    }

    private static async convertPdfToHtml(filepath: string, progress$: Subject<string>) {
        const newPath = this.replaceExtInPath(filepath, 'html');
        const converter = new pdftohtml(
            filepath,
            newPath,
            {
                bin: 'docker',
                additional: [
                    'run',
                    '--rm',
                    '-v',
                    (`${join(process.cwd(), 'pdf')}:/pdf`),
                    'iapain/pdf2htmlex',
                    'pdf2htmlEX',
                    '--process-nontext',
                    '0',
                    '--process-outline',
                    '0',
                    '--optimize-text',
                    '1'
                ]
            }
        )

        // If you would like to tap into progress then create
        // progress handler
        converter.progress((ret) => {
            const progress = (ret.current * 100.0) / ret.total;
            progress$.next(`${progress} %`)
        })

        await converter.convert();

        return newPath;
    }

    private static replaceExtInPath(filepath: string, ext: string) {
        let name = parse(filepath).name;
        return join(dirname(filepath), `${name}.${ext}`);
    }
}