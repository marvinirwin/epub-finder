import $ from "jquery";
import {aRendition, RenderingBook} from "./RenderingBook";
import {Dictionary} from "lodash";
import {cBookInstance} from "./cBookInstance";
// @ts-ignore
import {sify} from 'chinese-conv';
import {isChineseCharacter} from "./worker-safe/Card";

export class SimpleText extends cBookInstance {
    static localStorageKey = "SIMPLE_TEXT"
    get localStorageKey(): string {
        return SimpleText.localStorageKey
    }

    constructor(name: string, public text: string) {
        super(name);
        // @ts-ignore
        text = text.split('').map(sify).join('')
        this.rawText$.next(text);
        this.book = {
            renderTo(e: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): aRendition {
                return {
                    display: async spineItem => {
                        let htmlElements = $(`<p style="white-space: pre; font-size: 200%;">${text}</p>`);
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