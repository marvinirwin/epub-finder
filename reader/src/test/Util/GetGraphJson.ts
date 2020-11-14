import {Dictionary} from "lodash";

export type Point = [number, number];

export type Neighbor = [number, number, RegExp];

export type BoundingBox = [Point, Point];

export const nodeRegexp = /[a-zA-Z.()$]/;

export function safePush(inMap: Dictionary<any[]>, key: string, val: any) {
    if (!inMap[key]) inMap[key] = [];
    inMap[key].push(val);
}

export const safePushMap = <T, U>(map: Map<T, U[]>, key: T, ...value: U[]) => {
    const existingEntry = map.get(key);
    if (existingEntry) {
        existingEntry.push(...value);
    } else {
        map.set(key, value);
    }
}

export function setCharAt(str: string, index: number, chr: string) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

