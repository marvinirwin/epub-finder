import {combineLatest, ReplaySubject} from "rxjs";
import {DroppedFilesService} from "./dropped-files.service";
import {BookCheckingOutService} from "../../components/Library/document-checking-out.service";
import {LoggedInUserService} from "../Auth/loggedInUserService";
import {BookViewDto} from "@server/*";
import {last, map, startWith} from "rxjs/operators";
import {LibraryService} from "../Manager/library.service";

const supportedFileExtensions = new Set<string>(['pdf', 'docx', 'txt', 'html']);

/**
 * Once a file is dropped we check if a user is logged in, if they're not raise an error
 * Then we persist with the repository
 * Then we set the editing one
 * Then there's another service which loads them later
 */
export class UploadingDocumentsService {
    uploadingErrors$ = new ReplaySubject<string>()

    constructor({
                    loggedInUserService,
                    documentCheckingOutService,
                    droppedFilesService,
                    libraryService,
                }: {
        loggedInUserService: LoggedInUserService,
        documentCheckingOutService: BookCheckingOutService,
        droppedFilesService: DroppedFilesService,
        libraryService: LibraryService,
    }) {
        // There will also have to be a document synchronization service
        combineLatest([
            droppedFilesService.uploadFileRequests$.pipe(
                map(files => files
                    .filter(file => supportedFileExtensions.has(DroppedFilesService.extensionFromFilename(file.name)))
                )
            ),
            loggedInUserService.profile$.pipe(startWith(undefined))
        ]).subscribe(async ([customDocuments, profile]) => {
            if (!profile) {
                this.uploadingErrors$.next(`Please log in to use custom documents`)
                return;
            }
            let lastDocument: string | undefined
            for (let i = 0; i < customDocuments.length; i++) {
                const basicDocument = customDocuments[i];
                lastDocument = basicDocument.name;
                await libraryService.addAndPersistDocumentRevision(basicDocument);
            }
            if (lastDocument) {
                await documentCheckingOutService.checkoutBook(lastDocument);
            }
        })
    }
}
