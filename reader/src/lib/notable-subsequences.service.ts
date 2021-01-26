import CardsRepository from "./Manager/cards.repository";
import {OpenDocumentsService, READING_DOCUMENT_NODE_LABEL} from "./Manager/open-documents.service";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {combineLatest, merge, Observable} from "rxjs";
import {TabulatedDocuments} from "./Atomized/tabulated-documents.interface";
import {flattenTree} from "./Tree/DeltaScanner";
import {mergeTabulations} from "./Atomized/merge-tabulations";

export class NotableSubsequencesService {
    constructor({
                    cardsRepository,
                    openDocumentsService
                }: {
        cardsRepository: CardsRepository,
        openDocumentsService: OpenDocumentsService
    }) {
        openDocumentsService.openDocumentTree.mapWith(document => document.notableSubsequences$)
            .updates$.pipe(
            switchMap(({sourced}) => {
                const readingDocuments = sourced?.children?.[READING_DOCUMENT_NODE_LABEL];
                const subSequences: Observable<string[]>[] =
                    flattenTree<Observable<string[]>>(readingDocuments);
                return merge(...subSequences);
            }),
        ).subscribe(subsequences => {
            cardsRepository.putSyntheticWords(subsequences);
        })
        ;
    }
}