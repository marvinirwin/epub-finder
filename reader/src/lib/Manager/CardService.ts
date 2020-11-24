import {merge, Observable, ReplaySubject, Subject} from "rxjs";
import {getIsMeFunction, ICard} from "../Interfaces/ICard";
import {Dictionary} from "lodash";
import trie from "trie-prefix-tree";
import {flatMap, map, scan, shareReplay, startWith} from "rxjs/operators";
import {Settings} from "../Interfaces/Message";
import {DatabaseService} from "../Storage/database.service";
import {TrieWrapper} from "../TrieWrapper";
import {TrieObservable} from "./QuizCharacter";
import {cardForWord} from "../Util/Util";

export default class CardService {
    public deleteWords: Subject<string[]> = new Subject<string[]>();
    public putWords$: Subject<string[]> = new Subject<string[]>();
    addPersistedCards$: Subject<ICard[]> = new Subject<ICard[]>();
    addUnpersistedCards$ = new Subject<ICard[]>();
    cardIndex$!: Observable<Dictionary<ICard[]>>;
    cardProcessingSignal$ = new ReplaySubject<boolean>(1);
    trie$: TrieObservable;

    static mergeCardIntoCardDict(newICard: ICard, o: { [p: string]: ICard[] }) {
        const detectDuplicateCard = getIsMeFunction(newICard);
        const presentCards = o[newICard.learningLanguage];
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

    constructor(public db: DatabaseService) {
        this.cardProcessingSignal$.next(true);
        const t = new TrieWrapper(trie([]));
        this.trie$ = t.changeSignal$;
        this.putWords$.subscribe(words => {
            this.addUnpersistedCards$.next(
                words.map(cardForWord)
            )
        })
        this.cardIndex$ = merge(
            this.addPersistedCards$.pipe(map(addCards => [addCards, []])),
            this.deleteWords.pipe(map(deleteCards => [[], deleteCards]))
        )
            .pipe(
                // @ts-ignore
                startWith([[], []]),
                scan((cardIndex: Dictionary<ICard[]>, [newCards, cardsToDelete]: [ICard[], string[]]) => {
                    t.removeWords(...cardsToDelete);
                    t.addWords(...Object.values(newCards).map(card => card.learningLanguage))
                    // TODO I think this is wrong because technically we can have more than 1 card per word
                    // But its a hack that works for now
                    cardsToDelete.forEach(cardToDelete => delete cardIndex[cardToDelete])
                    // TODO I dont think we need to shallow clone here
                    const newCardIndex = {...cardIndex};
                    newCards.forEach(newICard => {
                        CardService.mergeCardIntoCardDict(newICard, newCardIndex);
                    });
                    return newCardIndex;
                }, {}),
                shareReplay(1)
            );
        this.addUnpersistedCards$.pipe(
            map((cards) => {
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    this.db.cards.add(card).then(id => card.id = id);
                }
                return cards;
            })
        ).subscribe(this.addPersistedCards$);
        this.deleteWords.subscribe(cards => {
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                this.db.cards.where({learningLanguage: card}).delete();
            }
        })
    }

    async load() {
        this.cardProcessingSignal$.next(true);
        const unloadedCardCount = await this.db.getCardsInDatabaseCount()
        if (unloadedCardCount) {
            await this.getCardsFromDB();

        }
        this.cardProcessingSignal$.next(false);
    }

    private async getCardsFromDB() {
        const priorityCards = await this.db.settings.where({name: Settings.MOST_POPULAR_WORDS}).first();
        const priorityWords = priorityCards?.value || [];
        for await (const cards of this.db.getCardsFromDB({learningLanguage: priorityWords}, 100)) {
            this.addPersistedCards$.next(cards);
        }
        for await (const cards of this.db.getCardsFromDB({}, 500)) {
            this.addPersistedCards$.next(cards);
        }
    }
}