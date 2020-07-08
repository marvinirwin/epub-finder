import {uniq} from "lodash";
import {ITrie} from "../Interfaces/Trie";

export function getNewICardForWord(word: string, deck: string) {
    return {
        learningLanguage: word,
        photos: [],
        sounds: [],
        knownLanguage: [],
        deck: deck,
        fields: [],
        illustrationPhotos: [],
        timestamp: new Date()
    };
}

export const sleep = (n: number) => new Promise(resolve => setTimeout(resolve, n))

export function getUniqueLengths(t: ITrie): number[] {
    const words = t.getWords(false);
    return uniq(words.map(w => w.length));
}
