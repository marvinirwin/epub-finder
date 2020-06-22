import $ from "jquery";
import {RenderingBook} from "./Rendering/RenderingBook";
import {Dictionary} from "lodash";
import {BookInstance} from "./BookInstance";
// @ts-ignore
import {sify} from 'chinese-conv';
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {IRendition} from "../Interfaces/Book/IRendition";

export class SimpleText extends BookInstance {
    static localStorageKey = "SIMPLE_TEXT"
    get localStorageKey(): string {
        return SimpleText.localStorageKey
    }

    constructor(name: string, public text: string) {
        super(name);
/*
        text = text.split('').map(sify).join('')
*/
        this.rawText$.next(text);
        this.book = {
            renderTo(e: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): IRendition {
                return {
                    display: async spineItem => {
                        let htmlElements = $(`<p style="max-width: 100%; font-size: 200%;">${text}</p>`);
                        let target: JQuery<HTMLElement> = e.contents().find('body');
                        htmlElements.appendTo(target);
                    }
                }
            },
            spine: {
                each: cb => cb({href: ''})
            }
        };
    }

    toSerialized() {
        return {
            name: this.name,
            text: this.text
        }
    }


    static fromSerialized(o: any): SimpleText {
        return new SimpleText(o.name, o.text)
    }
}