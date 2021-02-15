import {ScheduleRow} from "../schedule/ScheduleRow";
import {orderBy, sum} from "lodash";
import {NormalizedScheduleRowData, SortValue} from "../schedule/schedule-row.interface";

function getInverseLogNormalValue(normalCount: number) {
    if (normalCount === 0) {
        return 0;
    }
    return /*normalCount - */Math.log(normalCount);
}

function getSortValue<T>(normalizedValue: number, weight: number, value: T): SortValue<T> {
    return {
        value,
        weight,
        normalValue: normalizedValue,
        inverseLogNormalValue: getInverseLogNormalValue(normalizedValue),
        weightedInverseLogNormalValue: getInverseLogNormalValue(normalizedValue) * weight,
    };
}

export class ScheduleMathService {

    public static sortScheduleRows(
        scheduleRows: ScheduleRow [],
        dateWeight: number,
        countWeight: number,
    ): ScheduleRow<NormalizedScheduleRowData>[] {
        const scheduleRowNormalizedDateMap = new Map<ScheduleRow, number>(ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            row => row.dueDate().getTime()
        ).map(([n, row]) => {
            return [
                row,
                1 - n
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
                finalSortValue: countSortValue.weightedInverseLogNormalValue +
                    dueDateSortValue.weightedInverseLogNormalValue
            } as NormalizedScheduleRowData;
        })

        return orderBy(sortableScheduleRows.map(r => new ScheduleRow<NormalizedScheduleRowData>(r)), r => r.d.finalSortValue, 'desc')
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
        })
        return scheduleRows.map(row => [
            ScheduleMathService.normalize(valueFunction(row) || 0, minValue, maxValue),
            row
        ])
    }

    private static normalize(val: number, min: number, max: number) {
        return (val - min) / (max - min)
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
                resultMap.set(value, sum(valueNumberMaps.map(map => map.get(value))) || 0);
            })
        });
        return resultMap;
    }

    private static orderMappedValues<T>(valueNumberMap: Map<T, number>): T[] {
        return orderBy([...valueNumberMap.entries()], ([, n]) => n, 'desc')
            .map(([value]) => value)
    }
}