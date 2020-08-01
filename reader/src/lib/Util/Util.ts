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
    const result = await axios.post('/translate', {
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

export enum NavigationPages {
    READING_PAGE = "READING_PAGE",
    QUIZ_PAGE = "QUIZ_PAGE",
    TRENDS_PAGE = "TRENDS_PAGE",
    SETTINGS_PAGE = "SETTINGS_PAGE"
}