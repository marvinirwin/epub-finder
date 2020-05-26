import vocab from "../hsk.json";

export interface Vocab {
    id: number;
    hanzi: string;
    pinyin: string;
    translations: string[]
}

export interface VocabMap {
    [key: string]: Vocab;
}
export function makeVocab(hanzi: string, pinyin: string, ...translations: string[]): Vocab {
    return {
        id: 0,
        hanzi,
        pinyin,
        translations
    }
}

export const v: Vocab[] = vocab;
export const myVocab: Vocab[] = [
        makeVocab('却', 'qu4', 'however', 'yet'),
        makeVocab('仙', 'xien1', 'magical')
    ]
;const vocabMap: VocabMap = v.concat(myVocab).reduce((acc: VocabMap, v: Vocab) => {
    acc[v.hanzi.normalize()] = v;
    return acc;
}, {})