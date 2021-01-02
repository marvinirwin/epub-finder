import {IPositionedWord} from "../Annotation/IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {Segment} from "../../Atomized/segment";

export interface AtomMetadata {
    words: IPositionedWord[];
    char: string;
    element: XMLDocumentNode;
    maxWord: IPositionedWord | undefined;
    i: number;
    parent: Segment;
}