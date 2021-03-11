import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {OpenDocumentsService} from "./manager/open-documents.service";




export class ExampleSegmentsService {
    exampleSegmentMap$: Observable<Map<string, Set<string>>>

    // We take the words we know and then find the segments which contain the words we know
    constructor(
        {
            openDocumentsService,
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
