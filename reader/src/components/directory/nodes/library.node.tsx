import React from "react";
import {LibraryBooks} from "@material-ui/icons";
import {Manager} from "../../../lib/Manager";
import { LIBRARY } from "@shared/";

export const LibraryNode = (m: Manager) => ({
    name: LIBRARY,
    label: 'Library',
    LeftIcon: () => <LibraryBooks/>,
    action: () => m.modalService.documentSelect.open$.next(true)
});