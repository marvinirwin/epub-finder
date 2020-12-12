import {Manager} from "../../lib/Manager";
import {ds_Tree} from "../../services/tree.service";
import Highlight from '@material-ui/icons/Highlight';
import RecordVoiceOver from '@material-ui/icons/RecordVoiceOver';
import {Modes} from "../../lib/Modes/modes.service";
import React from "react";
import {PlayArrow} from "@material-ui/icons";
import {useObservableState} from "observable-hooks";
import {WatchMode} from "./modes/watch-mode.component";
import {SpeakMode} from "./modes/speak-mode.component";

export const ModeDirectory = (m: Manager): { [nodeLabel: string]: ds_Tree<TreeMenuNode> } => {
    return Object.fromEntries(
        [
        ].map(([name, Component]) => [
                name,
                {
                    nodeLabel: name,
                    value: {
                        name,
                        ReplaceComponent: Component
                    }
                }
            ]
        )
    )

}
