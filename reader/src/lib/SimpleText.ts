import $ from "jquery";
import {aRendition, RenderingBook} from "./RenderingBook";
import {Dictionary} from "lodash";
import {cBookInstance} from "./cBookInstance";
import {isChineseCharacter} from "./worker-safe/Card";

export class SimpleText extends cBookInstance {
    static localStorageKey = "SIMPLE_TEXT"
    get localStorageKey(): string {
        return SimpleText.localStorageKey
    }

    constructor(name: string, public text: string) {
        super(name);
        const countedCharacters: Dictionary<number> = text.split('').filter(isChineseCharacter).reduce((acc: Dictionary<number>, letter) => {
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