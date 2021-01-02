import {Segment} from "./segment";
import {flatten} from "lodash";
import {Observable, ReplaySubject} from "rxjs";
import {TabulatedDocuments, TabulatedSentences} from "./tabulated-documents.interface";
import {map, shareReplay, tap} from "rxjs/operators";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {AtomMetadata} from "../Interfaces/atom-metadata.interface.ts/atom-metadata";


export type AtomMetadataMap = Map<XMLDocumentNode, AtomMetadata>;

export class AtomMetadataIndex {
    index: Map<XMLDocumentNode, Observable<AtomMetadata>>;
    instantIndex: AtomMetadataMap ;

    constructor(
        atomElements: XMLDocumentNode[],
        tabulations$: Observable<TabulatedSentences>) {
        this.index = new Map(
            atomElements.map(atomElement => [
                    atomElement,
                    tabulations$.pipe(
                        tap(tabulation => {
                            tabulation.atomMetadatas.forEach((metadata, el) => this.instantIndex.set(el, metadata))
                        }),
                        map(tabulation => {
                            return tabulation.atomMetadatas.get(atomElement) as AtomMetadata;
                        }),
                        shareReplay(1)
                    )
                ]
            )
        );
        this.instantIndex = new Map();
    }
}