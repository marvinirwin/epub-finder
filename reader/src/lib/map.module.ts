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


export const mapFromId = <Value extends {id: number}>(values: Value[]): Map<number, Value> => {
    return new Map(values.map(value => [value.id, value]))
}

export const mapFromNamed = <Value extends {name: string}>(values: Value[]): Map<string, Value> => {
    return new Map(values.map(value => [value.name, value]))
}
