import {IPositionedWord} from "../Annotation/IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {Segment} from "../tabulation/segment";
import {flatten, maxBy} from "lodash";
import CardsRepository from "../../../../reader/src/lib/manager/cards.repository";
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
