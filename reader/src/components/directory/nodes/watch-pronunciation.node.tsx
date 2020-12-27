import {WatchMode} from "../modes/watch-mode.component";

export function WatchPronunciationNode() {
    return {
        name: 'watchPronunciation',
        ReplaceComponent: WatchMode
    };
}