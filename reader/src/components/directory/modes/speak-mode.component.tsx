import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Mic} from "@material-ui/icons";
import {useObservableState} from "observable-hooks";
import {RecordRequest} from "../../../lib/Interfaces/RecordRequest";
import {removePunctuation} from "../../../lib/Highlighting/temporary-highlight.service";

export const SpeakMode: React.FunctionComponent = ({...props}) => {
    const m = useContext(ManagerContext);
    const isRecording = useObservableState(m.audioManager.audioRecorder.isRecording$);
    const color = isRecording ?
        'green' :
        undefined
    return <ListItem {...props} button ref={ref => m.introService.trySpeakingRef$.next(ref)} onClick={() => {
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
        m.audioManager.audioRecorder.recordRequest$.next(recordRequest)
    } }>
        <ListItemIcon>
            <Mic color={isRecording ? 'primary' : 'disabled'}/>
        </ListItemIcon>
        <ListItemText>
            Speak
        </ListItemText>
    </ListItem>
}
