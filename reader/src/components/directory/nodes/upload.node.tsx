import {FileChooser} from "../file-chooser.component";
import React from "react";

export function uploadNode() {
    return {
        name: 'customDocument',
        ReplaceComponent: () => <FileChooser/>,
    };
}