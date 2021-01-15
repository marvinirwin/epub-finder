import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {KeyboardArrowRight, PlayArrow} from "@material-ui/icons";
import {Modes} from "../../../lib/Modes/modes.service";
import {useObservableState} from "observable-hooks";

export const WatchMode = ({...props}) => {
    const m = useContext(ManagerContext);
    const mode = useObservableState(m.modesService.mode$);
    const className = mode === Modes.VIDEO ?
        'video-mode-icon-on' :
        undefined
    return <ListItem button {...props}  ref={ref => m.introService.watchSentencesRef$.next(ref)} onClick={async () => {
        m.modesService.mode$.next(
            m.modesService.mode$.getValue() === Modes.VIDEO ?
                Modes.NORMAL :
                Modes.VIDEO
        );
    }}>
        <ListItemIcon>
            <PlayArrow id={'watch-mode-icon'} className={className}/>
        </ListItemIcon>
        <ListItemText primary={'Watch'}/>
    </ListItem>
};