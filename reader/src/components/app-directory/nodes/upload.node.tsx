import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";
import {AttachFile} from "@material-ui/icons";
import { UPLOAD_LEARNING_MATERIAL } from "@shared/";


export function UploadNode(m: Manager) {
    return {
        name: UPLOAD_LEARNING_MATERIAL,
        action: () => m.modalService.fileUpload.open$.next(true),
        LeftIcon: () => <AttachFile/>,
        label: "Add learning material",
    } as TreeMenuNode;
}