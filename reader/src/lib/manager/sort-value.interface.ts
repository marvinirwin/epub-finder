import {SortValue} from "../schedule/schedule-row";

export function getInverseLogNormalValue(normalCount: number) {
    if (normalCount === 0) {
        return 0;
    }
    return normalCount;
}

export function getSortValue<T>(normalizedValue: number, weight: number, value: T): SortValue<T> {
    return {
        value,
        weight,
        normalValue: normalizedValue,
        inverseLogNormalValue: getInverseLogNormalValue(normalizedValue),
        weightedInverseLogNormalValue: getInverseLogNormalValue(normalizedValue) * weight,
    };
}