import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {Dictionary} from "lodash";
import {AtomMetadata} from "../lib/Interfaces/atom-metadata.interface.ts/atom-metadata";
import {XMLDocumentNode} from "../lib/Interfaces/XMLDocumentNode";
import {safePushMapSet, safePushSet} from "./safe-push";
import {VisibleElementsService} from "../lib/Manager/visible-elements.service";
import {AggregateElementIndexService} from "./aggregate-element-index.service";
import {Segment} from "../lib/Atomized/segment";

export class WordMetadataMapService {
    public visibleWordMetadataMap$: Observable<Dictionary<Set<AtomMetadata>>>;
    public visibleWordSegmentMap: Observable<Map<string, Set<Segment>>>

    constructor({
                    visibleElementsService,
                    aggregateElementIndexService
                }: {
        visibleElementsService: VisibleElementsService
        aggregateElementIndexService: AggregateElementIndexService
    }) {
        this.visibleWordMetadataMap$ = combineLatest([
            visibleElementsService.elementsInView$,
            aggregateElementIndexService.aggregateIndex$
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