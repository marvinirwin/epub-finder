import {IPositionedWord} from "../Annotation/IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {Segment} from "../tabulate-documents/segment";
import {flatten, maxBy} from "lodash";
import CardsRepository from "../../../../reader/src/lib/manager/cards.repository";
import {ICard} from "../ICard";

export class AtomMetadata {
    constructor(public m: {
        words: IPositionedWord[];
        char: string;
        element: XMLDocumentNode;
        i: number;
        parent: Segment;
    }) {

    }

    priorityMouseoverHighlightWord(
        {
            cardsRepository,
        }: {
            cardsRepository: CardsRepository,
        }
    ): ICard | undefined {
        const cardMap = cardsRepository.all$.getValue();
        return maxBy(
            flatten(
                this.m.words
                    .map(word => {
                        const cardMapElement = cardMap[word.word] || [];
                        return cardMapElement
                            .filter(v => !v.highlightOnly);
                    })
            ), c => c.learningLanguage.length);
    }


    public get words() : IPositionedWord[] {
        return this.m.words
    };
    public get char(): string {
        return this.m.char
    };
    public get element(): XMLDocumentNode {
        return this.m.element
    };
    public get i(): number {
        return this.m.i
    };
    public get parent(): Segment {
        return this.m.parent;
    };
}
