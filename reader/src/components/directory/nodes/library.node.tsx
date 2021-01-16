import React from "react";
import {LibraryBooks} from "@material-ui/icons";
import {Manager} from "../../../lib/Manager";

export function LibraryNode(m: Manager) {
    return {
        name: 'library',
        label: 'Library',
        LeftIcon: () => <LibraryBooks/>,
        action: () => m.modalService.documentSelect.open$.next(true)
    };
}