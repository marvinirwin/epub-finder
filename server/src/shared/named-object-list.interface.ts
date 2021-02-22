import {ds_Dict} from "../../../reader/src/lib/Tree/DeltaScanner";
import {Named} from "./named.type";

export interface NamedObjectList<T extends Named> {
    listObjects: T[] | ds_Dict<T>;
    onSelect: (v: T) => void;
    onDelete?: (v: T) => void;
}
