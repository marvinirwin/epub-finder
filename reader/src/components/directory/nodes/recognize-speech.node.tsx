import {SpeakMode} from "../modes/speak-mode.component";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";
import {RecordRequest} from "../../../lib/Util/RecordRequest";
import {removePunctuation} from "../../../lib/highlighting/temporary-highlight.service";
import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {Mic, RecordVoiceOver} from "@material-ui/icons";
import {RECOGNIZE_SPEECH} from "@shared/";


export function RecognizeSpeechNode(m: Manager): TreeMenuNode {
    return {
        name: RECOGNIZE_SPEECH,
        LeftIcon: () => {
            const m = useContext(ManagerContext);
            const isRecording = useObservableState(m.audioRecordingService.audioRecorder.isRecording$);
            return <RecordVoiceOver color={isRecording ? 'primary' : 'disabled'}/>;
        },
        label: 'Speak',
        action: () => {
                const recordRequest = new RecordRequest(`Try reading one of the sentences below`);
                recordRequest.sentence.then(recognizedSentence => {
                    const word = removePunctuation(recognizedSentence);
                    m.pronunciationProgressService.addRecords$.next([{
                        word,
                        success: true,
                        timestamp: new Date()
                    }]);
                    // Add a highlight for each of these characters
                    m.highlighter.createdCards$.next(word.split(' '));
                })
                m.audioRecordingService.audioRecorder.recordRequest$.next(recordRequest)
            },

        props: {
            ref: ref => m.introService.trySpeakingRef$.next(ref)
        }
    };
}