import {flatten} from 'lodash'
import {ICard} from '../../../../server/src/shared/ICard'
import {ScheduleRow, SpacedSortQuizData} from "../schedule/schedule-row";

export const cardForWord = async (word: string, language_code: string): Promise<Partial<ICard>> => ({
    learning_language: word,
    language_code,
    photos: [],
    sounds: [],
    known_language: [],
})

/**
 * Changed this to split on linebreak because I'm lazy for now
 * @param threshhold
 * @param str
 * @param filterFunc
 */
export function splitPunctuation(
    threshhold: number,
    str: string,
    filterFunc: (char: string) => boolean,
): string[] {
    return flatten(str.split('。').map((str) => str + '。'))
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
export const splitKeepDelim = (delim: string) => (
    ...strings: string[]
): string[] => {
    return flatten(
        // tslint:disable-next-line:variable-name
        strings.map((string) =>
            string
                .split(delim)
                .filter((v) => v)
                .map((splitString) => splitString + delim),
        ),
    )
}

export const jestDetected = () => process.env.JEST_WORKER_ID !== undefined

export enum NavigationPages {
    READING_PAGE = 'READING_PAGE',
    QUIZ_PAGE = 'QUIZ_PAGE',
    TRENDS_PAGE = 'TRENDS_PAGE',
    SETTINGS_PAGE = 'SETTINGS_PAGE',
    LIBRARY_PAGE = 'LIBRARY_PAGE',
}

export const quizCardKey = ({
                                word,
                                flashCardType
                            }: { word: string, flashCardType: string }) => `${word}-${flashCardType}`;
export const scheduleRowKey = (r: ScheduleRow<SpacedSortQuizData>) => `${r.d.word}${r.d.flash_card_type}${r.d.wordRecognitionRecords.length}`