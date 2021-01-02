import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {mapToArray} from "./map.module";
import {Segment} from "./Atomized/segment";
import {OpenDocumentsService} from "./Manager/open-documents.service";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import {Dictionary} from "lodash";

export class ExampleSentencesService {
    exampleSentenceMap$: Observable<Map<string, Segment[]>>

    constructor(
        {
            openDocumentsService
        }: {
            openDocumentsService: OpenDocumentsService
        }
    ) {
        this.exampleSentenceMap$ = combineLatest([
            openDocumentsService.allReadingDocuments
                .pipe(
                    switchMap(documents =>
                        combineLatest(
                            mapToArray(
                                documents,
                                (id, document) =>
                                    document.tabulation$
                                        .pipe(map(stats => stats.wordSentenceMap))
                            )
                        )
                    )
                ),
        ]).pipe(
            map(([...sentenceMaps]) => {
                    const map: Dictionary<Segment[]> = mergeDictArrays(
                        ...sentenceMaps.map(([sentenceMap]) => sentenceMap)
                    )
                    return new Map(Object.entries(map));
                }
            ),
            shareReplay(1)
        )
    }
}
