import { ds_Dict, flattenTree } from '../delta-scan/delta-scan.module'
import { Dictionary, flatten } from 'lodash'
import { AtomMetadata } from "@shared/"
import { combineLatest, Observable } from 'rxjs'
import {
    EXAMPLE_SENTENCE_DOCUMENT,
    OpenDocumentsService,
    READING_DOCUMENT_NODE_LABEL,
} from './open-documents.service'
import { map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { Segment } from "@shared/"
import { OpenDocument } from '../document-frame/open-document.entity'
import { QUIZ_NODE, READING_NODE } from '@shared/'

export const renderedSegmentsElements = (o$: Observable<Segment[][]>) =>
    o$.pipe(
        map((segmentLists): Segment[] => {
            return flatten(segmentLists)
        }),
        map((segments: Segment[]) => {
            return new Set(
                flatten(
                    segments.map(
                        (segment) =>
                            [
                                ...segment.getSentenceHTMLElement().children,
                            ] as HTMLElement[],
                    ),
                ),
            )
        }),
        shareReplay(1),
    )

export class VisibleService {
    elementsInView$: Observable<Set<HTMLElement>>
    openDocumentsInView$: Observable<OpenDocument[]>

    constructor({
        componentInView$,
        openDocumentsService,
    }: {
        componentInView$: Observable<string>
        openDocumentsService: OpenDocumentsService
    }) {
        this.openDocumentsInView$ = combineLatest([
            componentInView$,
            openDocumentsService.openDocumentTree.updates$,
        ]).pipe(
            map(([componentInView, { sourced }]) => {
                if (!sourced || !sourced.children) return []
                console.log(componentInView)
                switch (componentInView) {
                    case READING_NODE:
                        return flattenTree(
                            sourced.children[READING_DOCUMENT_NODE_LABEL],
                        )
                    case QUIZ_NODE:
                        return flattenTree(
                            sourced.children[EXAMPLE_SENTENCE_DOCUMENT],
                        )
                    default:
                        return []
                }
            }),
            shareReplay(1),
        )

        this.elementsInView$ = this.openDocumentsInView$.pipe(
            switchMap((documents: OpenDocument[]) => {
                return combineLatest(
                    documents.map((document) => document.renderedSegments$),
                )
            }),
            renderedSegmentsElements,
            shareReplay(1),
        )
    }

    getHighlightElementsForWords(
        wordElementMaps: Dictionary<AtomMetadata[]>[],
        word: string,
    ) {
        const results: AtomMetadata[] = []
        for (let i = 0; i < wordElementMaps.length; i++) {
            const wordElementMap = wordElementMaps[i]
            if (wordElementMap[word]) {
                results.push(...wordElementMap[word])
            }
        }
        return results
    }
}
