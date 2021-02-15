import {filter, map, pairwise, shareReplay, startWith, switchMap, take, withLatestFrom} from "rxjs/operators";
import {Observable, of, ReplaySubject} from "rxjs";
import {EditingCard} from "../reactive-classes/EditingCard";
import {WavAudio} from "../WavAudio";

export default class EditingCardManager {
    showEditingCardPopup$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    queEditingCard$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1);
    editingCardIsSaving!: Observable<boolean | undefined>;
    editingCard$!: Observable<EditingCard | undefined>;
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);

/*
    currentEditingSynthesizedWavFile$: Observable<WavAudio | undefined>;
*/

    constructor() {
        this.editingCard$ = this.queEditingCard$.pipe(

            startWith(undefined),
            pairwise(),
            switchMap(([previousCard, newCard]) => {
                if (!previousCard) {
                    return of(newCard)
                }
                return this.editingCardIsSaving.pipe(
                    filter((saving) => !saving),
                    map(() => {
                        previousCard.cardClosed$.next();
                        return newCard;
                    }),
                    take(1)
                )
            }),

        );
/*
        this.currentEditingSynthesizedWavFile$ = this.editingCard.pipe(
            filter(c => !!c),
            switchMap(c => {
                return (c as EditingCard).synthesizedSpeech$;
            })
        )
*/
        this.editingCardIsSaving = this.editingCard$.pipe(
            switchMap(c =>
                c ? c.saveInProgress$ : of(undefined)
            ),
            shareReplay(1)
        );
        this.queEditingCard$
            .pipe(withLatestFrom(this.showEditingCardPopup$.pipe(startWith(false))))
            .subscribe(([queuedEditingCard, showEditingCardPopup]) => {
                if (!showEditingCardPopup && queuedEditingCard) {
                    this.showEditingCardPopup$.next(true);
                }
            });

        this.showEditingCardPopup$.subscribe(v => {
            console.log()
            // Why does this fix it??
        })
    }
}

