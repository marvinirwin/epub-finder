import {BookInstance} from "./BookInstance";
import {IRendition} from "../Interfaces/Book/IRendition";
import {RenderingBook, waitFor} from "./Rendering/RenderingBook";

export class Website extends BookInstance {
    get localStorageKey(): string {
        return "WEBSITE";
    }

    constructor(name: string, public url: string) {
        super(name);
        const self = this;
        /*
                text = text.split('').map(sify).join('')
        */
        this.book = {
            renderTo(e: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): IRendition {
                return {
                    display: async spineItem => {
                        e.prop('src', self.url)
                        await waitFor(() => {
                            let length = e.contents().find('body').children().length;
                            return length > 6;
                        }, 2000);
                        const leaves = RenderingBook.getTextElements(e.contents().find('body'));
                        const text = leaves.map(l => l.textContent || '').join('');
                        self.rawText$.next(text)

/*
                        let htmlElements = $(`<p style="max-width: 100%; font-size: 200%;">${text}</p>`);
                        htmlElements.appendTo(target);
*/
                        // Now we have to await and get leaf nodes so we can count or text
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
            url: this.url
        }
    }

    static fromSerialized(o: any): Website {
        return new Website(o.name, o.url)
    }
}