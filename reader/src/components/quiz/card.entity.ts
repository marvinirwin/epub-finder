import {OpenDocument} from "../../lib/DocumentFrame/OpenDocument";
import {Observable} from "rxjs";

export interface CardEntity {
    openDocument: OpenDocument;
    exampleSentences$: Observable<string[]>
}