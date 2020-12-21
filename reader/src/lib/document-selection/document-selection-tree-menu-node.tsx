import {DocumentSelectionRowInterface} from "./document-selection-row.interface";
import {TreeMenuNode} from "../../components/directory/tree-menu-node.interface";
import React, {useContext, useState} from "react";
import {IconButton, ListItem} from "@material-ui/core";
import LocalLibrary from '@material-ui/icons/LocalLibrary';
import School from '@material-ui/icons/School';
import {ManagerContext} from "../../App";
import DeleteIcon from "@material-ui/icons/Delete";

export const toTreeMenuNode = ({
                                   belongsToCurrentUser,
                                   name,
                                   reading,
                                   document_id
                               }: DocumentSelectionRowInterface): TreeMenuNode => ({
    name,
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        return <ListItem className={'document-selection-row'} key={Math.random()}>
            {name}
            <div className={'document-selection-row-icon-container'}>
                {reading && <IconButton><LocalLibrary/></IconButton>}
                {!reading &&
                <IconButton onClick={() => m.settingsService.readingDocument$.next(name)}><School/></IconButton>}
                {belongsToCurrentUser && <IconButton onClick={() => m.library.deleteDocument(
                    document_id,
                )}><DeleteIcon/></IconButton>}
            </div>
        </ListItem>
    }
});