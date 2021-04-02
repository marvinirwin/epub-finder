import { SerializedSegment, tabulationFactory, TabulationParameters } from '../../tabulation/tabulate'
import { TabulatedSegments } from '../tabulated-documents.interface'
import { XMLDocumentNode } from '../../XMLDocumentNode'
import { flatten, maxBy, uniq } from 'lodash'
import { IWordInProgress } from '../../Annotation/IWordInProgress'
import { safePush, safePushMap } from '../../safe-push'
import { IPositionedWord } from '../../Annotation/IPositionedWord'
import { AtomMetadata } from '../../atom-metadata.interface.ts/atom-metadata'
import { Segment } from './segment'


export const tabulate = ({
    notableCharacterSequences,
    segments,
    greedyWordSet,
    isNotableCharacterRegex,
    wordIdentifyingStrategy,
    isWordBoundaryRegex,
}: TabulationParameters): TabulatedSegments => {
    const tabulationObject = tabulationFactory()
    const elementSegmentMap = new Map<XMLDocumentNode, Segment>()
    const isNotableCharacter = (character: string) =>
        isNotableCharacterRegex.test(character)
    const {
        greedyWordCounts,
        wordSegmentMap,
        segmentWordCountRecordsMap,
        wordCounts,
        atomMetadatas,
        wordElementsMap,
    } = tabulationObject

    const characterElements = flatten(
        segments.map((segment) => {
            segment.children.forEach((node) =>
                elementSegmentMap.set(node, segment),
            )
            return segment.children
        }),
    ).filter((n) => {
        if (wordIdentifyingStrategy === 'noSeparator') {
            return n.textContent.trim()
        }
        return n.textContent
    })
    const uniqueLengths = uniq(
        Array.from(notableCharacterSequences.uniqueLengths).concat(1),
    )
    const textContent = characterElements
        .map((node) => node.textContent)
        .join('')
    let notableSubsequencesInProgress: IWordInProgress[] = []
    let greedyWord: IWordInProgress | undefined
    let currentSegment: Segment
    let segmentIndex = -1
    let currentSegmentStart
    let currentSerialzedSegment
    for (let i = 0; i < characterElements.length; i++) {
        const currentMark = characterElements[i]
        const currentCharacter = textContent[i]
        if (elementSegmentMap.get(currentMark) !== currentSegment) {
            currentSegment = elementSegmentMap.get(currentMark)
            segmentIndex++
            currentSegmentStart = i
            currentSerialzedSegment = {
                text: currentSegment.translatableText,
                index: segmentIndex,
            }
        }
        const newGreedyWord = () => {
            const chosenGreedyWord = maxBy(
                notableSubsequencesInProgress.filter((wordInProgress) => {
                        switch(wordIdentifyingStrategy) {
                            case "noSeparator":
                                return greedyWordSet.has(wordInProgress.word)
                            case "punctuationSeparator":
                                // How do I figure which subsequence to use?
                                // This is why I should have used
                                return
                        }
                    },
                ),
                (wordInProgress) => wordInProgress.word.length,
            )
            if (chosenGreedyWord) {
                if (!greedyWordCounts.get(chosenGreedyWord.word)) {
                    greedyWordCounts.set(chosenGreedyWord.word, 0)
                }
                greedyWordCounts.set(
                    chosenGreedyWord.word,
                    greedyWordCounts.get(chosenGreedyWord.word) + 1,
                )
            }
            return chosenGreedyWord
        }

        notableSubsequencesInProgress = notableSubsequencesInProgress
            .map((w) => {
                w.lengthRemaining--
                return w
            })
            .filter((w) => w.lengthRemaining > 0)
        const potentialNotableSequences = uniq(
            uniqueLengths.map((size) => textContent.substr(i, size)),
        )
        const notableSequencesWhichStartHere: string[] = potentialNotableSequences.reduce(
            (acc: string[], potentialWord) => {
                if (notableCharacterSequences.has(potentialWord)) {
                    safePush(
                        wordSegmentMap,
                        potentialWord,
                        elementSegmentMap.get(currentMark),
                    )
                    acc.push(potentialWord)
                }
                return acc
            },
            [],
        )

        if (
            notableSequencesWhichStartHere.length === 0 &&
            notableSubsequencesInProgress.length === 0 &&
            isNotableCharacter(currentCharacter)
        ) {
            switch (wordIdentifyingStrategy) {
                case 'noSeparator':
                    notableSequencesWhichStartHere.push(currentCharacter)
                    break
                case 'punctuationSeparator':
                    // Go until the next space or punctuation
                    let strings = textContent
                        .substr(i)
                        .split(isWordBoundaryRegex)
                    const wordEnd = strings[0];
                    if (wordEnd.trim()) {
                        notableSequencesWhichStartHere.push(wordEnd)
                    }
                    break
            }
        }

        notableSequencesWhichStartHere.forEach((wordStartingHere) => {
            safePushMap(
                segmentWordCountRecordsMap,
                currentSerialzedSegment as SerializedSegment,
                {
                    position: i - currentSegmentStart,
                    word: wordStartingHere,
                },
            )
        })

        notableSubsequencesInProgress.push(
            ...notableSequencesWhichStartHere.map((word) => {
                // Side effects bad
                if (wordCounts[word]) {
                    wordCounts[word]++
                } else {
                    wordCounts[word] = 1
                }
                return { word, lengthRemaining: word.length }
            }),
        )
        if (!greedyWord) {
            greedyWord = newGreedyWord()
        }
        const greedyWordHasEnded = !notableSubsequencesInProgress.includes(
            greedyWord,
        )
        if (greedyWordHasEnded) {
            greedyWord = newGreedyWord()
        }

        // Positioned words, what's this for?
        const words: IPositionedWord[] = notableSubsequencesInProgress.map(
            ({ word, lengthRemaining }) => {
                const position = word.length - lengthRemaining
                const newPositionedWord: IPositionedWord = {
                    word,
                    position,
                }
                return newPositionedWord
            },
        )

        const atomMetadata = new AtomMetadata({
            char: textContent[i],
            words,
            element: currentMark,
            i,
            parent: elementSegmentMap.get(currentMark),
        })
        atomMetadatas.set(currentMark, atomMetadata)
        atomMetadata.words.forEach((word) => {
            if (wordElementsMap[word.word]) {
                wordElementsMap[word.word].push(atomMetadata)
            } else {
                wordElementsMap[word.word] = [atomMetadata]
            }
        })
    }
    tabulationObject.wordSegmentMap = Object.fromEntries(
        Object.entries(wordSegmentMap).map(([word, segmentSet]) => [
            word,
            Array.from(segmentSet),
        ]),
    )
    tabulationObject.wordSegmentStringsMap = new Map(
        Object.entries(
            tabulationObject.wordSegmentMap,
        ).map(([word, segments]) => [
            word,
            new Set(segments.map((segment) => segment.translatableText)),
        ]),
    )
    return tabulationObject
}
