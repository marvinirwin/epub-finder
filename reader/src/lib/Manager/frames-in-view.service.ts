import {DeltaScanner, ds_Dict, flattenTree} from "../Tree/DeltaScanner";
import {OpenDocument} from "../DocumentFrame/open-document.entity";
import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {combineLatest, Observable} from "rxjs";
import {NavigationPages} from "../Util/Util";
import {ds_Tree, flattenTreeIntoDict} from "../../services/tree.service";
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService, READING_DOCUMENT_NODE_LABEL} from "./open-documents.service";
import {READING_NODE} from "../../components/directory/nodes/reading.node";
import {QUIZ_NODE} from "../../components/directory/nodes/quiz-carousel.node";
import {QuizService} from "../../components/quiz/quiz.service";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";
import {DocumentDataIndex} from "../Atomized/document-data-index.interfaec";

export class FramesInViewService {
    documentsInView$: Observable<Set<OpenDocument>>

    constructor({componentInView$, openDocumentsService, quizService}: {
        componentInView$: Observable<string>,
        openDocumentsService: OpenDocumentsService,
        quizService: QuizService
    }) {
        this.documentsInView$ = combineLatest([
                componentInView$,
                openDocumentsService.renderedDocumentDataTree.updates$
            ]).pipe(map(
                ([componentInView, {sourced}]) => {
                    if (!sourced || !sourced.children) return [];

                    switch (componentInView) {
                        case READING_NODE:
                            return flattenTree(sourced.children[READING_DOCUMENT_NODE_LABEL]);
                        case QUIZ_NODE:
                            return flattenTree(sourced.children[EXAMPLE_SENTENCE_DOCUMENT]);
                        default:
                            return []
                    }
                }
            ),
            switchMap((documentStats: Observable<DocumentDataIndex[]>[]) => combineLatest(documentStats)),
            map((...sentenceData) => {
                mergeDictArrays(...sentenceData.map(sentenceDatum => sentenceDatum.))
            })
            map(v => {
                v.
                v?.
            })
            documentsrenderedSentenceTextDataTree

            map(flatten)
            map(document => {
                const s = new Set<OpenDocument>();
                if (document) {
                    s.add(document);
                }
                return s;
            }),
            shareReplay(1)
        );
        this.elementsInView$ = this.documentsInView$.pipe(
            switchMap(documentSet => {
                [...documentSet].map(document => document.renderedSentences$)
            })
        )
    }

    getHighlightElementsForWords(
        wordElementMaps: Dictionary<IAnnotatedCharacter[]>[],
        word: string
    ) {
        const results: IAnnotatedCharacter[] = [];
        for (let i = 0; i < wordElementMaps.length; i++) {
            const wordElementMap = wordElementMaps[i];
            if (wordElementMap[word]) {
                results.push(...wordElementMap[word]);
            }
        }
        return results;
    }
}