import {Observable, ReplaySubject, Subject} from "rxjs";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {Frame} from "../Frame";
import {ds_Dict} from "../../Util/DeltaScanner";

export interface BookRenderer {
    srcDoc$: ReplaySubject<string>;
    frame$: ReplaySubject<Frame>;
    body$: ReplaySubject<HTMLBodyElement>;
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence>>;
}