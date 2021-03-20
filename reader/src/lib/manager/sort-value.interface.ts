import {SortValue} from "../schedule/schedule-row";
import {NormalizedValue} from "./normalized-value.interface";

export function getInverseLogNormalValue(normalCount: number) {
    if (normalCount === 0) {
        return 0;
    }
    return normalCount;
}

export function getSortValue<T>(
    normalizedValueObject: NormalizedValue, weight: number, value: T): SortValue<T> {
    const normalizedValue = normalizedValueObject.normalizedValue
    return {
        value,
        weight,
        normalizedValueObject,
        normalValue: normalizedValue,
        inverseLogNormalValue: getInverseLogNormalValue(normalizedValue),
        weightedInverseLogNormalValue: getInverseLogNormalValue(normalizedValue) * weight,
    };
}