import {FileChooser} from "../file-chooser.component";
import React from "react";

export function UploadeNode() {
    return {
        name: 'customDocument',
        ReplaceComponent: () => <FileChooser/>,
    };
}