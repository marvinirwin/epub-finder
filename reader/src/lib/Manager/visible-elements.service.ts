import {DeltaScanner, ds_Dict, flattenTree} from "../Tree/DeltaScanner";
import {OpenDocument} from "../DocumentFrame/open-document.entity";
import {Dictionary, flatten} from "lodash";
import {AtomMetadata} from "../Interfaces/atom-metadata.interface.ts/atom-metadata";
import {combineLatest, Observable} from "rxjs";
import {NavigationPages} from "../Util/Util";
import {ds_Tree, flattenTreeIntoDict} from "../../services/tree.service";
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService, READING_DOCUMENT_NODE_LABEL} from "./open-documents.service";
import {READING_NODE} from "../../components/directory/nodes/reading.node";
import {QUIZ_NODE} from "../../components/directory/nodes/quiz-carousel.node";
import {QuizService} from "../../components/quiz/quiz.service";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";
import {TabulatedDocuments} from "../Atomized/tabulated-documents.interface";
import {AtomizedDocument} from "../Atomized/atomized-document";
import {Segment} from "../Atomized/segment";


export const documentElements = (o$: Observable<AtomizedDocument[]>) =>
    o$.pipe(
        map(atomizedDocuments => new Set(
            flatten(
                atomizedDocuments
                    .map(atomizedDocument =>
                        atomizedDocument.atomElements() as unknown as HTMLElement[]
                    ))
            )
        )
    );

export class VisibleElementsService {
    elementsInView$: Observable<Set<HTMLElement>>

    constructor({componentInView$, openDocumentsService, quizService}: {
        componentInView$: Observable<string>,
        openDocumentsService: OpenDocumentsService,
        quizService: QuizService
    }) {
        this.elementsInView$ = combineLatest([
            componentInView$,
            openDocumentsService.openDocumentTree.mapWith(openDocument => openDocument.atomizedDocument$).updates$
        ]).pipe(
            switchMap(
                ([componentInView, {sourced}]) => {
                    if (!sourced || !sourced.children) return [];
                    switch (componentInView) {
                        case READING_NODE:
                            return combineLatest(flattenTree(sourced.children[READING_DOCUMENT_NODE_LABEL]));
                        case QUIZ_NODE:
                            return combineLatest(flattenTree(sourced.children[EXAMPLE_SENTENCE_DOCUMENT]));
                        default:
                            return combineLatest([])
                    }
                }),
            documentElements,
            shareReplay(1)
        )
    }


    getHighlightElementsForWords(
        wordElementMaps: Dictionary<AtomMetadata[]>[],
        word: string
    ) {
        const results: AtomMetadata[] = [];
        for (let i = 0; i < wordElementMaps.length; i++) {
            const wordElementMap = wordElementMaps[i];
            if (wordElementMap[word]) {
                results.push(...wordElementMap[word]);
            }
        }
        return results;
    }
}