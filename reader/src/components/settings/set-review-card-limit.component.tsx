import React, { useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import { TextField } from '@material-ui/core'
import {newWordLimitInput, quizWordLimitInput} from 'languagetrainer-server/src/shared'
import { observableLastValue } from '../../services/settings.service'
import { Manager } from '../../lib/manager/Manager'
import * as _ from 'lodash'

const setReviewCardLimitDebounced = _.debounce((m: Manager, newLimit: number) => m.settingsService.newQuizWordLimit$.next(newLimit), 1000)

export const SetReviewCardLimit = () => {
    const m = useContext(ManagerContext)
    const [reviewCardLimitString, setReviewCardLimit] = useState<string>('')
    const setReviewLimitSetting = (str: string) => setReviewCardLimitDebounced(m, parseInt(str, 10) || 0)
    useEffect(() => {
        observableLastValue(m.settingsService.maxReviewsPerDay$)
            .then(r => setReviewCardLimit(`${r}`))
    }, [])

    return (
        <TextField
            type='number'
            label={'Maximum number of cards reviewed per day'}
            variant={'filled'}
            value={reviewCardLimitString}
            onChange={(e) => {
                setReviewCardLimit(e.target.value || '')
                setReviewLimitSetting(e.target.value)
            }
            }
            inputProps={{
                shrink: 'true',
                id: quizWordLimitInput,
            }}
        />
    )
}
