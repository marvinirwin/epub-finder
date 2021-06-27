import { IPositionedWord } from './tabulate'
import { maxBy, sum } from 'lodash'

export const wordsFromCountRecordList = (records: IPositionedWord[]) => {
    const words: string[] = []
    records = records.filter(r => r.word.length > 0);
    let index = 0
    const pickRecord = (index: number) => {
        const rec = maxBy(
            records.filter((record) => record.position === index),
            (r) => r.word.length,
        )
        if (rec) {
            words.push(rec.word)
            index = rec.position + rec.word.length
        } else {
            index++
        }
        return index
    }

    // This assumes the last record will have the lowest index
    const lastRecord = records[records.length - 1]
    if (!lastRecord) return words
    while (index < lastRecord.position) {
        index = pickRecord(index)
    }
    return words
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

export type AverageResult = {
    known: Set<string>
    unknown: Set<string>
    average: number
}

export const averageKnownWords = (
    words: string[],
    vocab: Map<string, number>,
) => {
    const known = new Set<string>()
    const unknown = new Set<string>(words)
    const average =
        sum(
            words.map((word) => {
                if (vocab.has(word)) {
                    unknown.delete(word)
                    known.add(word)
                    return 1
                }
                return 0
            }),
        ) / words.length
    return {
        known,
        unknown,
        average,
    }
}
