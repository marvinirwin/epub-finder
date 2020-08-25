import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {map, shareReplay} from "rxjs/operators";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {TrieWrapper} from "../TrieWrapper";
import {TextWordData} from "../Atomized/TextWordData";
import {BookRenderer} from "./Renderer/BookRenderer";
import {Frame} from "./Frame";


export class OpenBook {
    public frame = new Frame();

    // This shouldn't be an observable, right?
    public id: string;
    public text$: Observable<string>;
    public wordCountRecords$ = new ReplaySubject<IWordCountRow[]>(1);
    public textData$: Observable<TextWordData>;

    constructor(
        srcDoc: string,
        public name: string,
        public renderer: BookRenderer,
        public trie: Observable<TrieWrapper>
    ) {
        this.id = name;
        this.text$ = this.renderer.atomizedSentences$.pipe(
            map(atomizedSentences => {
                debugger;
                return Object
                    .values(atomizedSentences).map(atomizedSentence => atomizedSentence.translatableText)
                    .join('\n');
            }),
            shareReplay(1)
        );


        this.renderer.frame$.next(this.frame);
        this.renderer.atomizedSentences$.subscribe(() => {
            console.log();
        });
        this.renderer.srcDoc$.next(srcDoc);
        this.text$.subscribe(text => {
            const countedCharacters: Dictionary<number> = text
                .split('')
                .filter(isChineseCharacter)
                .reduce((acc: Dictionary<number>, letter) => {
                    if (!acc[letter]) {
                        acc[letter] = 1;
                    } else {
                        acc[letter]++;
                    }
                    return acc;
                }, {});

            this.wordCountRecords$.next(
                Object.entries(countedCharacters).map(([letter, count]) => ({
                    book: this.name,
                    word: letter,
                    count
                }))
            )
        })


        /*
                this.atomizedSentencesFromSrc$.pipe(
                    withLatestFrom(this.manuallyAddedAtomizedSentences.updates$, this.frame.iframe$)
                ).subscribe(([atomizedSentencesFromSrc, {sourced}, iframeBbdy]) => {
                    Object.values(sourced).map(v => v.value).forEach(manuallyAddedSentence => {
                        manuallyAddedSentence.(iframebody);
                    })
                })
        */


        this.textData$ = combineLatest([
            this.trie,
            this.renderer.atomizedSentences$
        ]).pipe(
            map(([trie, sentences]) => {
                    debugger;
                    return AtomizedSentence.getTextWordData(Object.values(sentences), trie.t, trie.getUniqueLengths());
                },
            ),
            shareReplay(1)
        )
    }


    getRenderParentElementId() {
        return `render_parent_${this.name}`
    }
}

