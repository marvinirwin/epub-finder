import {BookSelectionRowInterface} from "./document-selection-row.interface";
import {TreeMenuNode} from "../../components/directory/tree-menu-node.interface";
import React, {useContext} from "react";
import {IconButton, ListItem} from "@material-ui/core";
import LocalLibrary from '@material-ui/icons/LocalLibrary';
import School from '@material-ui/icons/School';
import {ManagerContext} from "../../App";
import DeleteIcon from "@material-ui/icons/Delete";

export const toTreeMenuNode = ({belongsToCurrentUser ,name, reading, document_id, id}: BookSelectionRowInterface): TreeMenuNode => ({
    name,
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        // If we're reading, there's no button, just an icon
        return <ListItem className={'document-selection-row'}>
            {name}
            <div className={'document-selection-row-icon-container'}>
                {reading && <IconButton><LocalLibrary/></IconButton>}
                {/*
                    {open && <IconButton><LibraryAddCheck/></IconButton>}
    */}
                {!reading &&
                <IconButton onClick={() => m.settingsService.readingBook$.next(name)}><School/></IconButton>}
                {belongsToCurrentUser && <IconButton onClick={() => m.library.deleteDocument(id, document_id || id)}><DeleteIcon/></IconButton>}
                {/*
                    {!open && <IconButton onClick={() => {
                    }}><LibraryAdd/></IconButton>}
    */}
            </div>
        </ListItem>
    }
});