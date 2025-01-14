import { DocumentWordCount } from "@shared/"
import { WordRecognitionRow } from './word-recognition-row'
import { NormalizedValue } from '../manager/normalized-value.interface'
import { SrmService } from '../srm/srm.service'
import { format, formatDistance, isToday } from 'date-fns'
import { SuperMemoGrade } from 'supermemo'
import { FlashCardType } from '../quiz/hidden-quiz-fields'
import { groupBy } from 'lodash'
import { SrmStateChangeRecord, srmStateChangeRecords, SrmStates } from './srm-state-change-records'
import { PotentialExcludedDbColumns } from './indexed-rows.repository'

export interface QuizScheduleRowData {
    wordCountRecords: DocumentWordCount[]
    greedyWordCountRecords: DocumentWordCount[]
    wordRecognitionRecords: PotentialExcludedDbColumns<WordRecognitionRow>[]
    flash_card_type: FlashCardType;
    word: string
}

export interface SortQuizData extends QuizScheduleRowData {
    count: SortValue<number>
    dueDate: SortValue<Date>
    length: SortValue<number>
    finalSortValue: number
    normalizedCount: NormalizedValue
    normalizedDate: NormalizedValue
    sortValues: {
        dueDate: SortValue<Date>
        count: SortValue<number>
        length: SortValue<number>
        sentencePriority: SortValue<number>
    }
}
export interface SpacedSortQuizData extends SortQuizData {
    spacedDueDate: {source: Date, transformed: Date}
}

export interface SortValue<T> {
    value: T
    normalValue: number
    inverseLogNormalValue: number
    weightedInverseLogNormalValue: number
    weight: number
    normalizedValueObject: NormalizedValue
}

export type ScheduleItem = {
    nextDueDate: Date
    grade: SuperMemoGrade
    created_at: Date
    repetition: number
    interval: number
    efactor: number
}

export const NUMBER_OF_CORRECT_ANSWERS_TO_LEARN = 2
export const NUMBER_OF_CORRECT_ANSWERS_TO_REVIEW = 1
export const CORRECT_SUPERMEMO_GRADE = 3

export const wasLearnedToday = (r1: ScheduleItem[]): boolean => {
    const d = mostRecentLearningRecord(r1);
    return d ? isToday(d.created_at) : false;
}

function getRecordsGroupedByDayInDescOrder(records: ScheduleItem[]) {
    return Object.values(groupBy(records, r => format(r.created_at, 'mm dd yyyy')))
        .reverse()
}

export const mostRecentLearningRecord = (records: ScheduleItem[]): ScheduleItem | undefined => {
    const recordsGroupedByDayInDescOrder = getRecordsGroupedByDayInDescOrder(records);
    for (let i = 0; i < recordsGroupedByDayInDescOrder.length; i++) {
    const recordsForADay = recordsGroupedByDayInDescOrder[i];
        const learnedForTheFirstTimeRecord = learnedForThefirstTime(recordsForADay);
        if (learnedForTheFirstTimeRecord) {
            return learnedForTheFirstTimeRecord;
        }
    }
    return undefined
}

export const getReviewRecords = (recordsInAscOrder: ScheduleItem[]): ScheduleItem[] | undefined => {
    // I need the most recent date learned, and then all the successive records after that
    // Then I have to make usre all of those records are successful and then take the date of the last one
    const dateLearned = mostRecentLearningRecord(recordsInAscOrder);
    if (!dateLearned) return undefined;
    // Now get all the records where the created_at is greater than dateLearned
    const successiveRecords  = recordsInAscOrder.filter(r => +r.created_at > +dateLearned);
    const allSuccessiveRecordsAreSuccessful = successiveRecords.every(r => r.grade >= CORRECT_SUPERMEMO_GRADE);
    return allSuccessiveRecordsAreSuccessful ? successiveRecords : undefined;
}


