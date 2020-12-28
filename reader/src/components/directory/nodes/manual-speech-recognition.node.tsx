import React, {useContext, useState} from "react";
import {TESTING} from "../app-directory-service";
import {ManagerContext} from "../../../App";

export function ManualSpeechRecognitionNode() {
    return {
        name: 'manual-speech-recognition',
        hidden: !TESTING,
        ReplaceComponent: () => {
            const m = useContext(ManagerContext);
            const [speechRecInput, setSpeechRecInput] = useState<HTMLInputElement | null>();
            return <div>
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
                }/>
                <button id='clear-speech-recognition-rows' onClick={() => m.pronunciationProgressService.clearRecords$.next()}/>
            </div>
        }
    }
}
