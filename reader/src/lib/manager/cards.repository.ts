import { BehaviorSubject, merge, Observable, ReplaySubject, Subject } from 'rxjs'
import { getIsMeFunction, ICard } from '../../../../server/src/shared/ICard'
import { Dictionary, flatten, maxBy } from 'lodash'
import { map, scan, shareReplay, startWith } from 'rxjs/operators'
import { DatabaseService, putPersistableEntity } from '../Storage/database.service'
import { cardForWord } from '../util/Util'
import { observableLastValue } from '../../services/settings.service'
import { AtomMetadata } from '../../../../server/src/shared/atom-metadata.interface.ts/atom-metadata'
import { LanguageConfigsService } from '../language/language-configs.service'

const highestPriorityCard = (c1: ICard, c2: ICard) => {
    /*
    const ordered = orderBy([c1, c2], ['id', 'timestamp'], ['desc', 'desc']);
*/
    return [c1, c2].find((c) => c.id) || c1
}

export const priorityMouseoverHighlightWord = ({
                                                   cardsRepository,
                                                   atomMetadata,
                                               }: {
    cardsRepository: CardsRepository
    atomMetadata: AtomMetadata
}): ICard | undefined => {
    const cardMap = cardsRepository.all$.getValue()
    return maxBy(
        flatten(
            atomMetadata.words.map((word) => {
                return cardMap[word.word] || []
            }),
        ),
        (c) => c.learningLanguage.length,
    )
}

export default class CardsRepository {
    addCardsWhichDoNotHaveToBePersisted$: Subject<ICard[]> = new Subject<ICard[]>()
    upsertCards$ = new Subject<ICard[]>()
    cardIndex$!: Observable<Dictionary<ICard[]>>
    cardProcessingSignal$ = new ReplaySubject<boolean>(1)
    newWords$: Observable<string[]>
    all$ = new BehaviorSubject<Dictionary<ICard[]>>({})
    /**
     * Don't use, doesn't do anything anymore.  use IgnoredWords instead
     * @deprecated
     * @private
     */
    private deleteWords: Subject<string[]> = new Subject<string[]>()
    private db: DatabaseService

    constructor({ databaseService }: {
                    databaseService: DatabaseService,
                    languageConfigsService: LanguageConfigsService
                },
    ) {
        this.db = databaseService
        this.cardProcessingSignal$.next(true)

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

    public async updateICard(word: string, propsToUpdate: Partial<ICard>) {
        const card = await this.resolveCard(word)
        this.upsertCards$.next([
            {
                ...card,
                timestamp: new Date(), ...propsToUpdate,
            },
        ])
    }

    public async resolveCard(word: string): Promise<ICard> {
        const index = await observableLastValue(this.cardIndex$)
        return index[word]?.[0] || cardForWord(word)
    }

    async load() {
        this.cardProcessingSignal$.next(true)
        await this.getCardsFromDB()
        this.cardProcessingSignal$.next(false)
    }

    private async getCardsFromDB() {
        for await (const cards of this.db.getCardsFromDB({}, 500)) {
            this.addCardsWhichDoNotHaveToBePersisted$.next(cards)
        }
    }
}
