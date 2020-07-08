import {IPositionedWord} from "./IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {AtomizedSentence} from "../../Atomize/AtomizedSentence";

export interface IAnnotatedCharacter {
    words: IPositionedWord[];
    char: string;
    el: XMLDocumentNode;
    maxWord: IPositionedWord | undefined;
    i: number;
    parent: AtomizedSentence;
}