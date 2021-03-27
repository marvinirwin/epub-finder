export const mapMap = <Key, Value, NewKey, NewValue>(
    m: Map<Key, Value>,
    fn: (key: Key, value: Value) => [NewKey, NewValue]) =>
    new Map(Array.from(m).map(([key, value]) => fn(key, value)));


export const filterMap = <Key, Value>(m: Map<Key, Value>, predicate: (key: Key, value: Value) => boolean) =>
    new Map(Array.from(m).filter(([key, value]) => predicate(key, value)));

export const mapToArray = <Key, Value, NewValue>(m: Map<Key, Value>, fn: (key: Key, value: Value) => NewValue) =>
    Array.from(m).map(([key, value]) => fn(key, value))

export const findMap = <Key, Value>(m: Map<Key, Value>, fn: (key: Key, value: Value) => boolean): Value | undefined =>
    Array.from(m).find(([key, value]) => fn(key, value))?.[1];

export const firstMap = <Key, Value>(m: Map<Key, Value>): Value => m.values().next().value


export const mapFromId = <IdType extends number | string, Value>(
    values: Value[],
    idFunc: (v: Value) => IdType
    ): Map<IdType, Value> => {
    return new Map(values.map(value => [idFunc(value), value]))
}

export const mergeMaps = <T, U>(...maps: Map<T, U>[]): Map<T, U> => {
    const m = new Map();
    maps.map(map => map.forEach((value, key) => m.set(key, value)))
    return m;
}

export const deleteMap = <T, U>(m: Map<T, U>, key: T) => {
    m.delete(key)
    return new Map(m);
}