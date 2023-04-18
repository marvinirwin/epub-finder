import { EditableOnClick } from './editable-image.component'
import React, { useContext } from 'react'
import { useObservableState } from 'observable-hooks'
import { WordCard } from './word-card.interface'
import { ManagerContext } from '../../App'
import { Button, Typography } from '@material-ui/core'
import { quizCardImage, selectQuizCardImageButton } from '@shared/'
import { useTutorialPopOver } from '../tutorial-popover/tutorial-popper.component'
import Image from 'material-ui-image';
import {observableLastValue} from "../../services/observableLastValue";

export function CardImage({ wordInfo }: { wordInfo: WordCard }) {
    const quizCardImageSource = useObservableState(wordInfo.image$.value$)
    const m = useContext(ManagerContext)
    const [setRef, TutorialPopOver] = useTutorialPopOver('selectCardImage', 'Find a picture to help stick the word in your memory')
    return (
        <EditableOnClick
            onEditClicked={async () => {
                const searchTerm = await observableLastValue(wordInfo.word$)
                if (searchTerm) {
                    m.imageSearchService.queryImageCallback$.next(image => {
                        wordInfo.image$.set(image)
                    })
                    m.imageSearchService.queryImageRequest$.next(searchTerm)
                }
                m.modalService.imageSearch.open$.next(true);
            }}
        >
            {quizCardImageSource ? (
                <Image className={quizCardImage} src={quizCardImageSource}  aspectRatio={undefined}/>
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
