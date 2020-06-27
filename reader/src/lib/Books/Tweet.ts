import {sleep} from "../Manager";
import {BookInstance} from "./BookInstance";
import {IRendition} from "../Interfaces/Book/IRendition";

export class Tweet extends BookInstance {
    static localStorageKey = "TWEET"
    get localStorageKey(): string {
        return Tweet.localStorageKey
    }
    constructor(public name: string, public url: string) {
        super(name);
        this.book = {
            renderTo(iframe: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): IRendition {
                return {
                    display: async spineItem => {
                        // e is an iframe
                        iframe.attr('src', url);
                        // Now wait a bit for the tweet to render
                        await sleep(1000);
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

    static fromSerialized(o: any): Tweet {
        return new Tweet(o.name, o.url)
    }
}