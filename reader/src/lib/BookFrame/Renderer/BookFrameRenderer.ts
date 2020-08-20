import {Observable, Subject} from "rxjs";
import {ColdSubject} from "../../Util/ColdSubject";
import {DeltaScannerDict} from "../../Util/DeltaScanner";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {Frame} from "../Frame";

namespace BookFrameRenderer {

}

export class BookFrameRenderer {
    srcDoc$ = new Subject<string>();
    frame$ = new ColdSubject<Frame>();
    atomizedSentences$ = new Observable<DeltaScannerDict<AtomizedSentence>>();
}