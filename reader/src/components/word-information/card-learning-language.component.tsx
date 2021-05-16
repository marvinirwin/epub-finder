import { Variant } from '@material-ui/core/styles/createTypography'
import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { Button, Typography } from '@material-ui/core'
import { quizCardLearningLanguage } from '@shared/'

export const CardLearningLanguageText = ({ word, variant }: { word: string, variant?: Variant }) => {
    const m = useContext(ManagerContext)
    return (
        <Button
            onClick={() => m.wordCardModalService.word$.next(word)}
            className={quizCardLearningLanguage}
        >
            <Typography variant={variant || 'h1'}>{word || ''}</Typography>
        </Button>
    )
}