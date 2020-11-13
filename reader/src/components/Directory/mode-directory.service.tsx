import {Manager} from "../../lib/Manager";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {ds_Tree} from "../../services/tree.service";
import Highlight from '@material-ui/icons/Highlight';
import RecordVoiceOver from '@material-ui/icons/RecordVoiceOver';
import {Modes} from "../../lib/Modes/modes.service";
import React from "react";
import {PlayArrow} from "@material-ui/icons";

export const ModeDirectory = (m: Manager): { [nodeLabel: string]: ds_Tree<TreeMenuNode> } => {
    const modes = [
        ['Video', () => m.modes.mode$.next(Modes.VIDEO), "Watch sentence", <PlayArrow/>],
        ['Highlight', () => m.modes.mode$.next(Modes.HIGHLIGHT), "Highlight words", <Highlight/>],
        ['Speaking', () => m.modes.mode$.next(Modes.SPEAKING), "Speak", <RecordVoiceOver/>]
    ]

    return Object.fromEntries(
        modes.map(([name, action, label, LeftIcon]) => [
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
