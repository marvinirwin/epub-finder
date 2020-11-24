import {Manager} from "../../lib/Manager";
import {TextField} from "@material-ui/core";
import React from "react";
import {debounce} from 'lodash';

export function EditableHotkeyComponent({action, keyCombo, m}: { action: string, keyCombo: string[] | undefined, m: Manager }) {
    return <TextField
        label={action}
        placeholder={action}
        value={(keyCombo || []).join('+')}
        onChange={e => {
            m.settingsService.hotkeys$.next(
                {
                    ...m.settingsService.hotkeys$.getValue(),
                    [action]: e.target.value.split('+')
                }
            );
        }
        }
    />;
}