import {BehaviorSubject, Observable, Subject} from "rxjs";
import {OpenDocument} from "../../lib/document-frame/open-document.entity";
import {EditableValue} from "./editing-value";
import {HiddenQuizFields} from "./hidden-quiz-fields";

export interface QuizCard {
    exampleSentenceOpenDocument: OpenDocument
    word$: Observable<string | undefined>,
    image$: EditableValue<string | undefined>
    description$: EditableValue<string | undefined>
    romanization$: Observable<string | undefined>,
    translation$: Observable<string | undefined>
    hiddenFields$: Observable<HiddenQuizFields>
    hasBeenAnswered$: BehaviorSubject<boolean>
}