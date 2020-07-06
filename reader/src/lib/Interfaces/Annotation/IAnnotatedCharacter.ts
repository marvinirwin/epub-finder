import {IPositionedWord} from "./IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";

export interface IAnnotatedCharacter {
    words: IPositionedWord[];
    char: string;
    el: XMLDocumentNode;
    maxWord: IPositionedWord | undefined;
}