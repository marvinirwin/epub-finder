import {IPositionedWord} from "./IPositionedWord";

export interface IAnnotatedCharacter {
    words: IPositionedWord[];
    char: string;
    el: JQuery<HTMLElement>
}