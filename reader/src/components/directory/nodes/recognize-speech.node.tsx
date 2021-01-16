import {SpeakMode} from "../modes/speak-mode.component";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function RecognizeSpeechNode(): TreeMenuNode {
    return {
        name: 'recognizeSpeech',
        LeftIcon: SpeakMode,
        label: 'Speak'
    };
}