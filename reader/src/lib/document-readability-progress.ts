import {NormalizedScheduleRowData, ScheduleRow} from "./schedule/schedule-row";
import {
    SerializedTabulation,
    TabulatedDocuments
} from "../../../server/src/shared/tabulate-documents/tabulated-documents.interface";
import { sum } from "lodash";

export interface WordReadabilityRecord {
    word: string;
    scheduleRow: ScheduleRow<NormalizedScheduleRowData> | undefined;
    count: number;
    totalWordCount: number;
}

export interface ReadabilityState {
    fullRecognition: WordReadabilityRecord[];
    somewhatRecognized: WordReadabilityRecord[];
    unrecognized: WordReadabilityRecord[];
}


export class DocumentReadabilityProgress {
    readabilityState: ReadabilityState;
    constructor(
        {
            scheduleRows,
            tabulatedDocument,
        }: {
            scheduleRows: Map<string, ScheduleRow<NormalizedScheduleRowData>>,
            tabulatedDocument: SerializedTabulation
        }
    ) {
        // Now take any word which was recognized twice in a row and mark it as complete
        // Any word which was recognized once or is overdue and mark it as kind of complete
        // Then the rest are red
        const totalWordCount = sum(Array.from(tabulatedDocument.greedyWordCounts.values()));
        const {fullRecognition, somewhatRecognized, unrecognized} = {
            fullRecognition: [],
            somewhatRecognized: [],
            unrecognized: []
        } as ReadabilityState;
        Array.from(tabulatedDocument.greedyWordCounts.entries())
            .forEach(([word, count]) => {
                const scheduleRow = scheduleRows.get(word);
                const readabilityRecord = {word, scheduleRow, count, totalWordCount};
                if (!scheduleRow || scheduleRow.isUnrecognized()) {
                    unrecognized.push(readabilityRecord);
                    return;
                }
                if (scheduleRow.isUnrecognized()) {
                    somewhatRecognized.push(readabilityRecord);
                    return;
                }
                fullRecognition.push(readabilityRecord)
            });
        this.readabilityState = {
            fullRecognition,
            somewhatRecognized,
            unrecognized
        }
    }
}