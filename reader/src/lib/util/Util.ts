import {uniq, flatten} from "lodash";
import {ICard} from "../../../../server/src/shared/ICard";

export function cardForWord(word: string): ICard {
    return {
        learningLanguage: word,
        photos: [],
        sounds: [],
        knownLanguage: [],
        deck: '',
        fields: [],
        illustrationPhotos: [],
        timestamp: new Date()
    };
}

export const sleep = (n: number) => new Promise(resolve => setTimeout(resolve, n))

/**
 * Changed this to split on linebreak because I'm lazy for now
 * @param threshhold
 * @param str
 * @param filterFunc
 */
export function splitPunctuation(threshhold: number, str: string, filterFunc: (char: string) => boolean): string[] {
    return flatten(str.split('。').map(str => str + '。'));
/*
    const splits = [];
    // Once the threshhold is reached, split on the next punctuation/line break
    let currentStart = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const isPastThreshhold = (i - currentStart) > (threshhold - 1);
        if (isPastThreshhold && filterFunc(char)) {
            splits.push(str.substr(currentStart, i - currentStart + 1));
            currentStart = i + 1;
        }
    }
    splits.push(str.substr(currentStart, str.length));

    return splits;
*/
}
export const splitKeepDelim = (delim: string) => (...strings: string[]): string[] => {
    return flatten(
        strings.map(string => string.split(delim).filter(v => v).map(splitString => splitString + delim))
    )
}


export const jestDetected = () => process.env.JEST_WORKER_ID !== undefined;

export enum NavigationPages {
    READING_PAGE = "READING_PAGE",
    QUIZ_PAGE = "QUIZ_PAGE",
    TRENDS_PAGE = "TRENDS_PAGE",
    SETTINGS_PAGE = "SETTINGS_PAGE",
    LIBRARY_PAGE = "LIBRARY_PAGE"
}