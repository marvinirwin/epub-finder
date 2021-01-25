import {ScheduleRow} from "../schedule/schedule-row.interface";
import {dueDate} from "../schedule/ScheduleRow";
import { sum, orderBy } from "lodash";

function getTime(row: ScheduleRow) {
    return dueDate(row).getTime();
}

export class ScheduleMathService {

    public static sortScheduleRows(
        scheduleRows: ScheduleRow[],
        dateWeight: number,
        freqWeight: number,
    ) {
        const dateEntries: [ScheduleRow, number][] = ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => dueDate(row).getTime()
        ).map(([n, row]) => [row, n * dateWeight]);

        const frequencyEntries: [ScheduleRow, number][] = ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => sum(row.wordCountRecords.map(row => row.count))
        ).map(([n, row]) => [
            row,
            n * freqWeight,
        ]);

        return ScheduleMathService.orderMappedValues(
            ScheduleMathService.addValuesMappedToNumbers(
                new Map(ScheduleMathService.inverseLog(dateEntries)),
                new Map(ScheduleMathService.inverseLog(frequencyEntries))
            )
        )
    }

    private static normalizeScheduleRows(
        scheduleRows: ScheduleRow[],
        valueFunction: (r: ScheduleRow) => number
    ): [number, ScheduleRow][] {
        let maxValue = Number.MIN_SAFE_INTEGER;
        let minValue = Number.MAX_SAFE_INTEGER;
        scheduleRows.forEach(row => {
            const rowValue = valueFunction(row);
            if (maxValue < rowValue) {
                maxValue = rowValue;
            }
            if (minValue > rowValue) {
                minValue = rowValue;
            }
        })
        return scheduleRows.map(row => [
            ScheduleMathService.normalize(valueFunction(row), minValue, maxValue),
            row
        ])
    }

    private static normalize(val: number, min: number, max: number) {
        return (val - min) / (max - min)
    }

    private static inverseLog<T>(normalizedValues: [T, number][]): [T, number][] {
        return normalizedValues.map(([o, normalValue]) => [o, normalValue - Math.log(normalValue)])
    }

    private static addValuesMappedToNumbers<T>(...valueNumberMaps: Map<T, number>[]) {
        const resultMap = new Map<T, number>();
        const usedSet = new Set<T>();
        valueNumberMaps.forEach((valueNumberMap: Map<T, number>) => {
            valueNumberMap.forEach((numericalValue, value) => {
                if (usedSet.has(value)) {
                    return;
                }
                usedSet.add(value);
                resultMap.set(value, sum(valueNumberMaps.map(map => map.get(value))));
            })
        });
        return resultMap;
    }

    private static orderMappedValues<T>(valueNumberMap: Map<T, number>): T[]{
        return orderBy([...valueNumberMap.entries()], ([value, number]) => number, 'desc')
            .map(([value, number]) => value)
    }
}