import {combineLatest, Observable, race, ReplaySubject, Subject, timer} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {flatMap, map, mapTo, skip, switchMap,} from "rxjs/operators";
import {IndexDBManager} from "../Storage/StorageManagers";
import {flatten, memoize} from "lodash";
import pinyin from 'pinyin';
import {AudioManager} from "../Manager/AudioManager";
import CardManager from "../Manager/CardManager";
import {fetchTranslation} from "../Util/Util";


interface IDefinition {
    traditional: string;
    simplified: string;
    pinyin: string;
}

export const lookupPinyin: (s: string) => string[] = memoize(s => flatten(pinyin(s)))


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
    pinyin$: Observable<string>;
    translation$: Observable<string>;

    constructor(
        public persistor: IndexDBManager<ICard>,
        private c: CardManager,
        public timestamp?: Date | number | undefined,
    ) {

        this.translation$ = this.learningLanguage$.pipe(
            flatMap(async (learningLanguage) =>
                learningLanguage ? await fetchTranslation(learningLanguage) : ''
            )
        )
        this.saveInProgress$.next(false);
        let saveData$ = this.saveDataObservable();

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
            this.c.addPersistedCards$.next([rec])
            this.saveInProgress$.next(false);
        });

        this.pinyin$ = this.learningLanguage$.pipe(map(s => {
            return s.split('').map(char => {
                let definitions = lookupPinyin(char);
                if (definitions) return definitions.join('/')
                return char;
            }).join(' ')
        }));
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
            // This debounce Time and then skip means skip the first emit when we create the ReactiveClasses
        ).pipe(skip(1));
    }

    static fromICard( iCard: ICard, persistor: IndexDBManager<ICard>, c: CardManager): EditingCard {
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