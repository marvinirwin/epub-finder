import {ds_Dict} from "../../lib/Tree/DeltaScanner";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";
import {ListItemIcon} from "@material-ui/core";
import PlayListAddIcon from '@material-ui/icons/PlaylistAdd';

export const AvailableBooks: React.FunctionComponent<{ availableBooks: ds_Dict<boolean>, onCheckout: (s: string) => void}> = ({availableBooks, onCheckout}) => {
    return <List
        component="nav"
        subheader={
            <ListSubheader component="h3" id="nested-list-subheader">
                Books Available
            </ListSubheader>
        }
    >
        {Object.entries(availableBooks).map(([title]) =>
            <ListItem button key={title} onClick={() => onCheckout(title)}>
                <ListItemIcon>
                    <PlayListAddIcon />
                </ListItemIcon>
                <ListItemText primary={title}/>
            </ListItem>
        )}
    </List>
}