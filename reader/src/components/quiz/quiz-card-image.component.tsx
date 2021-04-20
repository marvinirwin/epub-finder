import { EditableOnClick } from './editable-image.component'
import React, { useContext } from 'react'
import { useObservableState } from 'observable-hooks'
import { WordCard } from './word-card.interface'
import { ManagerContext } from '../../App'
import { observableLastValue } from '../../services/settings.service'
import { Button, Typography } from '@material-ui/core'
import { quizCardImage, selectQuizCardImageButton } from '@shared/'
import { useTutorialPopOver } from '../tutorial-popover/tutorial-popper.component'

export function CardImage({ quizCard }: { quizCard: WordCard }) {
    const quizCardImageSource = useObservableState(quizCard.image$.value$)
    /*
    const isImageHidden = useIsFieldHidden({quizCard, label: 'picture'})
*/
    const m = useContext(ManagerContext)
    const [setRef, TutorialPopOver] = useTutorialPopOver('selectCardImage', 'Find a picture to help stick the word in your memory')
    return (
        <EditableOnClick
            onEditClicked={async () => {
                const searchTerm = await observableLastValue(quizCard.word$)
                if (searchTerm) {
                    m.imageSearchService.queryImageRequest$.next({
                        term: searchTerm,
                        cb: (v) => quizCard.image$.set(v),
                    })
                }
            }}
        >
            {quizCardImageSource ? (
                <img className={quizCardImage} src={quizCardImageSource} />
            ) : (
                <>
                    <Button
                        id={selectQuizCardImageButton}
                        style={{ margin: '24px' }}
                        ref={setRef}
                    >
                        <Typography>Select Photo</Typography>
                    </Button>
                    <TutorialPopOver />
                </>
            )}
        </EditableOnClick>
    )
}