const learnedForThefirstTime = (recordsForThisDay: ScheduleItem[]) => {
    let successInARow: ScheduleItem[] = [];
    for (let i = 0; i < recordsForThisDay.length; i++) {
        const record = recordsForThisDay[i]
        if (record.grade >= CORRECT_SUPERMEMO_GRADE) {
            successInARow.push(record)
        } else {
            successInARow = [];
        }
        if (successInARow.length === NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) {
            return successInARow[successInARow.length - 1];
        }
    }
}

export const recordsLearnedAnyDay = (r1: ScheduleItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(r1, NUMBER_OF_CORRECT_ANSWERS_TO_LEARN)
    return (
        lastTwoRecords.length === NUMBER_OF_CORRECT_ANSWERS_TO_LEARN && lastTwoRecords.every((r) => r.grade >= CORRECT_SUPERMEMO_GRADE)
    )
}


export class ScheduleRow<T> {
    private _dueDate: Date
    public stateChangeRecords: SrmStateChangeRecord<ScheduleItem>[]
    private lastStateChangeRecord: SrmStateChangeRecord<ScheduleItem> | undefined;

    constructor(public d: T, private superMemoRecords: ScheduleItem[]) {
        this._dueDate = this.superMemoRecords[
            this.superMemoRecords.length - 1
        ]?.nextDueDate;

        this.stateChangeRecords = srmStateChangeRecords(this.superMemoRecords);
        this.lastStateChangeRecord = this.stateChangeRecords[this.stateChangeRecords.length - 1];
    }

    public dueDate() {
        return this._dueDate || new Date()
    }

    public isNew() {
        return this.superMemoRecords.length === 0
    }

    public recognitionScore() {
        return (
            this.superMemoRecords[this.superMemoRecords.length - 1]?.grade || 0
        )
    }

    public isToReview({ now }: { now: Date }) {
        return (
            this.lastStateChangeRecord?.type === SrmStates.learned ||
            this.lastStateChangeRecord?.type === SrmStates.reviewed
            ) &&
            this.isOverDue({ now })
    }

    public isOverDue({ now }: { now: Date }) {
        return this.dueDate() < now
    }

    public hasNRecognizedInARow(n = NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) {
        const last2 = this.superMemoRecords.slice(n * -1)
        return last2.every((rec) => rec.grade >= SrmService.correctScore())
    }

    static lastNRecords<T>(r: T[], n: number) {
        return r.slice(n * -1)
    }

    public isLearningToday() {
        if (!this.lastStateChangeRecord) {
            return false;
        }
        return this.lastStateChangeRecord.type === SrmStates.learning &&
            isToday(this.lastStateChangeRecord.r.created_at);
    }

    public dueIn() {
        return formatDistance(this.dueDate(), Date.now(), { addSuffix: true })
    }

    public isUnrecognized() {
        return this.hasNRecognizedInARow(1)
    }

    public isSomewhatRecognized({ now }: { now: Date }) {
        return this.hasNRecognizedInARow(NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) && this.isOverDue({ now })
    }

    public isRecognized() {
        return this.recognitionScore() >= CORRECT_SUPERMEMO_GRADE
        /*
                return !this.isUnrecognized() && !this.isSomewhatRecognized()
        */
    }

    wasLearnedOrReviewedToday() {
        if (!this.lastStateChangeRecord) {
            return false;
        }
        return (this.lastStateChangeRecord.type === SrmStates.reviewed || this.lastStateChangeRecord.type === SrmStates.learned) &&
            isToday(this.lastStateChangeRecord.r.created_at);
    }

    wasLearnedToday() {
        if (!this.lastStateChangeRecord) {
            return false;
        }
        return (this.lastStateChangeRecord.type === SrmStates.learned) &&
            isToday(this.lastStateChangeRecord.r.created_at);
    }

    unStartedToday() {
        return this.superMemoRecords.length === 0 ||
            (this.lastStateChangeRecord?.type === SrmStates.learning &&
            !isToday(this.lastStateChangeRecord.r.created_at))
    }

    wasReviewedToday() {
        if (!this.lastStateChangeRecord) {
            return false;
        }
        return (this.lastStateChangeRecord.type === SrmStates.reviewed) &&
            isToday(this.lastStateChangeRecord.r.created_at);
    }
}
