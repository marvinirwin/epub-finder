import { Manager } from '../../lib/manager/Manager'
import { TextField } from '@material-ui/core'
import React from 'react'
import { observableLastValue } from '../../services/settings.service'

export function EditableHotkeyComponent({
    action,
    keyCombo,
    m,
}: {
    action: string
    keyCombo: string[] | undefined
    m: Manager
}) {
    return (
        <div style={{ flex: '1', minWidth: '100px', margin: '24px' }}>
            <TextField
                label={action}
                placeholder={action}
                value={(keyCombo || []).join('+')}
                onChange={async (e) => {
                    m.settingsService.hotkeys$.user$.next({
                        ...(await observableLastValue(
                            m.settingsService.hotkeys$.obs$,
                        )),
                        [action]: (e?.target?.value || '').split('+'),
                    })
                }}
            />
        </div>
    )
}
