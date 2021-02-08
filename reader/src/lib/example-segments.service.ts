import {Observable} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Segment} from "./Atomized/segment";
import {OpenDocumentsService} from "./Manager/open-documents.service";

export class ExampleSegmentsService {
    exampleSegmentMap$: Observable<Map<string, Segment[]>>

    constructor(
        {
            openDocumentsService
        }: {
            openDocumentsService: OpenDocumentsService
        }
    ) {
        this.exampleSegmentMap$ = openDocumentsService.displayDocumentTabulation$.pipe(
            map((sentenceMaps) => {
                    return new Map(Object.entries(sentenceMaps.wordSegmentMap));
                }
            ),
            shareReplay(1)
        )
    }
}
