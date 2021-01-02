import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {mapToArray} from "./map.module";
import {Segment} from "./Atomized/segment";
import {OpenDocumentsService} from "./Manager/open-documents.service";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import {Dictionary} from "lodash";

export class ExampleSegmentsService {
    exampleSegmentMap$: Observable<Map<string, Segment[]>>

    constructor(
        {
            openDocumentsService
        }: {
            openDocumentsService: OpenDocumentsService
        }
    ) {
        this.exampleSegmentMap$ = openDocumentsService.sourceDocumentTabulation$.pipe(
            map((sentenceMaps) => {
                    return new Map(Object.entries(sentenceMaps.wordSegmentMap));
                }
            ),
            shareReplay(1)
        )
    }
}
