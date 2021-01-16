import {TreeMenuNode} from "../tree-menu-node.interface";
import {SpeechPractice} from "../../speech-practice.component";
import React from "react";
import {Settings} from "@material-ui/icons";

export const SpeechPracticeNode: TreeMenuNode = {
    name: 'speech-practice',
    label: 'Speech Practice',
    Component: () => <SpeechPractice/>,
    LeftIcon: () => <Settings/>,
    moveDirectory: true
}