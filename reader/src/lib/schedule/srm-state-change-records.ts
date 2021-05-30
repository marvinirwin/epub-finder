import { isSameDay, isToday } from 'date-fns'
import { CORRECT_SUPERMEMO_GRADE } from './schedule-row'

export enum SrmStates {
    learning = 'learning',
    learned = 'learned',
    reviewed = 'reviewed'
}

export interface SrmStateChangeRecord<T> {
    r: T,
    type: SrmStates,
}

type SrmRecord = { grade: number, created_at: Date }
export const srmStateChangeRecords = <T extends SrmRecord>(srmRecords: T[]): SrmStateChangeRecord<T>[] => {
    const stateChangeRecords: SrmStateChangeRecord<T>[] = []
    let latestStateChangeRecord: SrmStateChangeRecord<T> | undefined
    let correctRecordsToday = []
    let currentDay: Date | undefined
    const pushStateRecord = (r: T, type: SrmStates) => {
        const item = { type, r }
        stateChangeRecords.push(item)
        currentDay = r.created_at
        latestStateChangeRecord = item
    }
    let previousRecord: T | undefined
    for (const currentRecord of srmRecords) {
        const isFirstRecord = !previousRecord
        // Reset correctRecordsToday, if necessary
        if (previousRecord) {
            if (!isSameDay(previousRecord.created_at, currentRecord.created_at)) {
                correctRecordsToday = []
            }
        }
        // Add some to our correct-in-a-row
        if (currentRecord.grade >= CORRECT_SUPERMEMO_GRADE) {
            correctRecordsToday.push(currentRecord)
        } else {
            correctRecordsToday = []
        }
        // Set the previousRecord
        previousRecord = currentRecord
        const wasLearningAndIsThirdCorrectInARowToday =
            correctRecordsToday.length === 3 &&
            latestStateChangeRecord?.type === 'learning';
        const currentStateIsReviewingOrLearning = latestStateChangeRecord?.type === SrmStates.reviewed ||
            latestStateChangeRecord?.type === SrmStates.learned
        const previousRecordWasLearnedOrReviewingAndNewOneIsCorrect =
            currentStateIsReviewingOrLearning &&
            currentRecord.grade >= CORRECT_SUPERMEMO_GRADE
        const previousRecordWasLearnedOrReviewingAndNewOneIsIncorrect =
            currentStateIsReviewingOrLearning &&
            currentRecord.grade < CORRECT_SUPERMEMO_GRADE;
        const isFirstRecordTodayAndPreviousRecordWasLearning =
            latestStateChangeRecord?.type === SrmStates.learning &&
            !isToday(latestStateChangeRecord.r.created_at);
        if (isFirstRecord) {
            pushStateRecord(currentRecord, SrmStates.learning)
            continue
        }
        if (isFirstRecordTodayAndPreviousRecordWasLearning) {
            pushStateRecord(currentRecord, SrmStates.learning);
        }
        if (wasLearningAndIsThirdCorrectInARowToday) {
            pushStateRecord(currentRecord, SrmStates.learned)
            continue
        }
        if (previousRecordWasLearnedOrReviewingAndNewOneIsCorrect) {
            pushStateRecord(currentRecord, SrmStates.reviewed)
            continue
        }
        if (previousRecordWasLearnedOrReviewingAndNewOneIsIncorrect) {
            pushStateRecord(currentRecord, SrmStates.learning)
            continue
        }
    }
    return stateChangeRecords
}