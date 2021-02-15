import {TreeMenuNode} from "../tree-menu-node.interface";
import {Modes} from "../../../lib/modes/modes.service";
import {Manager} from "../../../lib/Manager";
import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {PlayArrow} from "@material-ui/icons";
import {WATCH_PRONUNCIATION} from "@shared/";


export function WatchPronunciationNode(m: Manager): TreeMenuNode {
    return {
        name: WATCH_PRONUNCIATION,
        LeftIcon: () => {
            const m = useContext(ManagerContext);
            const mode = useObservableState(m.modesService.mode$);
            const className = mode === Modes.VIDEO ?
                'video-mode-icon-on' :
                undefined
            return <PlayArrow
                id={'watch-mode-icon'}
                className={className}
            />
        },
        action: async () => {
            m.modesService.mode$.next(
                m.modesService.mode$.getValue() === Modes.VIDEO ?
                    Modes.NORMAL :
                    Modes.VIDEO
            );
        },
        props: {
            ref: ref => m.introService.watchSentencesRef$.next(ref)
        },
        label: `Watch`
    };
}