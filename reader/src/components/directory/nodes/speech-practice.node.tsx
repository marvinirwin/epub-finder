import {TreeMenuNode} from "../tree-menu-node.interface";
import {SpeechPractice} from "../../speech-practice.component";
import React from "react";
import {Translate} from "@material-ui/icons";
import {SPEECH_PRACTICE} from '@shared/';

export const SpeechPracticeNode: TreeMenuNode = {
    name: SPEECH_PRACTICE ,
    label: 'Speech Practice',
    Component: () => <SpeechPractice/>,
    LeftIcon: () => <Translate/>,
    moveDirectory: true
}