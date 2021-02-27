import {BehaviorSubject, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {getIsMeFunction, ICard} from "../../../../server/src/shared/ICard";
import {Dictionary, orderBy, maxBy, flatten} from "lodash";
import {map, scan, shareReplay, startWith} from "rxjs/operators";
import {Settings} from "../../../../server/src/shared/Message";
import {DatabaseService} from "../Storage/database.service";
import {cardForWord} from "../Util/Util";
import {observableLastValue} from "../../services/settings.service";
import {AtomMetadata} from "../../../../server/src/shared/atom-metadata.interface.ts/atom-metadata";

const highestPriorityCard = (c1: ICard, c2: ICard) => {
/*
    const ordered = orderBy([c1, c2], ['id', 'timestamp'], ['desc', 'desc']);
*/
    return ([c1,c2]).find(c => c.id) || c1;
}

export const priorityMouseoverHighlightWord = (
    {
        cardsRepository,
        atomMetadata
    }: {
    cardsRepository: CardsRepository,
    atomMetadata: AtomMetadata
}
): ICard | undefined => {
    const cardMap = cardsRepository.all$.getValue();
    return maxBy(
        flatten(
            atomMetadata.words
                .map(word => {
                    const cardMapElement = cardMap[word.word] || [];
                    return cardMapElement
                        .filter(v => !v.highlightOnly);
                })
        ), c => c.learningLanguage.length);
}

export default class CardsRepository {

    public static mergeCardIntoCardDict(newICard: ICard, o: { [p: string]: ICard[] }) {
        const detectDuplicateCard = getIsMeFunction(newICard);
        const presentCards = o[newICard.learningLanguage];
        if (presentCards) {
            const indexOfDuplicateCard = presentCards.findIndex(detectDuplicateCard);
            if (indexOfDuplicateCard >= 0) {
                const presentCard = presentCards[indexOfDuplicateCard];
                presentCards[indexOfDuplicateCard] = highestPriorityCard(newICard, presentCard);
            } else {
                presentCards.push(newICard)
            }
        } else {
            o[newICard.learningLanguage] = [newICard]
        }
    }

    public deleteWords: Subject<string[]> = new Subject<string[]>();
    addCardsWhichDoNotHaveToBePersisted$: Subject<ICard[]> = new Subject<ICard[]>();
    upsertCards$ = new Subject<ICard[]>();
    cardIndex$!: Observable<Dictionary<ICard[]>>;
    cardProcessingSignal$ = new ReplaySubject<boolean>(1);
    newWords$: Observable<string[]>
    all$ = new BehaviorSubject<Dictionary<ICard[]>>({});
    private db: DatabaseService;

    public async updateICard(word: string, propsToUpdate: Partial<ICard>) {
        const card = await this.resolveCard(word);
        this.upsertCards$.next([{...card, timestamp: new Date(), ...propsToUpdate}]);
    }

    public async resolveCard(word: string): Promise<ICard> {
        const index = await observableLastValue(this.cardIndex$);
        return index[word]?.[0] || cardForWord(word)
    }

    constructor({
                    databaseService
                }: {
        databaseService: DatabaseService,
    }) {
        this.db = databaseService;
        this.cardProcessingSignal$.next(true);


        this.newWords$ = this.addCardsWhichDoNotHaveToBePersisted$.pipe(
            map(cards => cards.map(card => card.learningLanguage)),
            shareReplay(1)
        );
        this.cardIndex$ = merge(
            this.addCardsWhichDoNotHaveToBePersisted$.pipe(
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
                        CardsRepository.mergeCardIntoCardDict(newICard, newCardIndex);
                    });
                    return newCardIndex;
                } catch (e) {
                    console.warn(e)
                    return {}
                }
            }, {}),
            shareReplay(1)
        );
        this.cardIndex$.subscribe(this.all$);
        this.upsertCards$.pipe(
            map((cards) => {
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    this.db.cards.put(card, card?.id).then(id => card.id = id);
                }
                return cards;
            })
        ).subscribe(this.addCardsWhichDoNotHaveToBePersisted$);
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
            this.addCardsWhichDoNotHaveToBePersisted$.next(cards);
        }
        for await (const cards of this.db.getCardsFromDB({}, 500)) {
            this.addCardsWhichDoNotHaveToBePersisted$.next(cards);
        }
    }

    public putWords(words: string[]) {
        this.addCardsWhichDoNotHaveToBePersisted$.next(
            words.map(cardForWord)
        )
    }
    public putMouseoverDisabledWords(words: string[]) {
        this.addCardsWhichDoNotHaveToBePersisted$.next(
            words.map(cardForWord).map(card => {
                card.highlightOnly = true;
                return card
           })
        )
    }
    public putSyntheticWords(words: string[]) {
        this.addCardsWhichDoNotHaveToBePersisted$.next(
            words.map(cardForWord).map(card => {
                card.synthetic = true;
                return card
            })
        )
    }
}