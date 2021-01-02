import {merge, Observable, ReplaySubject, Subject} from "rxjs";
import {getIsMeFunction, ICard} from "../Interfaces/ICard";
import {Dictionary} from "lodash";
import { flatMap, map, scan, shareReplay, startWith} from "rxjs/operators";
import {Settings} from "../Interfaces/Message";
import {DatabaseService} from "../Storage/database.service";
import {cardForWord} from "../Util/Util";

export default class CardsService {
    public deleteWords: Subject<string[]> = new Subject<string[]>();
    public putWords$: Subject<string[]> = new Subject<string[]>();
    addPersistedCards$: Subject<ICard[]> = new Subject<ICard[]>();
    addUnpersistedCards$ = new Subject<ICard[]>();
    cardIndex$!: Observable<Dictionary<ICard[]>>;
    cardProcessingSignal$ = new ReplaySubject<boolean>(1);
    newWords$: Observable<string[]>
    private db: DatabaseService;

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

    constructor({
                    databaseService
                }: {
        databaseService: DatabaseService,
    }) {
        this.db = databaseService;
        this.cardProcessingSignal$.next(true);

        this.putWords$.subscribe(words => {
            this.addUnpersistedCards$.next(
                words.map(cardForWord)
            )
        });

        this.newWords$= this.addPersistedCards$.pipe(
            map(cards => cards.map(card => card.learningLanguage)),
            shareReplay(1)
        );
        this.cardIndex$ = merge(
            this.addPersistedCards$.pipe(
                map(addCards => [addCards, []]),
            ),
            this.deleteWords.pipe(
                map(deleteCards => [[], deleteCards]),
            )
        ).pipe(
            // @ts-ignore
            startWith([[], []]),
            scan((cardIndex: Dictionary<ICard[]>, [newCards, cardsToDelete]: [ICard[], string[]]) => {
                try {
                    // TODO I think this is wrong because technically we can have more than 1 card per word
                    // But its a hack that works for now
                    cardsToDelete.forEach(cardToDelete => delete cardIndex[cardToDelete])
                    // TODO I dont think we need to shallow clone here
                    const newCardIndex = {...cardIndex};
                    newCards.forEach(newICard => {
                        CardsService.mergeCardIntoCardDict(newICard, newCardIndex);
                    });
                    return newCardIndex;
                } catch (e) {
                    console.warn(e)
                    return {}
                }
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