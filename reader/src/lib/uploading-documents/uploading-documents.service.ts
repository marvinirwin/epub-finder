import {combineLatest, ReplaySubject} from "rxjs";
import {DroppedFilesService} from "./dropped-files.service";
import {DocumentCheckingOutService} from "../../components/Library/document-checking-out.service";
import {LoggedInUserService} from "../Auth/loggedInUserService";
import {last, map, startWith} from "rxjs/operators";
import {LibraryService} from "../Manager/library.service";
import {AvailableDocumentsService} from "../documents/available-documents.service";

const supportedFileExtensions = new Set<string>(['pdf', 'docx', 'txt', 'html']);

/**
 * Once a file is dropped we check if a user is logged in, if they're not raise an error
 * Then we persist with the repository
 * Then we set the editing one
 * Then there's another service which loads them later
 */
export class UploadingDocumentsService {
    uploadingErrors$ = new ReplaySubject<string>(1)
    uploadingMessages$ = new ReplaySubject<string>(1)

    constructor({
                    loggedInUserService,
                    droppedFilesService,
                    libraryService,
        availableDocumentService,
                }: {
        loggedInUserService: LoggedInUserService,
        documentCheckingOutService: DocumentCheckingOutService,
        droppedFilesService: DroppedFilesService,
        libraryService: LibraryService,
        availableDocumentService: AvailableDocumentsService,
    }) {
        // There will also have to be a document synchronization service
        combineLatest([
            droppedFilesService.uploadFileRequests$.pipe(
                map(files => files
                    .filter(file => supportedFileExtensions.has(DroppedFilesService.extensionFromFilename(file.name)))
                )
            ),
            loggedInUserService.profile$.pipe(startWith(undefined))
        ]).subscribe(async ([customDocuments]) => {
            let lastDocument: string | undefined
            for (let i = 0; i < customDocuments.length; i++) {
                const basicDocument = customDocuments[i];
                lastDocument = basicDocument.name;
                this.uploadingMessages$.next(`Uploading ${basicDocument.name}...`)
                await libraryService.upsertDocument(basicDocument);
                this.uploadingMessages$.next(`Uploading ${basicDocument.name} success!`)
            }
            if (lastDocument) {
                await availableDocumentService.fetchAll()
            }
        })
    }
}
