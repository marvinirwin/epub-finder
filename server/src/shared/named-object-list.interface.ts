import {Named} from "./named.type";

export interface NamedObjectList<T extends Named> {
    listObjects: T[] | {[key: string]: T};
    onSelect: (v: T) => void;
    onDelete?: (v: T) => void;
}
