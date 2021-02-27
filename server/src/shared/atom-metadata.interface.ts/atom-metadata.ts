import {IPositionedWord} from "../Annotation/IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {Segment} from "../tabulate-documents/segment";
import {flatten, maxBy} from "lodash";
import {ICard} from "../ICard";

export class AtomMetadata {
    m: { words: IPositionedWord[]; char: string; element: XMLDocumentNode; i: number; parent: Segment };
    constructor(m: {
        words: IPositionedWord[];
        char: string;
        element: XMLDocumentNode;
        i: number;
        parent: Segment;
    }) {
        this.m = m;

    }



    get words() : IPositionedWord[] {
        return this.m.words
    };
    get char(): string {
        return this.m.char
    };
    get element(): XMLDocumentNode {
        return this.m.element
    };
    get i(): number {
        return this.m.i
    };
    get parent(): Segment {
        return this.m.parent;
    };
}
