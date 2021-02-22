import {ScheduleRow} from "../schedule/ScheduleRow";
import {orderBy} from "lodash";
import {NormalizedScheduleRowData} from "../schedule/schedule-row.interface";
import {getSortValue} from "./sort-value.interface";

export class ScheduleMathService {

    public static sortScheduleRows(
        scheduleRows: ScheduleRow [],
        dateWeight: number,
        countWeight: number,
    ): ScheduleRow<NormalizedScheduleRowData>[] {
        const scheduleRowNormalizedDateMap = new Map<ScheduleRow, number>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.dueDate().getTime() * -1
        ).map(([n, row]) => {
            return [
                row,
                n
            ];
        }));

        const scheduleRowNormalizedCountMap = new Map<ScheduleRow, number>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.count()
        ).map(([n, row]) => [
            row,
            n,
        ]));

        const sortableScheduleRows: NormalizedScheduleRowData[] = scheduleRows.map(scheduleRow => {
            const normalCount = scheduleRowNormalizedCountMap.get(scheduleRow) as number;
            const normalDate = scheduleRowNormalizedDateMap.get(scheduleRow) as number;
            const countSortValue = getSortValue<number>(normalCount, countWeight, scheduleRow.count());
            const dueDateSortValue = getSortValue<Date>(normalDate, dateWeight, scheduleRow.dueDate());
            return {
                ...scheduleRow.d,
                count: countSortValue,
                dueDate: dueDateSortValue,
                finalSortValue: ((countSortValue.weightedInverseLogNormalValue * (scheduleRow.d.word.length)) +
                    dueDateSortValue.weightedInverseLogNormalValue)
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
    ): [number, T][] {
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
                ScheduleMathService.normalize(valueFunction(row) || 0, minValue, maxValue),
                row
            ];
        })
    }

    private static normalize(val: number, min: number, max: number) {
        const v = (val - min) / (max - min);
        return v
    }
}