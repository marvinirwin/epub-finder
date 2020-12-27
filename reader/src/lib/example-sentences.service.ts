import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {mapToArray} from "./map.module";
import {AtomizedDocumentDocumentStats} from "./Atomized/AtomizedDocumentStats";
import {ICard} from "./Interfaces/ICard";
import {ds_Dict} from "./Tree/DeltaScanner";
import {AtomizedSentence} from "./Atomized/AtomizedSentence";
import {OpenDocumentsService} from "./Manager/open-documents.service";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import {Dictionary} from "lodash";

export class ExampleSentencesService {
    exampleSentenceMap$: Observable<Map<string, AtomizedSentence[]>>

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
                                    document.documentStats$
                                        .pipe(map(stats => stats.wordSentenceMap))
                            )
                        )
                    )
                ),
        ]).pipe(
            map(([...sentenceMaps]) => {
                    const map: Dictionary<AtomizedSentence[]> = mergeDictArrays(
                        ...sentenceMaps.map(([sentenceMap]) => sentenceMap)
                    )
                    return new Map(Object.entries(map));
                }
            ),
            shareReplay(1)
        )
    }
}
