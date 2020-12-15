import {Manager} from "../../lib/Manager";
import {TextField} from "@material-ui/core";
import React from "react";
import {debounce} from 'lodash';
import {observableLastValue} from "../../services/settings.service";

export function EditableHotkeyComponent({action, keyCombo, m}: { action: string, keyCombo: string[] | undefined, m: Manager }) {
    return <TextField
        label={action}
        placeholder={action}
        value={(keyCombo || []).join('+')}
        onChange={async e => {
            m.settingsService.hotkeys$.next(
                {
                    ...await observableLastValue(m.settingsService.hotkeys$),
                    [action]: e.target.value.split('+')
                }
            );
        }
        }
    />;
}