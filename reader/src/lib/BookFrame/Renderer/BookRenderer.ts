import {Observable, ReplaySubject, Subject} from "rxjs";
import {ColdSubject} from "../../Util/ColdSubject";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {Frame} from "../Frame";
import {ds_Dict} from "../../Util/DeltaScanner";

export class BookRenderer {
    srcDoc$ = new ReplaySubject<string>(1);
    frame$ = new ColdSubject<Frame>();
    atomizedSentences$ = new ColdSubject<ds_Dict<AtomizedSentence>>();
}