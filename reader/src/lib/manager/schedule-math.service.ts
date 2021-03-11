import {orderBy} from "lodash";
import {NormalizedScheduleRowData, ScheduleRow} from "../schedule/schedule-row";
import {getSortValue} from "./sort-value.interface";
import {NormalizedValue} from "./normalized-value.interface";

export class ScheduleMathService {

    public static sortScheduleRows(
        scheduleRows: ScheduleRow [],
        {
            dateWeight,
            countWeight,
            wordLengthWeight,
        }: {
            dateWeight: number,
            countWeight: number,
            wordLengthWeight: number,
        }
    ): ScheduleRow<NormalizedScheduleRowData>[] {
        const scheduleRowNormalizedDateMap = new Map<ScheduleRow, NormalizedValue>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.dueDate().getTime() * -1
        ).map(([n, row]) => {
            return [
                row,
                n
            ];
        }));

        const scheduleRowNormalizedCountMap = new Map<ScheduleRow, NormalizedValue>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.count()
        ).map(([n, row]) => [
            row,
            n,
        ]));

        const scheduleRowNormalizedLength = new Map<ScheduleRow, NormalizedValue>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.d.word.length
        ).map(([n, row]) => {
            return [
                row,
                n
            ];
        }));

        const sortableScheduleRows: NormalizedScheduleRowData[] = scheduleRows.map(scheduleRow => {
            const normalCount = scheduleRowNormalizedCountMap.get(scheduleRow) as NormalizedValue;
            const normalDate = scheduleRowNormalizedDateMap.get(scheduleRow) as NormalizedValue;
            const normalLength = scheduleRowNormalizedLength.get(scheduleRow) as NormalizedValue;
            const countSortValue = getSortValue<number>(normalCount.normalizedValue, countWeight, scheduleRow.count());
            const dueDateSortValue = getSortValue<Date>(
                normalDate.normalizedValue,
                dateWeight,
                scheduleRow.dueDate()
            );
            const lengthSortValue = getSortValue<number>(
                normalLength.normalizedValue,
                wordLengthWeight,
                scheduleRow.d.word.length
            );
            return {
                ...scheduleRow.d,
                count: countSortValue,
                dueDate: dueDateSortValue,
                length: lengthSortValue,
                finalSortValue: (
                    countSortValue.weightedInverseLogNormalValue +
                    (dueDateSortValue.weightedInverseLogNormalValue) +
                    lengthSortValue.weightedInverseLogNormalValue
                ),
                normalizedCount: normalCount,
                normalizedDate: normalDate
            } as NormalizedScheduleRowData;
        })

        return orderBy(
            sortableScheduleRows.map(r => new ScheduleRow<NormalizedScheduleRowData>(r)),
            r => r.d.finalSortValue,
            'desc')
    }

    private static normalizeScheduleRows<T>(
        scheduleRows: T[],
        valueFunction: (r: T) => number
    ): [NormalizedValue, T][] {
        let maxValue = Number.MIN_SAFE_INTEGER;
        let minValue = Number.MAX_SAFE_INTEGER;
        let offset = 0;
        scheduleRows.forEach(row => {
            const rowValue = valueFunction(row) || 0;
            if (maxValue < rowValue) {
                maxValue = rowValue;
            }
            if (minValue > rowValue) {
                minValue = rowValue;
            }
        });
        if (minValue < 0) {
            offset = Math.abs(minValue);
        }
        return scheduleRows.map(row => {
            const normalizedValue = ScheduleMathService.normalize(
                valueFunction(row) + offset || 0,
                minValue + offset,
                maxValue + offset
            );
            return [
                {
                    normalizedValue,
                    value: valueFunction(row) + offset,
                    min: minValue + offset,
                    max: maxValue + offset,
                    offset
                },
                row
            ];
        })
    }

    private static normalize(val: number, min: number, max: number) {
        return (val - min) / (max - min)
    }
}