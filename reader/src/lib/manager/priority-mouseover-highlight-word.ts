import { AtomMetadata } from "@shared/"
import { ICard } from "@shared/"
import { flatten, maxBy } from 'lodash'
import CardsRepository from './cards.repository'

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
            atomMetadata.words.subsequences.map((word) => {
                return cardMap[word.word] || []
            }),
        ),
        (c) => c.learning_language.length,
    )
}