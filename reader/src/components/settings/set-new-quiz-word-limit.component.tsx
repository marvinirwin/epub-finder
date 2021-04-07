import React, { useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { TextField } from '@material-ui/core'
import { newWordLimitInput } from '@shared/'
import { useDebouncedFn } from 'beautiful-react-hooks'

export const SetQuizWordLimit = () => {
    const m = useContext(ManagerContext)
    const [quizWordLimitString, setQuizWordLimitString] = useState('')
    const settingsQuizWordLimit = `${useObservableState(m.settingsService.newQuizWordLimit$)}`
    const setNewWordQuizLimitSetting = useDebouncedFn(
        (str: string) => {
            if (str !== settingsQuizWordLimit) {
                m.settingsService.newQuizWordLimit$.next(parseInt(str, 10) || 0)
            }
        },
        10
    );
    useEffect(() => {
            const shouldSetQuizWordLimit = settingsQuizWordLimit && settingsQuizWordLimit !== quizWordLimitString
            if (shouldSetQuizWordLimit) {
                setQuizWordLimitString(settingsQuizWordLimit)
            }
        },
        [settingsQuizWordLimit],
    )
    useEffect(() => {
        setNewWordQuizLimitSetting(quizWordLimitString);
    }, [quizWordLimitString])

    return (
        <TextField
            type='number'
            label={'new words per day'}
            variant={'filled'}
            value={quizWordLimitString}
            onChange={(e) =>
                setQuizWordLimitString(e.target.value || '')
            }
            inputProps={{
                shrink: 'true',
                id: newWordLimitInput,
            }}
        />
    )
}
