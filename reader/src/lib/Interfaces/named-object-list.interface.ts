import {Named} from "../Manager/OpenBooks";
import {ds_Dict} from "../Tree/DeltaScanner";

export interface NamedObjectList<T extends Named> {
    listObjects: T[] | ds_Dict<T>;
    onSelect: (v: T) => void;
    onDelete?: (v: T) => void;
}
