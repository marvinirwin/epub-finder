import {
    FormControlLabel,
    ListItem,
    Switch,
    TextField,
    Toolbar,
    Typography,
} from '@material-ui/core'
import { filterScheduleRows } from '@shared/'
import React, { useContext } from 'react'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'

export const QuizCardTableToolbar = () => {
    const m = useContext(ManagerContext)
    const filterValue =
        useObservableState(m.settingsService.scheduleTableWordFilterValue$.obs$) ||
        ''
    const showUncounted =
        useObservableState(m.settingsService.scheduleTableShowUncounted$.obs$) ||
        false
    const showUnderDue =
        useObservableState(m.settingsService.scheduleTableShowUnderDue$.obs$) ||
        false
    return (
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
                Progress
            </Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={showUncounted}
                        onChange={() =>
                            m.settingsService.scheduleTableShowUncounted$.user$.next(
                                !showUncounted,
                            )
                        }
                    />
                }
                label="Show rows with no count"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={showUnderDue}
                        onChange={() =>
                            m.settingsService.scheduleTableShowUnderDue$.user$.next(
                                !showUnderDue,
                            )
                        }
                    />
                }
                label="Show UnderDue records"
            />
            <TextField
                value={filterValue}
                onChange={(v) =>
                    m.settingsService.scheduleTableWordFilterValue$.user$.next(
                        v.target.value,
                    )
                }
                id={filterScheduleRows}
                label="Filter by Word"
            />
        </Toolbar>
    )
}
