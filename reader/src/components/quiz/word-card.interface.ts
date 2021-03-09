import {BehaviorSubject, Observable, Subject} from "rxjs";
import {OpenDocument} from "../../lib/document-frame/open-document.entity";
import {EditableValue} from "./editing-value";
import {HiddenQuizFields} from "../../lib/hidden-quiz-fields";
import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import {WordRecognitionRow} from "../../lib/schedule/word-recognition-row";

export type QuizCard =   {
    exampleSentenceOpenDocument: OpenDocument
    hiddenFields$: Observable<HiddenQuizFields>
    answerIsRevealed$: BehaviorSubject<boolean>
} & WordCard;

export interface WordCard {
    word$: Observable<string | undefined>,
    image$: EditableValue<string | undefined>
    description$: EditableValue<string | undefined>
    romanization$: Observable<string | undefined>,
    translation$: Observable<string | undefined>,
}
