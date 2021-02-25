import {Observable} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Segment} from "@shared/*";
import {OpenDocumentsService} from "./manager/open-documents.service";

export class ExampleSegmentsService {
    exampleSegmentMap$: Observable<Map<string, Set<string>>>

    constructor(
        {
            openDocumentsService
        }: {
            openDocumentsService: OpenDocumentsService
        }
    ) {
        this.exampleSegmentMap$ = openDocumentsService.virtualDocumentTabulation$.pipe(
            map((tabulation) => {
                    return tabulation.wordSegmentStringsMap()
                }
            ),
            shareReplay(1)
        )
    }
}
