import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import { SerializedTabulationAggregate } from '../../../../server/src/shared/tabulation/serialized-tabulation.aggregate'
import { VideoMetadataRepository } from '../../services/video-metadata.repository'
import { IgnoredWordsRepository } from '../schedule/ignored-words.repository'
import { AllWordsRepository } from '../language/all-words.repository'
import { SelectedVirtualTabulationsService } from '../manager/selected-virtual-tabulations.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { getNotableSubsequencesOfWords } from './tabulation.service'
import { WeightedVocabService } from '../language/weighted-vocab.service'
import { getGreedySubSequences } from '../schedule/learning-target/flash-card-learning-targets.service'
import {
    IPositionedWord,
    KnowablePositionedWord, ReadingProgress,
    wordCountForSubsequence,
} from '../../../../server/src/shared/Annotation/IPositionedWord'
import { sumBy } from 'lodash'

export class ReadingProgressService {
    readingProgressRecords$: Observable<ReadingProgress[]>

    constructor(
        {
            videoMetadataRepository,
            ignoredWordsRepository,
            allWordsRepository,
            selectedVirtualTabulationsService,
            languageConfigsService,
            weightedVocabService,
        }:
            {
                videoMetadataRepository: VideoMetadataRepository,
                ignoredWordsRepository: IgnoredWordsRepository
                allWordsRepository: AllWordsRepository
                selectedVirtualTabulationsService: SelectedVirtualTabulationsService
                languageConfigsService: LanguageConfigsService,
                weightedVocabService: WeightedVocabService
            },
    ) {
        this.readingProgressRecords$ = combineLatest([
            allWordsRepository.all$,
            selectedVirtualTabulationsService.selectedFrequencyVirtualTabulations$,
            videoMetadataRepository.all$.pipe(startWith(new Map())),
            languageConfigsService.wordSeparationStrategy$,
            weightedVocabService.weightedVocab$,
        ]).pipe(
            map(([
                     builtInWords,
                     selectedFrequencyVirtualTabulations,
                     videoMetadataIndex,
                     strategy,
                     weightedVocab,
                 ]) => {
                const syntheticWords = new Set<string>(Object.keys(videoMetadataIndex))
                const vocabulary = new Set(builtInWords)
                return new SerializedTabulationAggregate(
                    selectedFrequencyVirtualTabulations,
                ).serializedTabulations.map(
                    ({ notableSubSequences, label }) => {
                        const notableSubsequencesOfWords = getNotableSubsequencesOfWords(notableSubSequences, syntheticWords, strategy, vocabulary)
                        const knowableSubSequences: KnowablePositionedWord[] = getGreedySubSequences(notableSubsequencesOfWords)
                            .map(positionedWord => ({
                                        ...positionedWord,
                                        known: weightedVocab.get(positionedWord.word) === 1,
                                        wordCount: wordCountForSubsequence(positionedWord.word, strategy)
                                    }
                                ),
                            );
                        const knownSubSequences = knowableSubSequences.filter(r => r.known)
                        const unknownSubSequences = knowableSubSequences.filter(r => !r.known)
                        return {
                            label,
                            knownSubSequences,
                            unknownSubSequences,
                            subSequences: knowableSubSequences,
                            knownCount: sumBy(knownSubSequences, v => v.wordCount),
                            unknownCount: sumBy(unknownSubSequences, v => v.wordCount),
                        };
                    },
                )
            }),
            shareReplay(1),
        )
    }
}