import React, {useContext, useState} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {flatten} from "lodash";
import {SignupLogin} from "../directory/nodes/signup-login.component";
import {priorityMouseoverHighlightWord} from "../../lib/manager/cards.repository";

export const ManualTestModal = () => {
    const m = useContext(ManagerContext);
    const manualIsRecording = useObservableState(m.settingsService.manualIsRecording$) || false;
    const [speechRecInput, setSpeechRecInput] = useState<HTMLInputElement | null>();
    const [manualMouseoverHighlight, setManualMouseoverHighlight] = useState<HTMLInputElement | null>()
    const segments = useObservableState(m.openDocumentsService.displayDocumentTabulation$)?.segments || [];
    const nodes = flatten(segments.map(segment => [...segment.getSentenceHTMLElement().children])) as HTMLElement[];
    return <div>
        <SignupLogin/>
        <input id='manual-is-recording' type="check" checked={manualIsRecording}/>
        <input id='manual-speech-recognition-input' ref={setSpeechRecInput}/>
        <button id='submit-manual-speech-recognition' onClick={
            () => m.pronunciationProgressService.addRecords$.next([
                    {
                        word: speechRecInput?.value || '',
                        success: true,
                        timestamp: new Date()
                    }
                ]
            )
        }>Submit manual speech recognition
        </button>
        <button id='clear-speech-recognition-rows'
                onClick={() => m.pronunciationProgressService.clearRecords$.next()}>
            Clear speech recognition rows
        </button>
        <button
            id={'manual-mouseover-highlight-button'}
            onClick={() => {
                const atomMetadata = m.elementAtomMetadataIndex.metadataForElement(
                    nodes[parseInt(manualMouseoverHighlight?.value as string)]
                );
                if (atomMetadata) {
                    m.mousedOverWordHighlightService.mousedOverWord$.next(
                        priorityMouseoverHighlightWord({atomMetadata, cardsRepository: m.cardsRepository})?.learningLanguage || ''
                    )
                }

            }}
        />
        <input
            id={'manual-mouseover-highlight-coordinates'}
            ref={setManualMouseoverHighlight}
        />
    </div>
};