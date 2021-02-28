import React from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {ds_Dict} from "../../lib/delta-scan/delta-scan.module";
import DeleteIcon from '@material-ui/icons/Delete';
import {ListItemIcon} from "@material-ui/core";
import PlayListAddIcon from "@material-ui/icons/PlaylistAdd";


export const CheckedOutDocuments: React.FunctionComponent<{ checkedOutDocuments: ds_Dict<boolean>, onReturn: (s: string) => void }> = (
    {
        checkedOutDocuments,
        onReturn
    }
) => {
    return (
        <List
            component="nav"
            subheader={
                <ListSubheader component="h3" id="nested-list-subheader">
                    Documents Checked Out
                </ListSubheader>
            }
        >
            {Object.entries(checkedOutDocuments).map(([title]) =>
                <ListItem button key={title} onClick={e => onReturn(title)}>
                    <ListItemIcon>
                        <DeleteIcon/>
                    </ListItemIcon>
                    <ListItemText primary={title}/>
                </ListItem>
            )}
        </List>
    );
}
