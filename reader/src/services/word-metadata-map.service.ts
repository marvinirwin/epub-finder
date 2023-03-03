import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { Dictionary } from 'lodash'
import { AtomMetadata } from "@shared/"
import { XMLDocumentNode } from "@shared/"
import { VisibleService } from '../lib/manager/visible.service'
import { ElementAtomMetadataIndex } from './element-atom-metadata.index'
import { Segment, safePushMapSet, safePushSet } from '@shared/'
import { AbstractSegment } from "@shared/"

export type BrowserAtomMetadata = AtomMetadata<XMLDocumentNode, AbstractSegment<XMLDocumentNode>>;

export class WordMetadataMapService {
    public visibleWordMetadataMap$: Observable<Dictionary<Set<BrowserAtomMetadata>>>
    public visibleWordSegmentMap: Observable<Map<string, Set<Segment>>>

    constructor({
        visibleElementsService,
        aggregateElementIndexService,
    }: {
        visibleElementsService: VisibleService
        aggregateElementIndexService: ElementAtomMetadataIndex
    }) {
        this.visibleWordMetadataMap$ = combineLatest([
            visibleElementsService.elementsInView$,
            aggregateElementIndexService.index$,
        ]).pipe(
            map(([elementsInView, elementIndex]) => {
                debugger;
                const map = {} as Dictionary<Set<BrowserAtomMetadata>>
                elementsInView.forEach((elementInView) => {
                    const metadata = elementIndex.get(
                        (elementInView as unknown) as XMLDocumentNode,
                    )
                    metadata?.words?.subsequences?.forEach((word) =>
                        safePushSet(map, word.word, metadata),
                    )
                })
                return map
            }),
            shareReplay(1),
        )
        this.visibleWordSegmentMap = this.visibleWordMetadataMap$.pipe(
            map((wordMetadataMap) => {
                const m = new Map<string, Set<Segment>>()
                Object.entries(wordMetadataMap).forEach(([word, metadatas]) =>
                    metadatas.forEach((metadata) =>
                        safePushMapSet(m, word, metadata.parent),
                    ),
                )
                return m
            }),
            shareReplay(1),
        )
    }
}
