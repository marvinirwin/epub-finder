import {fromEvent, Observable} from "rxjs";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {createPopper} from "@popperjs/core";
import {VideoMetadataService} from "./video-metadata.service";
import {ModesService} from "../lib/Modes/modes.service";

export class sentenceMouseoverService {
    constructor(
        {
            atomizedSentences$,
            videoMetadataService
        }: {
            atomizedSentences$: Observable<AtomizedSentence[]>,
            videoMetadataService: VideoMetadataService,
            mode: ModesService
        }
        ) {
        atomizedSentences$.subscribe(atomizedSentences => {
            atomizedSentences.forEach(atomizedSentence => {
                atomizedSentence.getSentenceHTMLElement().onmouseenter = async (ev: MouseEvent) => {
                    atomizedSentence.getTranslation();
                };
                const showEvents = ['mouseenter', 'focus'];
                const hideEvents = ['mouseleave', 'blur'];
                const sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
                sentenceHTMLElement.classList.add('applied-sentence-listener');
                const popperHTMLElement = atomizedSentence.getPopperHTMLElement();
                if (!sentenceHTMLElement || !popperHTMLElement) {
                    throw new Error("Cannot find sentenceElement or popperElement")
                }
                try {
                    createPopper(sentenceHTMLElement, popperHTMLElement, {
                        placement: 'top-start',
                        // strategy: 'fixed'
                    });
                } catch (e) {
                    console.error(e);
                }

                const show = () => {
                    // this.videoSentence$.next(atomizedSentence.translatableText);
                    popperHTMLElement.setAttribute('data-show', '');
                }
                const hide = () => {
                    popperHTMLElement.removeAttribute('data-show');
                }

                showEvents.forEach(eventType => {
                    fromEvent(sentenceHTMLElement, eventType).subscribe(show)
                });

                hideEvents.forEach(eventType => {
                    fromEvent(sentenceHTMLElement, eventType).subscribe(hide)
                });
            });
        })
    }


}