import {DOMParser, XMLSerializer} from 'xmldom';
import {ICard} from "./icard";


export class Card {
    constructor(
        public fields: string[],
        public interpolatedFields: string[],
        public deck: string,
        public collection: string,
        public ankiPackage: string,
        public iCard: ICard
    ) {
    }

    get front(): string {
        if (!this.interpolatedFields[0]) {
            debugger; console.log();
        }
        return this.interpolatedFields[0].normalize();
    }

    get back(): string {
        return this.interpolatedFields.slice(5).join('</br>').normalize();
    }

    get matchCriteria(): string {
        return this.fields.join('').split('').filter(isChineseCharacter).join('')
    }

    static async getIcard(
        fields: string[],
        resolveMediaSrc: (s: string) => Promise<string>,
        deck: string,
        ankiPackage: string,
        collection: string
    ): Promise<ICard> {
        fields = fields.filter(f => f);
        const c: ICard = {
            characters: fields[0], // assuming the first field contains the character
            photos:  [],
            sounds:  [],
            english: [],
            ankiPackage: ankiPackage,
            collection: collection,
            deck: deck,
            fields: []
        }
        const soundMatchRegexp = new RegExp(`\\[sound:(.*?)\\]`);
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            const groups = soundMatchRegexp.exec(field);
            if (groups || field.includes('sound:')) {
                field = `<audio src="${(groups || [])[1]}"/>` // I dont know if this will work
            }

            let parser = new DOMParser(
                {
                    errorHandler: {
                        warning: function () {
                        }
                    },
                }
            );
            const document = parser.parseFromString(field, 'text/html');
            if (!document) {
                debugger;console.log();
            }
            const audio = Array.from(document.getElementsByTagName('audio'));
            const images = Array.from(document.getElementsByTagName('img'));
            const audioSources = await this.resolveMediaSources(audio, resolveMediaSrc);
            const imageSources = await this.resolveMediaSources(images, resolveMediaSrc);
            c.sounds.push(...audioSources);
            c.photos.push(...imageSources);
            let innerHTML = new XMLSerializer().serializeToString(document);
            if (!innerHTML) {
                debugger;
                console.log();
            }
            if (innerHTML == '??') {
                debugger;
                console.log('Inner html ??');
            }
            c.fields.push(innerHTML);
        }
        return c;
    }

    private static async resolveMediaSources(audio: (HTMLAudioElement | HTMLImageElement)[], resolveMediaSrc: (s: string) => Promise<string>) {
        const sources = [];
        for (let i = 0; i < audio.length; i++) {
            const mediaTag = audio[i];
            let attribute = mediaTag.getAttribute('src');
            if (!attribute) {
                throw new Error('image no source');
            }
            let src = await resolveMediaSrc(attribute || '');
            mediaTag.setAttribute('src', src);
            sources.push(src)
        }
        return sources;
    }

    static fromSerialized(c: SerializedCard) {
        return new Card(c.fields, c.interpolatedFields, c.deck, c.collection, c.ankiPackage, c.iCard);
    }

/*
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
*/

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
    iCard: ICard;
}


// Dont know if this matches simplified or traditional
export function isChineseCharacter(s: string) {
    return s.match(/[\u4E00-\uFA29]/);
}