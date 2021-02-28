import {ds_Dict} from "../../lib/delta-scan/delta-scan.module";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";
import {ListItemIcon} from "@material-ui/core";
import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';

export const AvailableDocuments: React.FunctionComponent<{ availableDocuments: ds_Dict<boolean>, onCheckout: (s: string) => void}> = ({availableDocuments, onCheckout}) => {
    return <List
        component="nav"
        subheader={
            <ListSubheader component="h3" id="nested-list-subheader">
                Documents Available
            </ListSubheader>
        }
    >
        {Object.entries(availableDocuments).map(([title]) =>
            <ListItem button key={title} onClick={() => onCheckout(title)}>
                <ListItemIcon>
                    <PlayListAddIcon />
                </ListItemIcon>
                <ListItemText primary={title}/>
            </ListItem>
        )}
    </List>
}