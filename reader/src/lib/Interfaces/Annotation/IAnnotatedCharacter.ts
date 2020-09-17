import {IPositionedWord} from "./IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";

export interface IAnnotatedCharacter {
    words: IPositionedWord[];
    char: string;
    element: XMLDocumentNode;
    maxWord: IPositionedWord | undefined;
    i: number;
    parent: AtomizedSentence;
}