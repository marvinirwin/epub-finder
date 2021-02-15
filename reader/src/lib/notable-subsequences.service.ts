import CardsRepository from "./manager/cards.repository";
import {OpenDocumentsService, READING_DOCUMENT_NODE_LABEL} from "./manager/open-documents.service";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {combineLatest, merge, Observable} from "rxjs";
import {TabulatedDocuments, TabulatedSentences} from "./atomized/tabulated-documents.interface";
import {flattenTree} from "./Tree/DeltaScanner";
import {mergeTabulations} from "./atomized/merge-tabulations";
import {SubSequenceReturn} from "./subsequence-return.interface";

export class NotableSubsequencesService {
    subsequenceTabulation$: Observable<TabulatedSentences>;

    constructor({
                    openDocumentsService
                }: {
        cardsRepository: CardsRepository,
        openDocumentsService: OpenDocumentsService
    }) {
        this.subsequenceTabulation$ = openDocumentsService.openDocumentTree.mapWith(document => document.notableSubsequences$)
                .updates$.pipe(
                switchMap(({sourced}) => {
                    const readingDocuments = sourced?.children?.[READING_DOCUMENT_NODE_LABEL];
                    const subSequences: Observable<SubSequenceReturn>[] =
                        flattenTree<Observable<SubSequenceReturn>>(readingDocuments);
                    return merge(...subSequences);
                }),
                shareReplay(1)
            )
    }
}