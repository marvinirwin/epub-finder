import React, {useContext, useState} from "react";
import {TESTING} from "../app-directory-service";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function ManualSpeechRecognitionNode(): TreeMenuNode {
    return {
        name: 'manual-speech-recognition',
        hidden: !TESTING,
        label: 'Manual Speech Rec',
        LeftIcon: () => {
            const m = useContext(ManagerContext);
            const manualIsRecording = useObservableState(m.settingsService.manualIsRecording$) || false;
            const [speechRecInput, setSpeechRecInput] = useState<HTMLInputElement | null>();
            return <div>
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
            </div>
        }
    }
}
