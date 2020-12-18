import {flatMap, shareReplay, switchMap} from "rxjs/operators";
import {printExecTime} from "../../Util/Timer";
import {BrowserInputs} from "../../Hotkeys/BrowserInputs";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE, AtomizedDocument} from "../../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../../Interfaces/XMLDocumentNode";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {appendDocumentStyle} from "../AppendDocumentStyle";
import {ds_Dict} from "../../Tree/DeltaScanner";
import {DOMParser, XMLSerializer} from "xmldom";
import {waitFor} from "../../Util/waitFor";

