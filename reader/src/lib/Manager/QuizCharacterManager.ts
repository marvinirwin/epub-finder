import {ColdSubject} from "../Util/ColdSubject";
import {ReplaySubject, Subject} from "rxjs";
import {DeltaScan, DeltaScannerDict} from "../Util/DeltaScanner";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {filter, scan, withLatestFrom} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {Frame} from "../BookFrame/Frame";

export const EMPTY_SRC = (src: string = '') => `

<head>
<title>QuizCharactePageFrame</title>
</head>
<body>
<div>
${src}
</div>
</body>
`

export class QuizCharacterManager {
    exampleSentences$ = new ColdSubject<DeltaScan<string>>();
    learningLanguage$ = new Subject<string | undefined>();
    atomizedSentenceMap$ = new ReplaySubject<DeltaScannerDict<AtomizedSentence>>(1);
    frame = new Frame();
    constructor() {
        /**
         * If we have a learningLanguage, and have less than 10 sentences
         * I want to hear about deltas in the sentenceMap about my word to see if there are new ones
         */
        this.exampleSentences$.obs$.pipe(
            withLatestFrom(this.frame.iframe$, this.atomizedSentenceMap$),
            scan((
                currentExampleSentenceElements: DeltaScannerDict<string>,
                [{delta}, {body, iframe}, atomizedSentenceMap],
            ) => {
                const doc = new AtomizedDocument(body.ownerDocument as XMLDocument);
                Object.keys(delta.remove || {}).forEach(sentenceToRemove => {
                    atomizedSentenceMap[sentenceToRemove].destroy();
                    delete atomizedSentenceMap[sentenceToRemove];
                })
                Object.keys(delta.set || {}).forEach((sentenceToAdd: string) => {
                    atomizedSentenceMap[sentenceToAdd] = new AtomizedSentence(
                        doc.appendRehydratableText(sentenceToAdd)
                    );
                });
                return currentExampleSentenceElements;
            }, {})
        ).subscribe(() => {
            // HACK, because I want the side effects of my scan
        })
    }
}