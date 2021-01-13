import {TreeMenuNode} from "../tree-menu-node.interface";
import {SpeechPractice} from "../../speech-practice.component";
import React from "react";

export const SpeechPracticeNode: TreeMenuNode = {
    name: 'speech-practice',
    label: 'Speech Practice',
    Component: () => <SpeechPractice/>,
    moveDirectory: true
}