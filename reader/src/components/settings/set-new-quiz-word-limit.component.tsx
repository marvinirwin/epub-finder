import React, { useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import { useObservable, useObservableState, useSubscription } from 'observable-hooks'
import { TextField } from '@material-ui/core'
import { newWordLimitInput } from '@shared/'
import { useDebouncedFn } from 'beautiful-react-hooks'
import { take } from 'rxjs/internal/operators/take'

export const SetQuizWordLimit = () => {
    const m = useContext(ManagerContext)
    const initialQuizWordLimit$ = useObservable(() => m.settingsService.newQuizWordLimit$.pipe(take(1)))
    const [quizWordLimitString, setQuizWordLimitString] = useState<string>('')
    useSubscription(initialQuizWordLimit$, (n) => {
        setQuizWordLimitString(`${n}`)
    })
    const setNewWordQuizLimitSetting = useDebouncedFn(
        (str: string) => {
            m.settingsService.newQuizWordLimit$.next(parseInt(str, 10) || 0)
        },
        10,
    )
    useEffect(() => {
        setNewWordQuizLimitSetting(quizWordLimitString)
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
