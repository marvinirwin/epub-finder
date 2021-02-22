import { Dictionary } from "lodash";

export function safePush(inMap: Dictionary<any[]>, key: string, val: any) {
    if (!inMap[key]) inMap[key] = [];
    inMap[key].push(val);
}

export function safePushSet<V>(inMap: Dictionary<Set<V>>, key: string, val: V) {
    if (!inMap[key]) inMap[key] = new Set();
    inMap[key].add(val);
}
export function safePushMapSet<V, Key>(inMap: Map<Key, Set<V>>, key: Key, val: V) {
    if (!inMap.get(key)) inMap.set(key, new Set());
    (inMap.get(key) as Set<V>).add(val);
}
export const safePushMap = <T, U>(map: Map<T, U[]>, key: T, ...value: U[]) => {
    const existingEntry = map.get(key);
    if (existingEntry) {
        existingEntry.push(...value);
    } else {
        map.set(key, value);
    }
}
