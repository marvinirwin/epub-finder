import {WordCountRecord} from "./tabulate";
import {maxBy, sum} from "lodash";

export const wordsFromCountRecordList = (records: WordCountRecord[]) => {
    const words: string[] = [];
    let currentWord: WordCountRecord | undefined;
    for (let i = 0; i < records.length; i++) {
        if (!currentWord || ((currentWord.position + currentWord.word.length) < i)) {
            currentWord = maxBy(
                records.filter(record => record.position === records[i].position),
                r => r.word.length
            );
            if (currentWord) {
                words.push(currentWord.word)
            }
        }
    }
    return words;
}


export const wordListAverageDifficulty = (words: string[], vocab: Map<string, number>) => {
    return sum(
        words.map(word => vocab.has(word) !== undefined ? vocab.has(word) : 1)
    ) / words.length;
}
