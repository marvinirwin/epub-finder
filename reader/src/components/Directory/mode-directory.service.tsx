import {Manager} from "../../lib/Manager";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {ds_Tree} from "../../services/tree.service";
import Highlight from '@material-ui/icons/Highlight';
import RecordVoiceOver from '@material-ui/icons/RecordVoiceOver';
import {Modes} from "../../lib/Modes/modes.service";
import React from "react";
import {PlayArrow} from "@material-ui/icons";
import {useObservableState} from "observable-hooks";
import {RecordRequest} from "../../lib/Interfaces/RecordRequest";

export const ModeDirectory = (m: Manager): { [nodeLabel: string]: ds_Tree<TreeMenuNode> } => {

    const VideoSelect: React.FC = () =>  {
        const mode = useObservableState(m.modes.mode$);
        if (mode === Modes.VIDEO) {
            return <PlayArrow htmlColor={'#3d5afe'}/>;
        }
        return <PlayArrow/>;
    }

    const HighlightMode: React.FC = () => {
        const mode = useObservableState(m.modes.mode$);
        if (mode === Modes.HIGHLIGHT) {
            return <Highlight htmlColor={'#ccff00'}/>;
        }
        return <Highlight/>;
    }

    const SpeakMode: React.FC = () => {
        const isRecording = useObservableState(m.audioManager.audioRecorder.isRecording$)
        if (isRecording) {
            return <RecordVoiceOver htmlColor={'#CD0000'}/>;
        }
        return <RecordVoiceOver/>;
    }


    return Object.fromEntries(
        [
            ['Video', () => {
                m.modes.mode$.next(Modes.VIDEO);
            }, "Watch sentence", <VideoSelect/>],
            ['Highlight', () => {
                m.modes.mode$.next(Modes.HIGHLIGHT);
            }, "Highlight words", <HighlightMode/>],
            ['Speaking', () => {
                const recordRequest = new RecordRequest(``);
                recordRequest.sentence.then(recognizedSentence => {
                    // Add a highlight for each of these characters
                    m.highlighter.createdCards$.next(recognizedSentence.split(' '));
                })
                m.audioManager.audioRecorder.recordRequest$.next(
                    recordRequest
                )
            }, "Speak", <SpeakMode/>]
        ].map(([name, action, label, LeftIcon]) => [
                name, {
                    nodeLabel: name,
                    value: {
                        name,
                        label,
                        LeftIcon,
                        action
                    }
                }
            ]
        )
    )

}
