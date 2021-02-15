import {IRendition} from "./IRendition";
import {ISpine} from "./ISpine";

export interface IDocument {
    renderTo(e: JQuery<HTMLIFrameElement>, options: { [key: string]: any }): IRendition

    spine: ISpine;
}