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
                           items={readingProgress.knownSubSequences.map(({ word }) => word)}>
                {readingProgress.knownCount}
            </WrapInContext>
            /
            <WrapInContext onClick={clickedWord => m.wordCardModalService.word$.next(clickedWord)}
                           items={readingProgress.unknownSubSequences.map(({ word }) => word)}>
                {readingProgress.knownCount + readingProgress.unknownCount}
            </WrapInContext>
        </Fragment>
        }
    </>
}