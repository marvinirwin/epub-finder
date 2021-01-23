import {BehaviorSubject, combineLatest, merge, Observable} from "rxjs";
import {map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {mergeMaps} from "../lib/map.module";
import {OpenDocumentsService} from "../lib/Manager/open-documents.service";
import {VisibleService} from "../lib/Manager/visible.service";
import {AtomMetadata} from "../lib/Interfaces/atom-metadata.interface.ts/atom-metadata";
import {XMLDocumentNode} from "../lib/Interfaces/XMLDocumentNode";
import {TabulatedDocuments} from "../lib/Atomized/tabulated-documents.interface";


export type AtomMetadataMap = Map<XMLDocumentNode, AtomMetadata>;

export class ElementAtomMetadataIndex {
    public index$ = new BehaviorSubject<AtomMetadataMap>(new Map());

    constructor(
        {
            openDocumentsService,
            visibleElementsService
        }: {
            openDocumentsService: OpenDocumentsService,
            visibleElementsService: VisibleService
        }
    ) {
        visibleElementsService
            .openDocumentsInView$
            .pipe(
                switchMap(openDocuments => combineLatest(
                    openDocuments.map(openDocument => openDocument.renderedTabulation$)
                )),
                map((tabulations: TabulatedDocuments[]) => {
                    const m: AtomMetadataMap = new Map()
                    tabulations.forEach(tabulation => tabulation.atomMetadatas.forEach(
                        (value, key) => m.set(key, value)
                        )
                    )
                    return m;
                }),
                shareReplay(1)
            ).subscribe(this.index$);
    }

    public metadataForElement(e: HTMLElement): AtomMetadata {
        return this.index$.getValue().get(e as unknown as XMLDocumentNode) as AtomMetadata;
    }
}