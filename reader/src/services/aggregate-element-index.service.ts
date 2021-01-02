import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {AtomMetadataIndex, AtomMetadataMap} from "../lib/Atomized/atom-metadata-index";
import {map, switchMap} from "rxjs/operators";
import {mergeMaps} from "../lib/map.module";
import {OpenDocumentsService} from "../lib/Manager/open-documents.service";

export class AggregateElementIndexService {
    public aggregateIndex$: BehaviorSubject<AtomMetadataMap>;
    constructor(
        {
            openDocumentsService
        }: {
            openDocumentsService: OpenDocumentsService
        }
        ) {
        this.aggregateIndex$ = new BehaviorSubject<AtomMetadataMap>(new Map());
        openDocumentsService
            .openDocumentTree
            .mapWith(openDocument => openDocument.atomMetadataIndex$)
            .flatUpdates()
            .pipe(
                switchMap(observables => combineLatest(observables) as Observable<AtomMetadataIndex[]>),
                map(indexes => mergeMaps(...indexes.map(index => index.instantIndex))),
            ).subscribe(this.aggregateIndex$);


    }
}