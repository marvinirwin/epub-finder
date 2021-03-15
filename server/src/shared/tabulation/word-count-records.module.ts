import {WordCountRecord} from "./tabulate";
import {maxBy, sum} from "lodash";

export const wordsFromCountRecordList = (records: WordCountRecord[]) => {
    const words: string[] = [];
    let index = 0;
    const pickRecord = (index: number) => {
        const rec = maxBy(
            records.filter(record => record.position === index),
            r => r.word.length
        );
        if (rec) {
            words.push(rec.word);
            index = rec.position + rec.word.length;
        } else {
            index++;
        }
        return index;
    };

    // This assumes the last record will have the lowest index
    const lastRecord = records[records.length - 1];
    if (!lastRecord) return words;
    while (index < lastRecord.position) {
        index = pickRecord(index);
    }
    return words;
    // Now go until the next rwcord
    /*
        for (let i = 0; i < records.length; i++) {
            if (!currentWord || ((currentWord.position + currentWord.word.length) < i)) {
                // Take the word with the smallest position
                currentWord = maxBy(
                    records.filter(record => record.position === records[i].position),
                    r => r.word.length
                );
                if (currentWord) {
                    words.push(currentWord.word)
                }
            }
        }
    */
}


export const averageWordRecognitionScore = (words: string[], vocab: Map<string, number>) => {
    return sum(
        words.map(word => vocab.has(word) ? vocab.get(word) : 0)
    ) / words.length;
}
