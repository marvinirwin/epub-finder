import React, { useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import { TextField } from '@material-ui/core'
import { newWordLimitInput } from '@shared/'
import { observableLastValue } from '../../services/settings.service'
import { Manager } from '../../lib/manager/Manager'
import * as _ from 'lodash'

const setQuizWordLimitDebounced = _.debounce((m: Manager, newLimit: number) => m.settingsService.newQuizWordLimit$.user$.next(newLimit), 1000)

export const SetQuizWordLimit = () => {
    const m = useContext(ManagerContext)
    const [quizWordLimitString, setQuizWordLimitString] = useState<string>('')
    const setNewWordQuizLimitSetting = (str: string) => setQuizWordLimitDebounced(m, parseInt(str, 10) || 0)
    useEffect(() => {
        observableLastValue(m.settingsService.newQuizWordLimit$.obs$)
            .then(r => setQuizWordLimitString(`${r}`))
    }, [])

    return (
        <TextField
            type='number'
            label={'new words per day'}
            variant={'filled'}
            value={quizWordLimitString}
            onChange={(e) => {
                setQuizWordLimitString(e.target.value || '')
                setNewWordQuizLimitSetting(e.target.value)
            }
            }
            inputProps={{
                shrink: 'true',
                id: newWordLimitInput,
            }}
        />
    )
}
