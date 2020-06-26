import {combineLatest, interval, merge, Observable, race, ReplaySubject, Subject, timer} from "rxjs";
import {getIsMeFunction, ICard} from "../Interfaces/ICard";
import {
    debounceTime, first,
    flatMap,
    map,
    mapTo,
    skip,
    startWith,
    switchMap,
    take,
    takeUntil,
    withLatestFrom
} from "rxjs/operators";
import {IndexDBManager, LocalStorageManager} from "../Storage/StorageManagers";
import {Manager} from "../Manager";
import {debounce} from "@material-ui/core";
import {WavAudio} from "../WavAudio";
import {getSynthesizedAudio} from "../AudioRecorder";

export class EditingCard {
    id?: number;
    deck$ = new ReplaySubject<string>(1);
    photos$ = new ReplaySubject<string[]>(1);
    illustrationPhotos$ = new ReplaySubject<string[]>(1);
    sounds$ = new ReplaySubject<string[]>(1);
    knownLanguage$ = new ReplaySubject<string[]>(1);
    learningLanguage$ = new ReplaySubject<string>(1);
    ankiPackage$ = new ReplaySubject<string>(1);
    collection$ = new ReplaySubject<string>(1);
    saveInProgress$ = new ReplaySubject<boolean>(1);
    cardClosed$ = new Subject<void>();
    synthesizedSpeech$: Observable<WavAudio>;
    recordedAudio$: Observable<WavAudio>;
    constructor(
        public persistor: IndexDBManager<ICard>,
        public m: Manager,
        public timestamp?: Date | number | undefined,
    ) {
        // TODO should this be a replaySubject with share?
        this.synthesizedSpeech$ = this.learningLanguage$.pipe(
            flatMap(getSynthesizedAudio)
        )
        this.recordedAudio$ = this.synthesizedSpeech$.pipe(
            withLatestFrom(
                this.learningLanguage$
            ),
            flatMap(async ([synthesizedWav, characters]) => {
                return this.m.recorder.getRecording(characters, await synthesizedWav.duration$.pipe(first()).toPromise());
            })
        )
        this.recordedAudio$.subscribe(v => console.log(v))

        this.saveInProgress$.next(false);
        let firstGroup$ = combineLatest(
            [
                this.photos$,
                this.sounds$,
                this.knownLanguage$,
                this.illustrationPhotos$
            ]
        );
        let secondGroup$ = combineLatest([
                this.deck$,
                this.collection$,
                this.ankiPackage$
            ]
        );

        let saveData$ = combineLatest(
            [
                firstGroup$,
                this.learningLanguage$,
                secondGroup$
            ]
            // This debounce Time and then skip means skip the first emit when we create the ReactiveClasses
        ).pipe(skip(1));

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
            [[photos, sounds, english, frontPhotos], characters, [deck, collection, ankiPackage]]
        ) => {
            const iCard: ICard = {
                id: this.id,
                collection,
                deck,
                photos,
                sounds,
                knownLanguage: english,
                learningLanguage: characters,
                ankiPackage,
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
                        ankiPackage: iCard.ankiPackage,
                        collection: iCard.collection,
                        learningLanguage: iCard.learningLanguage
                    })
                        .or("id").equals(iCard.id || 0)
                        .toArray()
            );
            if (!records.length || records.length > 1) {
                throw new Error("Upserting returned a weird array")
            }
            const rec = records[0];
            this.m.addCards$.next([rec])
            this.saveInProgress$.next(false);
        })
    }

    static fromICard(iCard: ICard, persistor: IndexDBManager<ICard>, m: Manager): EditingCard {
        const e = new EditingCard(persistor, m);
        e.deck$.next(iCard.deck || "NO_DECK");
        e.photos$.next(iCard.photos);
        e.illustrationPhotos$.next(iCard.illustrationPhotos);
        e.sounds$.next(iCard.sounds);
        e.knownLanguage$.next(iCard.knownLanguage);
        e.learningLanguage$.next(iCard.learningLanguage);
        e.ankiPackage$.next(iCard.ankiPackage || "NO_PACKAGE");
        e.collection$.next(iCard.collection || "NO_COLLECTION");
        e.id = iCard.id;
        return e;
    }

}