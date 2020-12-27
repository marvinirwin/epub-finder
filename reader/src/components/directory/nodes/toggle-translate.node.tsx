import {ToggleTranslate} from "../toggle-translate";
import React from "react";

export function ToggleTranslateNode() {
    return {
        name: 'translate',
        ReplaceComponent: () => <ToggleTranslate/>
    };
}