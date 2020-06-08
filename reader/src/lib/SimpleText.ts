import $ from "jquery";
import {aRendition, RenderingBook} from "./RenderingBook";
import { Dictionary } from "lodash";
import {cBookInstance} from "./cBookInstance";

export class SimpleText extends cBookInstance {
    localStorageKey = "SIMPLE_TEXT"

    constructor(name: string, public text: string) {
        super(name);
        const countedCharacters: Dictionary<number> =  text.split('').reduce((acc: Dictionary<number>, letter) => {
            if (!acc[letter]) {
                acc[letter] = 1;
            } else {
                acc[letter]++;
            }
            return acc;
        }, {});

        this.wordCountRecords$.next(
            Object.entries(countedCharacters).map(([letter, count]) => ({
                book: this.name,
                word: letter,
                count
            }))
        )
        this.book = {
            renderTo(e: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): aRendition {
                return {
                    display: async spineItem => {
                        let htmlElements = $(`<p style="white-space: pre">${text}</p>`);
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

    getSerializedForm() {
        return {
            [this.name]: {
                name: this.name,
                text: this.text
            }
        }
    }

    createFromSerilizedForm(o: string): SimpleText[] {
        const v = JSON.parse(o || '') || {};
        if (!Array.isArray(v)) {
            // @ts-ignore
            return Object.values(v).filter(({name, text}) => name && text).map(({name, text}: { name: string, text: string }) => new SimpleText(name, text))
        }
        return []
    }
}