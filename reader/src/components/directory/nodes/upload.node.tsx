import {FileChooser} from "../file-chooser.component";
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";
import { Settings } from "@material-ui/icons";

export function uploadNode(m: Manager) {
    return {
        name: 'uploadLearningMaterial',
        action: () => m.modalService.fileUpload.open$.next(true),
        LeftIcon: () => <Settings/>,
        label: "Upload",
    } as TreeMenuNode;
}