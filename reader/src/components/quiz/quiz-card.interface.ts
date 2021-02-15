import {Observable, Subject} from "rxjs";
import {OpenDocument} from "../../lib/document-frame/open-document.entity";
import {EditableValue} from "./editing-value";

export interface QuizCard {
    exampleSentenceOpenDocument: OpenDocument
    word$: Observable<string | undefined>,
    image$: EditableValue<string | undefined>
    description$: EditableValue<string | undefined>
}