import {sleep} from "./managers/Manager";
import {aRendition, cBookInstance} from "./managers/RenderingBook";

export class Tweet extends cBookInstance {
    localStorageKey = "TWEET"

    constructor(name: string, public url: string) {
        super(name);
        this.book = {
            renderTo(iframe: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): aRendition {
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

    getSerializedForm() {
        return {
            [this.name]: {
                name: this.name,
                url: this.url
            }
        }
    }

    createFromSerilizedForm(o: string): Tweet[] {
        const v = JSON.parse(o || '') || {};
        if (!Array.isArray(v)) {
            // @ts-ignore
            return Object.values(v).filter(({name, url}) => name && url).map(({name, url}: { name: string, url: string }) => new Tweet(name, url))
        }
        return []
    }
}