import {SegmentSubsequences} from "../index";
import {AbstractNode, AbstractSegment} from "../tabulate-documents/tabulate-segment/tabulate";

export class AtomMetadata<U extends AbstractNode = AbstractNode, T extends AbstractSegment<U> = AbstractSegment<U>, > {
    m: {
        words: SegmentSubsequences;
        char: string;
        element: U;
        i: number;
        parent: T;
    }
    constructor(m: {
        words: SegmentSubsequences;
        char: string;
        element: U;
        i: number;
        parent: T;
    }) {
        this.m = m;
    }

    get words(): SegmentSubsequences {
        return this.m.words;
    }
    get char(): string {
        return this.m.char;
    }
    get element(): U {
        return this.m.element;
    }
    get i(): number {
        return this.m.i;
    }
    get parent(): T {
        return this.m.parent;
    }
}
