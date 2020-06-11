export interface ICard {
    id?: number; // Primary key. Optional (autoincremented)
    learningLanguage: string;
    photos: string[];
    sounds: string[];
    knownLanguage: string[];
    ankiPackage: string | undefined;
    collection: string | undefined;
    deck: string | undefined;
    fields: string[];
    illustrationPhotos: string[];
    timestamp: number | Date
}

export function getIsMeFunction(c1: ICard) {
    return ({deck, ankiPackage, collection, learningLanguage, id}: {
        deck: string | undefined,
        ankiPackage: string | undefined,
        collection: string | undefined,
        learningLanguage: string,
        id?: number | undefined
    }) =>
        (c1.id && (c1.id === id)) ||
        (c1.deck === deck &&
            c1.ankiPackage === ankiPackage &&
            c1.collection === collection &&
            c1.learningLanguage === learningLanguage);
}