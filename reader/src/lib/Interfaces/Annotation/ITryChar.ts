import {IWordPos} from "./IWordPos";

export interface ITryChar {
    words: IWordPos[];
    char: string;
    el: JQuery<HTMLElement>
}