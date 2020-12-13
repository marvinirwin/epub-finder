import { Dictionary } from "lodash";

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
