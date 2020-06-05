import {DOMParser, XMLSerializer} from 'xmldom';
import {ICard} from "../../AppDB";


export class Card {
    constructor(
        public fields: string[],
        public interpolatedFields: string[],
        public deck: string,
        public collection: string,
        public ankiPackage: string) {
    }

    get front(): string {
        if (!this.interpolatedFields[0]) {
            debugger;console.log();
        }
        return this.interpolatedFields[0].normalize();
    }

    get back(): string {
        return this.interpolatedFields.slice(5).join('</br>').normalize();
    }

    get matchCriteria(): string {
        return this.fields.join('').split('').filter(isChineseCharacter).join('')
    }

    static async interpolateMediaTags(fields: string[], getField: (s: string) => Promise<string>): Promise<string[]> {
        let callbackfn = async (f: string) => {
            let domparser = new DOMParser(
                {
                    errorHandler: {
                        warning: function () {
                        }
                    },
                }
            );
            const d = domparser.parseFromString(f, 'text/html');
            const mediaTags = [
                ...Array.from(d.getElementsByTagName('img')),
                ...Array.from(d.getElementsByTagName('audio'))
            ];
            for (let i = 0; i < mediaTags.length; i++) {
                const mediaTag = mediaTags[i];
                let attribute = mediaTag.getAttribute('src');
                if (!attribute) {
                    throw new Error('image no source');
                }
                mediaTag.setAttribute('src', await getField(attribute || ''));
            }
            let innerHTML = new XMLSerializer().serializeToString(d);
            if (!innerHTML) {
                debugger;console.log();
            }
            if (innerHTML == '??') {
                debugger;console.log('Inner html ??');
            }
            return innerHTML;
        };
        const mapped = await Promise.all(fields.filter(f => f).map(callbackfn))
        return mapped;
    }

    static fromSerialized(c: SerializedCard) {
        return new Card(c.fields, c.interpolatedFields, c.deck, c.collection, c.ankiPackage);
    }

    static createICardFromCard(packageName: string, collectionName: string, c: Card): ICard {
        return {
            characters: c.front,
            photos: c.getPhotos(),
            sounds: c.getSounds(),
            english: c.back.split('\n'),
            fields: c.interpolatedFields,
            deck: c.deck,
            ankiPackage: packageName,
            collection: collectionName
        }
    }

    private getSounds() {
        return [];
    }

    private getPhotos() {
        return [];
    }
}



export interface SerializedCard {
    interpolatedFields: string[];
    fields: string[];
    deck: string;
    collection: string;
    ankiPackage: string;

}


// Dont know if this matches simplified or traditional
export function isChineseCharacter(s: string) {
    return s.match(/[\u4E00-\uFA29]/);
}