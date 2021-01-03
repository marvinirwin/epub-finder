import {merge, Subject} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Modes, ModesService} from "./Modes/modes.service";
import {OpenDocumentsService} from "./Manager/open-documents.service";
import {ds_Dict, flattenTree} from "./Tree/DeltaScanner";
import {XMLDocumentNode} from "./Interfaces/XMLDocumentNode";
import {PronunciationVideoService} from "../components/PronunciationVideo/pronunciation-video.service";
import {BrowserInputs} from "./Hotkeys/BrowserInputs";
import {debounce, flatten} from "lodash";
import {Highlighter} from "./Highlighting/Highlighter";
import {AggregateElementIndexService} from "../services/aggregate-element-index.service";
import {Segment} from "./Atomized/segment";

const addHighlightedWord = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)

export class AtomElementEventsService {

    constructor(
        {
            openDocumentsService,
            modesService,
            highlighter,
            pronunciationVideoService,
            browserInputs,
            aggregateElementIndexService
        }:
            {
                openDocumentsService: OpenDocumentsService
                modesService: ModesService,
                highlighter: Highlighter,
                pronunciationVideoService: PronunciationVideoService,
                browserInputs: BrowserInputs,
                aggregateElementIndexService: AggregateElementIndexService
            }
    ) {
        const applyListener = (element: HTMLElement) => {
            const maxWord = () => aggregateElementIndexService.aggregateIndex$.getValue().get(element as unknown as XMLDocumentNode)?.maxWord;
            const mode = () => modesService.mode$.getValue();
            element.classList.add("applied-word-element-listener");
            element.onmouseenter = ev => {
                addHighlightedWord(highlighter.mousedOverWord$, maxWord()?.word);
            }
            element.onmouseleave = (ev) => {
                addHighlightedWord(highlighter.mousedOverWord$, maxWord()?.word);
            }

            element.onclick = ev => {
                switch (mode()) {
                    case Modes.VIDEO:
                        const metadata = aggregateElementIndexService.aggregateIndex$.getValue().get(element as unknown as XMLDocumentNode);
                        browserInputs.videoCharacterIndex$.next(metadata?.i);
                        pronunciationVideoService.videoSentence$.next(
                            metadata?.parent?.translatableText
                        );
                        break;
                    default:
                }
            }
        }
        openDocumentsService.openDocumentTree
            .mapWith(openDocument => {
                return openDocument.renderedSegments$;
            })
            .updates$.pipe(
            switchMap(({sourced}) => {
                return merge(...(flattenTree(sourced)))
                    .pipe(
                        map(segmentMap => [segmentMap]),
                        shareReplay(1)
                    );
            }),
            map((segmentDicts: ds_Dict<Segment[]>[]): Segment[] => {
                    return flatten(segmentDicts.map(segmentDict => flatten(Object.values(segmentDict))));
                }
            ),
            map((segments: Segment[]) => {
                    return new Set(
                        flatten(
                            segments
                                .map(segment => [...segment.getSentenceHTMLElement().children] as HTMLElement[])
                        )
                    );
                }
            )
        ).subscribe(elements => {
            elements.forEach(element => applyListener(element));
        });

    }

}

/**
 * When called on an <iframe> that is not displayed (eg. where display: none is set) Firefox will return null,
 * whereas other browsers will return a Selection object with Selection.type set to None.
 */
/*
                if ((ev as MouseEvent).shiftKey || mode === Modes.HIGHLIGHT) {
                    const selection = (annotationElement.element.ownerDocument as Document).getSelection();
                    if (selection?.anchorNode === child.parentElement) {
                        selection.extend(child, 1);
                    } else {
                        selection?.removeAllRanges();
                        const range = document.createRange();
                        range.selectNode(child);
                        selection?.addRange(range);
                    }
                }
*/
