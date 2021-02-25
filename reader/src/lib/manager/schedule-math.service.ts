import {ScheduleRow} from "../schedule/ScheduleRow";
import {orderBy} from "lodash";
import {NormalizedScheduleRowData} from "../schedule/schedule-row.interface";
import {getSortValue} from "./sort-value.interface";
import {NormalizedValue} from "./normalized-value.interface";

export class ScheduleMathService {

    public static sortScheduleRows(
        scheduleRows: ScheduleRow [],
        dateWeight: number,
        countWeight: number,
    ): ScheduleRow<NormalizedScheduleRowData>[] {
        const scheduleRowNormalizedDateMap = new Map<ScheduleRow, NormalizedValue>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.dueDate().getTime()
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

        const sortableScheduleRows: NormalizedScheduleRowData[] = scheduleRows.map(scheduleRow => {
            const normalCount = scheduleRowNormalizedCountMap.get(scheduleRow) as NormalizedValue;
            const normalDate = scheduleRowNormalizedDateMap.get(scheduleRow) as NormalizedValue;
            const countSortValue = getSortValue<number>(normalCount.normalizedValue, countWeight, scheduleRow.count());
            const dueDateSortValue = getSortValue<Date>(normalDate.normalizedValue, dateWeight, scheduleRow.dueDate());
            return {
                ...scheduleRow.d,
                count: countSortValue,
                dueDate: dueDateSortValue,
                // TODO maybe add the length weight to config values
                finalSortValue: (
                    (countSortValue.weightedInverseLogNormalValue * (scheduleRow.d.word.length)) +
                    (1 - dueDateSortValue.weightedInverseLogNormalValue)
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
        scheduleRows.forEach(row => {
            const rowValue = valueFunction(row) || 0;
            if (maxValue < rowValue) {
                maxValue = rowValue;
            }
            if (minValue > rowValue) {
                minValue = rowValue;
            }
        });
        return scheduleRows.map(row => {
            return [
                {
                    normalizedValue: ScheduleMathService.normalize(valueFunction(row) || 0, minValue, maxValue),
                    value: valueFunction(row),
                    min: minValue,
                    max: maxValue,
                },
                row
            ];
        })
    }

    private static normalize(val: number, min: number, max: number) {
        return (val - min) / (max - min)
    }
}