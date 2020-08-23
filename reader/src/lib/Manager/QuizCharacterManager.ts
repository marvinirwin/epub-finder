import {ColdSubject} from "../Util/ColdSubject";
import {ReplaySubject, Subject} from "rxjs";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {OpenBook} from "../BookFrame/OpenBook";
import {IFrameBookRenderer} from "../BookFrame/Renderer/IFrameBookRenderer";
import {DeltaScan, ds_Dict} from "../Util/DeltaScanner";
import {ICard} from "../Interfaces/ICard";
import {AppContext} from "../AppContext/AppContext";
import {map} from "rxjs/operators";

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
    exampleSentences = new ColdSubject<AtomizedSentence[]>();
    quizzingCard$ = new ColdSubject<ICard | undefined>();
    atomizedSentenceMap$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1);
    public exampleSentencesFrame = new OpenBook(
        getSrc([]),
        'character_translation',
        new IFrameBookRenderer()
    );

    constructor(c: AppContext) {
        this.exampleSentences.obs$.pipe(
            map(sentences => getSrc(sentences.map(sentence => sentence.translatableText)))
        ).subscribe(this.exampleSentencesFrame.renderer.srcDoc$);
        /**
         * If we have a learningLanguage, and have less than 10 sentences
         * I want to hear about deltas in the sentenceMap about my word to see if there are new ones
         */
        /*
                obs$.subscribe(args => {
                    console.log();
                })
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