import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import React, { Fragment, useContext } from 'react'
import { Typography } from '@material-ui/core'
import { WrapInContext } from '../quiz/wrap-in-menu'

export const ProgressBar = () => {
    const m = useContext(ManagerContext)
    const readingProgress = useObservableState(m.readingProgressService.readingProgressRecords$)?.[0]
    return <>
        {readingProgress && <Fragment>
            <Typography variant='subtitle1'>
                {readingProgress.label}
            </Typography>
            <WrapInContext onClick={clickedWord => m.wordCardModalService.word$.next(clickedWord)}
                           items={readingProgress.uniqueKnown}>
                {readingProgress.uniqueKnownCount}
            </WrapInContext>
            /
            <WrapInContext onClick={clickedWord => m.wordCardModalService.word$.next(clickedWord)}
                           items={readingProgress.uniqueUnknown}>
                {readingProgress.uniqueKnownCount + readingProgress.uniqueUnknownCount}
            </WrapInContext>
        </Fragment>
        }
    </>
}