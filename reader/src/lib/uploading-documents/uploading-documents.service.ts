import {combineLatest, ReplaySubject} from "rxjs";
import {DroppedFilesService} from "./dropped-files.service";
import {DocumentCheckingOutService} from "../../components/library/document-checking-out.service";
import {LoggedInUserService} from "../auth/loggedInUserService";
import {last, map, startWith} from "rxjs/operators";
import {LibraryService} from "../manager/library.service";
import {ProgressItemService} from "../../components/progress-item.service";

const supportedFileExtensions = new Set<string>(['pdf', 'docx', 'txt', 'html']);

/**
 * Once a file is dropped we check if a user is logged in, if they're not raise an error
 * Then we persist with the repository
 * Then we set the editing one
 * Then there's another service which loads them later
 */
export class UploadingDocumentsService {
    uploadingMessages$ = new ReplaySubject<string>(1)
    currentUploadingFile$ = new ReplaySubject<File | undefined>(1)

    constructor({
                    droppedFilesService,
                    libraryService,
                    progressItemService
                }: {
        progressItemService: ProgressItemService,
        documentCheckingOutService: DocumentCheckingOutService,
        droppedFilesService: DroppedFilesService,
        libraryService: LibraryService,
    }) {
        this.currentUploadingFile$.next();
        // There will also have to be a document synchronization service
        droppedFilesService.uploadFileRequests$.pipe(
            map(files => files
                .filter(file => supportedFileExtensions.has(DroppedFilesService.extensionFromFilename(file.name)))
            )
        ).subscribe(async (customDocuments) => {
            progressItemService.newProgressItem().exec(async () => {
                let lastDocument: string | undefined
                for (let i = 0; i < customDocuments.length; i++) {
                    const basicDocument = customDocuments[i];
                    lastDocument = basicDocument.name;
                    this.uploadingMessages$.next(`Uploading ${basicDocument.name}.  This can take up to 30 seconds`)
                    this.currentUploadingFile$.next(basicDocument);
                    await libraryService.upsertDocument(basicDocument);
                    this.currentUploadingFile$.next(undefined);
                    this.uploadingMessages$.next(`Uploading ${basicDocument.name} success!`)
                }
            })
        })
    }
}
