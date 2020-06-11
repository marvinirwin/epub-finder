export interface ICard {
    id?: number; // Primary key. Optional (autoincremented)
    characters: string;
    photos: string[];
    sounds: string[];
    english: string[];
    ankiPackage: string | undefined;
    collection: string | undefined;
    deck: string | undefined;
    fields: string[];
    frontPhotos: string[];
    timestamp: number | Date
}

export function getIsMeFunction(c1: ICard) {
    return ({deck, ankiPackage, collection, characters, id}: {
        deck: string | undefined,
        ankiPackage: string | undefined,
        collection: string | undefined,
        characters: string,
        id?: number | undefined
    }) =>
        (c1.id && (c1.id === id)) ||
        (c1.deck === deck &&
            c1.ankiPackage === ankiPackage &&
            c1.collection === collection &&
            c1.characters === characters);
}