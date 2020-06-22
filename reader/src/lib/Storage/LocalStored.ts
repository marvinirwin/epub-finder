import {Subject} from "rxjs";

export function LocalStored<V, T extends Subject<V>>(t: T, key: string, defaultValue?: V): T {
    let text = localStorage.getItem(key);
    if (text) {
        t.next(JSON.parse(text))
    } else {
        t.next(defaultValue);
    }
    t.subscribe(v => localStorage.setItem(key, JSON.stringify(v)));
    return t;
}