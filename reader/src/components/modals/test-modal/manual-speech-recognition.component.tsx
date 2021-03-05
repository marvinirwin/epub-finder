import React, {useContext, useState} from "react";
import {ManagerContext} from "../../../App";

export const ManualSpeechRecognition = () => {
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
        }>Submit manual speech recognition
        </button>
    </div>
}