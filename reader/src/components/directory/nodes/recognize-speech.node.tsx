import {SpeakMode} from "../modes/speak-mode.component";

export function RecognizeSpeechNode() {
    return {
        name: 'recognizeSpeech',
        ReplaceComponent: SpeakMode
    };
}