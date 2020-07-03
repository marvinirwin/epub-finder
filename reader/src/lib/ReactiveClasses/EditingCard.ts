import {combineLatest, interval, merge, Observable, race, ReplaySubject, Subject, timer} from "rxjs";
import {getIsMeFunction, ICard} from "../Interfaces/ICard";
import {
    debounceTime, first,
    flatMap,
    map,
    mapTo, share, shareReplay,
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
import { memoize, flatten } from "lodash";
import pinyin from 'pinyin';


interface IDefinition {
    traditional: string;
    simplified: string;
    pinyin: string;
}

export const lookup: (s: string) => string[] = memoize(s => flatten(pinyin(s)))


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
    synthesizedSpeech$: Observable<WavAudio>;
    recordedAudio$: Observable<WavAudio>;
    pinyin$: Observable<string>;
    constructor(
        public persistor: IndexDBManager<ICard>,
        public m: Manager,
        public timestamp?: Date | number | undefined,
    ) {
        // TODO should this be a replaySubject with share?
        this.synthesizedSpeech$ = this.learningLanguage$.pipe(
            flatMap(getSynthesizedAudio),
        )
        this.recordedAudio$ = this.synthesizedSpeech$.pipe(
            withLatestFrom(
                this.learningLanguage$
            ),
            flatMap(async ([synthesizedWav, characters]) => {
                return this.m.audioManager.audioRecorder.getRecording(characters, await synthesizedWav.duration$.pipe(first()).toPromise());
            })
        )
        // TODO Figure out who cares about the result of recordedAudio so we dont have to put a dummy subscribe here
        this.recordedAudio$.subscribe(v => {

        })

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
                this.deck$
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
            [[photos, sounds, english, frontPhotos], characters, [deck]]
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
            this.m.cardManager.addPersistedCards$.next([rec])
            this.saveInProgress$.next(false);
        });

        this.pinyin$ = this.learningLanguage$.pipe(map(s => {
            return s.split('').map(char => {
                let definitions = lookup(char);
                if (definitions) return definitions.join('/')
                return char;
            }).join(' ')
        }));

/*
        this.pinyin$.pipe(withLatestFrom(this.knownLanguage$)).subscribe(([pinyin, definition]) => {
            const defString = definition.join('');
            if (!defString || !defString.trim()) {
                this.knownLanguage$.next([pinyin]);
            }
        })
*/
    }

    static fromICard(iCard: ICard, persistor: IndexDBManager<ICard>, m: Manager): EditingCard {
        const e = new EditingCard(persistor, m);
        e.deck$.next(iCard.deck || "NO_DECK");
        e.photos$.next(iCard.photos);
        e.illustrationPhotos$.next(iCard.illustrationPhotos);
        e.sounds$.next(iCard.sounds);
        e.knownLanguage$.next(iCard.knownLanguage);
        e.learningLanguage$.next(iCard.learningLanguage);
        e.id = iCard.id;
        return e;
    }

}