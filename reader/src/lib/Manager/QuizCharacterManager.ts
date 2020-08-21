import {ColdSubject} from "../Util/ColdSubject";
import {ReplaySubject, Subject} from "rxjs";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {filter, scan, withLatestFrom} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {Frame} from "../BookFrame/Frame";
import {BookFrameRendererIFrame} from "../BookFrame/Renderer/BookFrameRendererInIFrame";
import {DeltaScan, ds_Dict, getDeletedValues} from "../Util/DeltaScanner";

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

function getSrc(sentences: string[]) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Random Title</title>
</head>
<body>
${sentences.map(sentence => {
        return `<div>${sentence}</div>`;
    })}
</body>
</html>
        `;
}

export class QuizCharacterManager {
    exampleSentences$ = new ColdSubject<DeltaScan<string>>();
    learningLanguage$ = new Subject<string | undefined>();
    atomizedSentenceMap$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1);
    public bookFrame = new BookFrame(
        getSrc([]),
        'character_translation',
        new BookFrameRendererIFrame()
    );

    constructor() {
        /**
         * If we have a learningLanguage, and have less than 10 sentences
         * I want to hear about deltas in the sentenceMap about my word to see if there are new ones
         */
/*
        this.exampleSentences$.obs$.pipe(
            withLatestFrom(
                this.bookFrame.frame.iframe$,
                this.atomizedSentenceMap$
            ),
            scan((
                currentExampleSentenceElements: ds_Dict<string>,
                [{ delta}, {body, iframe}, atomizedSentenceMap],
            ) => {
                const doc = new AtomizedDocument(body.ownerDocument as XMLDocument);
                const v = getDeletedValues(delta);
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
        });

*/
    }
}