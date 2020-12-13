import {combineLatest, ReplaySubject} from "rxjs";
import {DroppedFilesService} from "./dropped-files.service";
import {BookCheckingOutService} from "../../components/Library/book-checking-out.service";
import {LoggedInUserService} from "../Auth/loggedInUserService";
import { BookViewDto } from "@server/*";
import {startWith} from "rxjs/operators";
import {LibraryService} from "../Manager/library.service";
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
                    bookCheckingOutService,
                    droppedFilesService,
        libraryService,
                }: {
        loggedInUserService: LoggedInUserService,
        bookCheckingOutService: BookCheckingOutService,
        droppedFilesService: DroppedFilesService,
        libraryService: LibraryService,
    }) {
        // There will also have to be a document synchronization service
        combineLatest([
            droppedFilesService.uploadingFiles$,
            loggedInUserService.profile$.pipe(startWith(undefined))
        ]).subscribe(async ([ customDocuments, profile]) => {
            if (!profile) {
                this.uploadingErrors$.next(`Please log in to use custom documents`)
                return;
            }
            let lastDocument: BookViewDto | undefined;
            for (let i = 0; i < customDocuments.length; i++) {
                lastDocument = await libraryService.addAndPersistDocumentRevision(customDocuments[i]);
            }
            if (lastDocument) {
                await bookCheckingOutService.checkoutBook(lastDocument.name);
            }
        })
    }
}
