import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { OpenDocument } from '../../lib/document-frame/open-document.entity'
import { EditableValue } from './editing-value'
import { FlashCardType, HiddenQuizFields, QuizCardField } from '../../lib/quiz/hidden-quiz-fields'
import { DocumentWordCount } from '../../../../server/src/shared/DocumentWordCount'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'
import { WavAudio } from '../../lib/audio/wav-audio'

export type QuizCard = {
    exampleSentenceOpenDocument: OpenDocument
    flashCardType$: Observable<FlashCardType>
    answerIsRevealed$: BehaviorSubject<boolean>
} & WordCard

export interface WordCard {
    word$: Observable<string | undefined>
    image$: EditableValue<string | undefined>
    description$: EditableValue<string | undefined>
    romanization$: Observable<string | undefined>
    translation$: Observable<string | undefined>
    audio$: Observable<WavAudio | undefined>
}
