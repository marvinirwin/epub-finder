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
}