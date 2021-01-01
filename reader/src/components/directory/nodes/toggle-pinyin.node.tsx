import {ToggleTranslate} from "../toggle-translate";
import React from "react";
import {TogglePinyin} from "../toggle-pinyin";

export function TogglePinyinNode() {
    return {
        name: 'toggle-pinyin',
        ReplaceComponent: () => <TogglePinyin/>
    };
}