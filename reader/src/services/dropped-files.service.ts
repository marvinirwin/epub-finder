import {LibraryService} from "../lib/Manager/LibraryService";
import {ReplaySubject} from "rxjs";
import mammoth from 'mammoth';
import {interpolateSimpleCustomDoc} from "./simple-custom-doc.service";

const arrayBufferToString = (b: ArrayBuffer) => new TextDecoder().decode(b)

const extMap = {
    '.docx': (b: ArrayBuffer) => mammoth.convertToHtml({arrayBuffer: b}),
    '.html': arrayBufferToString,
    '.txt': (b: ArrayBuffer) => interpolateSimpleCustomDoc(arrayBufferToString(b))
}
export class DroppedFilesService {
    public droppedFiles$ = new ReplaySubject<File[]>(1);
    public droppedFileMessages$ = new ReplaySubject<string>(1);
    private libraryService: LibraryService;

    constructor({libraryService}: { libraryService: LibraryService }) {
        this.libraryService = libraryService;
        this.droppedFiles$.subscribe(async droppedFiles => {
            debugger;
            // Add the books to the library using their filenames
            for (let i = 0; i < droppedFiles.length; i++) {
                const droppedFile = droppedFiles[i];
                await this.handleSIngleDroppedFile(droppedFile);
            }
        })
    }

    private async handleSIngleDroppedFile(droppedFile: File) {
        const entries = Object.entries(extMap);
        for (let i = 0; i < entries.length; i++) {
            const [ext, toHtmlString] = entries[i];
            if (droppedFile.name.endsWith(ext)) {
                return this.libraryService.putCustomDocument(
                    droppedFile.name,
                    new TextDecoder().decode(await droppedFile.arrayBuffer())
                )
            }
        }
        this.droppedFileMessages$.next(`File extension of ${droppedFile.name} not supported.
        Current supported extensions: ${entries.map(([ext]) => ext).join(', ')}`);
    }
}
