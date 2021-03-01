import {observableLastValue, SettingsService} from "../../../reader/src/services/settings.service";
import {LtDocument} from "./lt-document";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";

export class LibraryDocumentRow {
    selectedForFrequency$: Observable<boolean>;
    selectedForReading$: Observable<boolean>;
    private settingsService: SettingsService;
    private ltDocument: LtDocument;

    constructor(
        {
            settingsService,
            ltDocument
        }: {
            settingsService: SettingsService,
            ltDocument: LtDocument
        }) {
        this.settingsService = settingsService;
        this.ltDocument = ltDocument;
        this.selectedForReading$ = settingsService.readingDocument$
            .pipe(
                // Is the use of id() here not correct?
                // No I think we always use id()
                map(readingDocumentId => ltDocument.id() === readingDocumentId),
                shareReplay(1)
            );

        this.selectedForFrequency$ = settingsService.selectedFrequencyDocuments$.pipe(
            map(selectedFrequencyDocumentIds => selectedFrequencyDocumentIds.includes(ltDocument.id())),
            shareReplay(1)
        )
    }

    async toggleReading() {
        const mostRecent = await observableLastValue(this.settingsService.readingDocument$);
        if (mostRecent !== this.ltDocument.id()) {
            this.settingsService.readingDocument$.next('');
        } else {
            this.settingsService.readingDocument$.next(this.ltDocument.id());
        }
    }
    async toggleUseForFrequency() {
        const mostRecent = await observableLastValue(this.settingsService.selectedFrequencyDocuments$);
        if (mostRecent.includes(this.ltDocument.id())) {
            this.settingsService.selectedFrequencyDocuments$.next(
                mostRecent.filter(id => id !== this.ltDocument.id())
            )
        } else {
            this.settingsService.selectedFrequencyDocuments$.next(
                mostRecent.concat(this.ltDocument.id())
            )
        }
    }
}