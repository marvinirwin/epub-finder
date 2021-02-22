import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {Dictionary} from "lodash";
import {AtomMetadata} from "../../../server/src/shared/atom-metadata.interface.ts/atom-metadata";
import {XMLDocumentNode} from "../../../server/src/shared/XMLDocumentNode";
import {safePushMapSet, safePushSet} from "../../../server/src/shared/safe-push";
import {VisibleService} from "../lib/manager/visible.service";
import {ElementAtomMetadataIndex} from "./element-atom-metadata.index";
import {Segment} from "../../../server/src/shared/tabulate-documents/segment";

export class WordMetadataMapService {
    public visibleWordMetadataMap$: Observable<Dictionary<Set<AtomMetadata>>>;
    public visibleWordSegmentMap: Observable<Map<string, Set<Segment>>>

    constructor({
                    visibleElementsService,
                    aggregateElementIndexService
                }: {
        visibleElementsService: VisibleService
        aggregateElementIndexService: ElementAtomMetadataIndex
    }) {
        this.visibleWordMetadataMap$ = combineLatest([
            visibleElementsService.elementsInView$,
            aggregateElementIndexService.index$
        ]).pipe(
            map(([elementsInView, elementIndex]) => {
                const map = {} as Dictionary<Set<AtomMetadata>>;
                elementsInView
                    .forEach(elementInView => {
                        const metadata = elementIndex.get(
                            elementInView as unknown as XMLDocumentNode
                        );
                        metadata?.words?.forEach(word => safePushSet(map, word.word, metadata));
                    })
                return map
            }),
            shareReplay(1)
        );
        this.visibleWordSegmentMap = this.visibleWordMetadataMap$.pipe(
            map(wordMetadataMap => {
                const m = new Map<string, Set<Segment>>();
                Object.entries(wordMetadataMap).forEach(([word, metadatas]) =>
                    metadatas.forEach(metadata => safePushMapSet(m, word, metadata.parent)))
                return m;
            }),
            shareReplay(1)
        )
    }
}