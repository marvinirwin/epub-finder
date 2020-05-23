export class Card {
    constructor(public fields: string[], public interpolatedFields: string[]) {
        // So basically the act of displaying a card involves parsing its fields and then inlining the images
    }

    get front(): string {
        return this.interpolatedFields[0].normalize();
    }

    get back(): string {
        return this.interpolatedFields[1].normalize();
    }

    static async interpolateMediaTags(fields: string[], getField: (s: string) => Promise<string>): Promise<string[]> {
        let callbackfn = async (f: string) => {
            let domparser = new DOMParser();
            const d = domparser.parseFromString(f, 'text/html');
            const mediaTags = d.getElementsByTagName('img');
            for (let i = 0; i < mediaTags.length; i++) {
                const mediaTag = mediaTags[i];
                let attribute = mediaTag.getAttribute('src');
                if (!attribute) {
                    throw new Error('image no source');
                }
                mediaTag.setAttribute('src', await getField(attribute || ''));
            }
            return d.documentElement.innerHTML;
        };
        return Promise.all(fields.map(callbackfn))
    }
}