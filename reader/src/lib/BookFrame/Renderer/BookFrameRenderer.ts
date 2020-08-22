import {Observable, Subject} from "rxjs";
import {ColdSubject} from "../../Util/ColdSubject";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {Frame} from "../Frame";
import {ds_Dict} from "../../Util/DeltaScanner";

export class BookFrameRenderer {
    srcDoc$ = new Subject<string>();
    frame$ = new ColdSubject<Frame>();
    atomizedSentences$ = new Subject<ds_Dict<AtomizedSentence>>();
}