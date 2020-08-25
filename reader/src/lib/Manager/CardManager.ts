import {Observable, ReplaySubject, Subject} from "rxjs";
import {getIsMeFunction, ICard} from "../Interfaces/ICard";
import {Dictionary} from "lodash";
import trie from "trie-prefix-tree";
import {flatMap, scan, shareReplay, startWith} from "rxjs/operators";
import {Settings} from "../Interfaces/Message";
import {MyAppDatabase} from "../Storage/AppDB";
import {TrieObservable} from "../AppContext/WorkerGetBookRenderer";
import {TrieWrapper} from "../TrieWrapper";

export default class CardManager {
    addPersistedCards$: Subject<ICard[]> = new Subject<ICard[]>();
    addUnpersistedCards$ = new Subject<ICard[]>();
    cardIndex$!: Observable<Dictionary<ICard[]>>;
    cardProcessingSignal$ = new ReplaySubject<boolean>(1);
    trie$: TrieObservable;

    static mergeCardIntoCardDict(newICard: ICard, o: { [p: string]: ICard[] }) {
        const detectDuplicateCard = getIsMeFunction(newICard);
        let presentCards = o[newICard.learningLanguage];
        if (presentCards) {
            const indexOfDuplicateCard = presentCards.findIndex(detectDuplicateCard);
            if (indexOfDuplicateCard >= 0) {
                const presentCard = presentCards[indexOfDuplicateCard];
                if (newICard.timestamp > presentCard.timestamp) {
                    presentCards[indexOfDuplicateCard] = newICard;
                }
            } else {
                presentCards.push(newICard)
            }
        } else {
            o[newICard.learningLanguage] = [newICard]
        }
    }

    constructor(public db: MyAppDatabase) {
        this.cardProcessingSignal$.next(false);
        this.trie$ = this.addPersistedCards$.pipe(
            startWith([]),
            scan((trie: TrieWrapper, newCards: ICard[]) => {
                trie.addWords(
                    ...newCards.map(
                        card => card.learningLanguage
                    )
                );
                return trie;
            }, new TrieWrapper(trie([]))),
            shareReplay(1)
        )
        this.cardIndex$ = this.addPersistedCards$.pipe(
            startWith([]),
            scan((cardIndex: Dictionary<ICard[]>, newCards) => {
                const o = {...cardIndex};
                newCards.forEach(newICard => {
                    CardManager.mergeCardIntoCardDict(newICard, o);
                });
                return o;
            }, {}),
            shareReplay(1)
        );
        this.addUnpersistedCards$.pipe(
            flatMap(async cards => {
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    card.id = await this.db.cards.add(card);
                }
                return cards;
            })
        ).subscribe(this.addPersistedCards$);
    }
    async load() {
        this.cardProcessingSignal$.next(true);
        let unloadedCardCount = await this.db.getCardsInDatabaseCount()
        if (unloadedCardCount) {
            await this.getCardsFromDB();
        }
        this.cardProcessingSignal$.next(false);
    }

    private async getCardsFromDB() {
        const priorityCards = await this.db.settings.where({key: Settings.MOST_POPULAR_WORDS}).first();
        const priorityWords = priorityCards?.value || [];
        for await (let cards of this.db.getCardsFromDB({learningLanguage: priorityWords}, 100)) {
            this.addPersistedCards$.next(cards);
        }
        for await (let cards of this.db.getCardsFromDB({}, 500)) {
            this.addPersistedCards$.next(cards);
        }
    }
}