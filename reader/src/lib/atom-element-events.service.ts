import {merge, Subject} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Modes, ModesService} from "./modes/modes.service";
import {OpenDocumentsService} from "./manager/open-documents.service";
import {ds_Dict, flattenTree} from "./delta-scan/delta-scan.module";
import {XMLDocumentNode} from "../../../server/src/shared/XMLDocumentNode";
import {PronunciationVideoService} from "../components/pronunciation-video/pronunciation-video.service";
import {BrowserInputs} from "./hotkeys/browser-inputs";
import {debounce, flatten, maxBy} from "lodash";
import {Highlighter} from "./highlighting/Highlighter";
import {ElementAtomMetadataIndex} from "../services/element-atom-metadata.index";
import {Segment} from "@shared/";
import CardsRepository, {priorityMouseoverHighlightWord} from "./manager/cards.repository";
import {VideoMetadataRepository} from "../services/video-metadata.repository";
import {MousedOverWordHighlightService} from "./highlighting/moused-over-word-highlight.service";

const addHighlightedWord = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)

export class AtomElementEventsService {

    constructor(
        {
            openDocumentsService,
            modesService,
            highlighter,
            pronunciationVideoService,
            browserInputs,
            elementAtomMetadataIndex,
            cardsRepository,
            videoMetadataRepository,
            mousedOverWordHighlightService
        }:
            {
                openDocumentsService: OpenDocumentsService
                modesService: ModesService,
                highlighter: Highlighter,
                pronunciationVideoService: PronunciationVideoService,
                browserInputs: BrowserInputs,
                elementAtomMetadataIndex: ElementAtomMetadataIndex,
                cardsRepository: CardsRepository,
                videoMetadataRepository: VideoMetadataRepository,
                mousedOverWordHighlightService: MousedOverWordHighlightService
            }
    ) {
        const applyListener = (element: HTMLElement) => {
            element.classList.add("applied-word-element-listener");

            const mode = () => modesService.mode$.getValue();

            function highestPriorityMouseoverCard() {
                const atomMetadata = elementAtomMetadataIndex.metadataForElement(element);
                if (atomMetadata) {
                    return priorityMouseoverHighlightWord({atomMetadata, cardsRepository})
                }
            }

            element.onmouseenter = ev => {
                addHighlightedWord(
                    mousedOverWordHighlightService.mousedOverWord$,
                    highestPriorityMouseoverCard()?.learningLanguage ||
                    element.textContent as string
                );
            }
            element.onmouseleave = (ev) => {
                addHighlightedWord(
                    mousedOverWordHighlightService.mousedOverWord$,
                    highestPriorityMouseoverCard()?.learningLanguage ||
                    element.textContent as string
                );
            }

            element.onclick = ev => {
                switch (mode()) {
                    case Modes.VIDEO:
                        const atomMetadata = elementAtomMetadataIndex.metadataForElement(element)
                        const wordWithVideoData = atomMetadata
                            .words
                            .find(word => videoMetadataRepository.all$.getValue().get(word.word))
                        if (!wordWithVideoData) {
                            return;
                        }
                        browserInputs.videoCharacterIndex$.next(0);
                        pronunciationVideoService.videoSentence$.next(wordWithVideoData.word);
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
                        shareReplay(1)
                    );
            }),
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
