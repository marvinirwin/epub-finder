import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Mic} from "@material-ui/icons";
import {useObservableState} from "observable-hooks";
import {RecordRequest} from "../../../lib/Util/RecordRequest";
import {removePunctuation} from "../../../lib/highlighting/temporary-highlight.service";

export const SpeakMode: React.FunctionComponent = ({...props}) => {
    return <ListItem {...props} button  >
        <ListItemIcon>

        </ListItemIcon>
        <ListItemText>
            Speak
        </ListItemText>
    </ListItem>
}
