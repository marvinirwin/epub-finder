import { BehaviorSubject, merge, Observable, ReplaySubject, Subject } from 'rxjs'
import { getIsMeFunction, ICard } from "@shared/"
import { Dictionary } from 'lodash'
import { map, scan, shareReplay, startWith } from 'rxjs/operators'
import { DatabaseService} from '../Storage/database.service'
import { cardForWord } from '../util/Util'
import { observableLastValue } from '../../services/settings.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { highestPriorityCard } from './highest-priority-card'
import {putPersistableEntity} from "../Storage/put-persistable-entity";
import { LoadingSignal } from '../loading/loadingSignal'

const loadingChunkSize = 500;
export default class CardsRepository {
    private languageConfigsService: LanguageConfigsService
    public static mergeCardIntoCardDict(
        newICard: ICard,
        o: { [p: string]: ICard[] },
    ) {
        const detectDuplicateCard = getIsMeFunction(newICard)
        const presentCards = o[newICard.learning_language]
        if (presentCards) {
            const indexOfDuplicateCard = presentCards.findIndex(
                detectDuplicateCard,
            )
            if (indexOfDuplicateCard >= 0) {
                const presentCard = presentCards[indexOfDuplicateCard]
                presentCards[indexOfDuplicateCard] = highestPriorityCard(
                    newICard,
                    presentCard,
                )
            } else {
                presentCards.push(newICard)
            }
        } else {
            o[newICard.learning_language] = [newICard]
        }
    }
    addCardsWhichDoNotHaveToBePersisted$: Subject<ICard[]> = new Subject<ICard[]>()
    upsertCards$ = new Subject<ICard[]>()
    cardIndex$!: Observable<Dictionary<ICard[]>>
    loadingSignal = new LoadingSignal()
    newWords$: Observable<string[]>
    all$ = new BehaviorSubject<Dictionary<ICard[]>>({})
    /**
     * Don't use, doesn't do anything anymore.  use IgnoredWords instead
     * @deprecated
     * @private
     */
    private deleteWords: Subject<string[]> = new Subject<string[]>()
    private db: DatabaseService

    constructor({ databaseService, languageConfigsService }: {
                    databaseService: DatabaseService,
                    languageConfigsService: LanguageConfigsService
                },
    ) {
        this.db = databaseService
        this.languageConfigsService = languageConfigsService;

        this.newWords$ = this.addCardsWhichDoNotHaveToBePersisted$.pipe(
            map((cards) => cards.map((card) => card.learning_language)),
            shareReplay(1),
        )
        this.cardIndex$ = merge(
            this.addCardsWhichDoNotHaveToBePersisted$.pipe(
                map((addCards) => [addCards, []]),
            ),
            this.deleteWords.pipe(map((deleteCards) => [[], deleteCards])),
        ).pipe(
            // @ts-ignore
            startWith([[], []]),
            scan(
                (
                    cardIndex: Dictionary<ICard[]>,
                    [newCards, cardsToDelete]: [ICard[], string[]],
                ) => {
                    try {
                        // TODO I think this is wrong because technically we can have more than 1 card per word
                        // But its a hack that works for now
                        cardsToDelete.forEach(
                            (cardToDelete) => delete cardIndex[cardToDelete],
                        )
                        // TODO I dont think we need to shallow clone here
                        const newCardIndex = { ...cardIndex }
                        newCards.forEach((newICard) => {
                            CardsRepository.mergeCardIntoCardDict(
                                newICard,
                                newCardIndex,
                            )
                        })
                        return newCardIndex
                    } catch (e) {
                        console.warn(e)
                        return {}
                    }
                },
                {},
            ),
            shareReplay(1),
        )
        this.cardIndex$.subscribe(this.all$)
        this.upsertCards$
            .pipe(
                map((cards) => {
                    for (let i = 0; i < cards.length; i++) {
                        const card = cards[i]
                        putPersistableEntity(
                            {
                                entity: 'cards',
                                record: card,
                            },
                        ).then(({ id }) => {
                            return card.id = id
                        })
                    }
                    return cards
                }),
            )
            .subscribe(this.addCardsWhichDoNotHaveToBePersisted$)
        /*
                this.deleteWords.subscribe((cards) => {
                    for (let i = 0; i < cards.length; i++) {
                        const card = cards[i]
                        this.db.cards.where({ learningLanguage: card }).delete()
                    }
                })
        */
    }


    public async updateICard(word: string, propsToUpdate: Partial<ICard>) {
        const card = await this.resolveCard(word)
        this.upsertCards$.next([
            {
                ...card,
                ...propsToUpdate,
            },
        ])
    }

    public async resolveCard(word: string): Promise<ICard> {
        const index = await observableLastValue(this.cardIndex$)
        const w = index[word]?.[0];
        if (w) {
            return w;
        }
        // tslint:disable-next-line:variable-name
        const language_code = await observableLastValue(this.languageConfigsService.readingLanguageCode$)
        return await cardForWord(word, language_code) as unknown as ICard;
    }

    async load() {
        this.loadingSignal.isLoading$.next(true)
        await this.getCardsFromDB()
        this.loadingSignal.isLoading$.next(false)
    }

    private async getCardsFromDB() {
        let count = 0;

        const sendLoadingMessage =  () => {
            this.loadingSignal.latestMessage$.next(`fetching cards.  ${count} fetched so far.`);
        }
        sendLoadingMessage();
        for await (const cards of this.db.getCardsFromDB({}, loadingChunkSize)) {
            sendLoadingMessage();
            count += cards.length;
            this.addCardsWhichDoNotHaveToBePersisted$.next(cards)
        }
    }
}
