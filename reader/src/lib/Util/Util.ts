import {uniq} from "lodash";
import {ITrie} from "../Interfaces/Trie";
import axios from "axios";
import {ITrendLocation} from "../Interfaces/ITrendLocation";
import {ITrend} from "../Interfaces/ITwitterTrend";

export function getNewICardForWord(word: string, deck: string ='') {
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

export async function getTranslation<A>(learningText: A) {
    const result = await axios.post(`${process.env.PUBLIC_URL}/translate`, {
        from: 'zh-CN',
        to: 'en',
        text: learningText
    })
    return result.data.translation;
}

async function getAllLocations(): Promise<ITrendLocation[]> {
    const result = await axios.post('/trend-locations')
    const d: ITrendLocation[] = result.data;
    const filtered = d.filter(r => r.country === 'Singapore')
    return result.data;
}

async function getAllTrendsForLocation(woeid: number): Promise<ITrend[]> {
    const result = await axios.post('/trends', {id: woeid})
    return result.data;
}

/**
 * Chnaged this to split on linebreak because I'm lazy for now
 * @param threshhold
 * @param str
 * @param filterFunc
 */
export function splitPunctuation(threshhold: number, str: string, filterFunc: (char: string) => boolean): string[] {
    return str.split('\n');
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
}

export const jestDetected = () => process.env.JEST_WORKER_ID !== undefined;

export enum NavigationPages {
    READING_PAGE = "READING_PAGE",
    QUIZ_PAGE = "QUIZ_PAGE",
    TRENDS_PAGE = "TRENDS_PAGE",
    SETTINGS_PAGE = "SETTINGS_PAGE"
}