import {ICard} from "../ICard";


export class Card {
    frontPhotos: string[];
    constructor(
        public fields: string[],
        public interpolatedFields: string[],
        public deck: string,
        public collection: string,
        public ankiPackage: string,
        public iCard: ICard
    ) {
        this.frontPhotos = [];
    }

    get front(): string {
        return this.interpolatedFields[0].normalize();
    }

    get back(): string {
        return this.interpolatedFields.slice(5).join('</br>').normalize();
    }

    get matchCriteria(): string {
        return this.fields.join('').split('').filter(isChineseCharacter).join('')
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


const chineseCharacterRegexp = /[\u4E00-\uFA29]/;
// Dont know if this matches simplified or traditional
export function isChineseCharacter(s: string) {
    return s.match(chineseCharacterRegexp);
}