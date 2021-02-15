import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {KeyboardArrowRight, PlayArrow} from "@material-ui/icons";
import {Modes} from "../../../lib/modes/modes.service";
import {useObservableState} from "observable-hooks";

export const WatchMode = ({...props}) => {
    return <ListItem button {...props}
                     >
        <ListItemIcon>
        </ListItemIcon>
        <ListItemText primary={'Watch'}/>
    </ListItem>
};