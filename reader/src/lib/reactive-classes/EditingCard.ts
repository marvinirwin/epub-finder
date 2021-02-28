import {combineLatest, Observable, of, race, ReplaySubject, Subject, timer} from "rxjs";
import {ICard} from "../../../../server/src/shared/ICard";
import {flatMap, map, mapTo, shareReplay, skip, switchMap,} from "rxjs/operators";
import {IndexDBManager} from "../Storage/indexed-db";
import CardsRepository from "../manager/cards.repository";





export class EditingCard {
    id?: number;
    deck$ = new ReplaySubject<string>(1);
    photos$ = new ReplaySubject<string[]>(1);
    illustrationPhotos$ = new ReplaySubject<string[]>(1);
    sounds$ = new ReplaySubject<string[]>(1);
    knownLanguage$ = new ReplaySubject<string[]>(1);
    learningLanguage$ = new ReplaySubject<string>(1);
    saveInProgress$ = new ReplaySubject<boolean>(1);
    cardClosed$ = new Subject<void>();
    // pinyin$: Observable<string>;
    translation$: Observable<string>;

    constructor(
        public persistor: IndexDBManager<ICard>,
        private c: CardsRepository,
        public timestamp?: Date | number | undefined,
    ) {

        this.translation$ = of('todo');
/*
        this.translation$ = this.learningLanguage$.pipe(
            flatMap(async (learningLanguage) =>
                learningLanguage ? await fetchTranslation(learningLanguage) : ''
            )
        )
*/
        this.saveInProgress$.next(false);
        const saveData$ = this.saveDataObservable();

        saveData$.subscribe(() => {
            this.saveInProgress$.next(true);
        })

        saveData$.pipe(
            switchMap((d) =>
                race(
                    timer(1000),
                    this.cardClosed$
                ).pipe(mapTo(d))
            )
        ).subscribe(async (
            [photos, sounds, english, frontPhotos, characters, deck]
        ) => {
            const iCard: ICard = {
                id: this.id,
                deck,
                photos,
                sounds,
                knownLanguage: english,
                learningLanguage: characters,
                illustrationPhotos: frontPhotos,
                fields: [],
                timestamp: this.timestamp || new Date()
            };
            // I need to handle the case where there is a card cached which is newer than the one getting persisted
            // Whatever, I'll do that later
            // Also I have no idea if isMeWhere is going to work
            const records = await persistor.upsert(
                iCard,
                (t: Dexie.Table<ICard>) =>
                    t.where({
                        deck: iCard.deck,
                        learningLanguage: iCard.learningLanguage
                    })
                        .or("id").equals(iCard.id || 0)
                        .toArray()
            );
            if (!records.length || records.length > 1) {
                throw new Error("Upserting returned a weird array")
            }
            const rec = records[0];
            this.c.addCardsWhichDoNotHaveToBePersisted$.next([rec])
            this.saveInProgress$.next(false);
        });

        // this.pinyin$ = this.learningLanguage$.pipe(switchMap(pinyin), shareReplay(1));
    }

    private saveDataObservable() {
        return combineLatest(
            [
                this.photos$,
                this.sounds$,
                this.knownLanguage$,
                this.illustrationPhotos$,
                this.learningLanguage$,
                this.deck$
            ]
            // This debounce Time and then skip means skip the first emit when we create the reactive-classes
        ).pipe(skip(1));
    }

    static fromICard( iCard: ICard, persistor: IndexDBManager<ICard>, c: CardsRepository): EditingCard {
        const e = new EditingCard(
            persistor,
            c
        );
        e.deck$.next(iCard.deck || "");
        e.photos$.next(iCard.photos);
        e.illustrationPhotos$.next(iCard.illustrationPhotos);
        e.sounds$.next(iCard.sounds);
        e.knownLanguage$.next(iCard.knownLanguage);
        e.learningLanguage$.next(iCard.learningLanguage);
        e.id = iCard.id;
        return e;
    }

}