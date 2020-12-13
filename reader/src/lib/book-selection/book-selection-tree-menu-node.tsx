import {BookSelectionRowInterface} from "./book-selection-row.interface";
import {TreeMenuNode} from "../../components/directory/tree-menu-node.interface";
import React, {useContext} from "react";
import {IconButton, ListItem} from "@material-ui/core";
import LocalLibrary from '@material-ui/icons/LocalLibrary';
import School from '@material-ui/icons/School';
import {ManagerContext} from "../../App";

export const toTreeMenuNode = ({name, reading, open}: BookSelectionRowInterface): TreeMenuNode => ({
    name,
    Component: () => {
        const m = useContext(ManagerContext);
        // If we're reading, there's no button, just an icon
        return <ListItem>
            {name}
            {reading && <LocalLibrary/>}
            {/*
                    {open && <IconButton><LibraryAddCheck/></IconButton>}
    */}
            {!reading &&
            <IconButton onClick={() => m.settingsService.readingBook$.next(name)}><School/></IconButton>}
            {/*
                    {!open && <IconButton onClick={() => {
                    }}><LibraryAdd/></IconButton>}
    */}
        </ListItem>
    }
});