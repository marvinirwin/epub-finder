import {Observable, ReplaySubject, Subject} from "rxjs";
import {map, withLatestFrom} from "rxjs/operators";

type EditingDocumentDto = { name: string, text: string };

/**
 * You can either edit plain local customDocuments
 * Or full DocumentViews
 * What'
 */
export class EditingDocument {
    text$ = new ReplaySubject<string>(1);
    name$ = new ReplaySubject<string>(1);
    saveSignal$ = new Subject<void>();
    saveEvent$: Observable<EditingDocumentDto>
    constructor() {
        this.saveEvent$ = this.saveSignal$.pipe(
            withLatestFrom(
                this.name$,
                this.text$,
            ),
            map(([, name, text]) => ({name, text}))
        );
    }
}