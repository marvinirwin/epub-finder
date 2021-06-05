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
            &nbsp;
            <WrapInContext onClick={clickedWord => m.wordCardModalService.word$.next(clickedWord)}
                           items={readingProgress.uniqueKnown}>
                <Typography style={{color: 'white'}} variant='subtitle2'>{readingProgress.uniqueKnownCount}</Typography>
            </WrapInContext>
            &nbsp;
            /
            &nbsp;
            <WrapInContext onClick={clickedWord => m.wordCardModalService.word$.next(clickedWord)}
                           items={readingProgress.uniqueUnknown}>
                <Typography style={{color: 'white'}} variant='subtitle2'>{readingProgress.uniqueKnownCount + readingProgress.uniqueUnknownCount}</Typography>
            </WrapInContext>
        </Fragment>
        }
    </>
}