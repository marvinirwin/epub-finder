import {combineLatest, Observable} from 'rxjs'
import {map, shareReplay, startWith} from 'rxjs/operators'
import {SerializedTabulationAggregate} from "@shared/"
import {VideoMetadataRepository} from '../../services/video-metadata.repository'
import {IgnoredWordsRepository} from '../schedule/ignored-words.repository'
import {AllWordsRepository} from '../language/all-words.repository'
import {SelectedVirtualTabulationsService} from '../manager/selected-virtual-tabulations.service'
import {LanguageConfigsService} from '../language/language-configs.service'
import {WeightedVocabService} from '../language/weighted-vocab.service'
import {
    KnowablePositionedWord,
    ReadingProgress,
    wordCountForSubsequence,
} from '@shared/'
import {sumBy, uniq} from 'lodash'
import {getGreedySubSequences} from "../schedule/learning-target/get-greedy-subsequences";
import {getNotableSubsequencesOfWords} from "./get-notable-subsequences-of-words";
import {combineSegmentSubSequences} from "./combine-segment-subsequences";

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
                    ({notableSubSequences, label}) => {
                        const notableSubsequencesOfWords = notableSubSequences.map(notableSubsequence => getNotableSubsequencesOfWords(notableSubsequence, syntheticWords, strategy, vocabulary))
                        const knowableSubSequences: KnowablePositionedWord[] = getGreedySubSequences(combineSegmentSubSequences(notableSubsequencesOfWords)
                        )
                            .subsequences.map(positionedWord => ({
                                        ...positionedWord,
                                        known: weightedVocab.get(positionedWord.word) === 1,
                                        wordCount: wordCountForSubsequence(positionedWord.word, strategy)
                                    }
                                ),
                            );
                        const knownSubSequences = knowableSubSequences.filter(r => r.known)
                        const unknownSubSequences = knowableSubSequences.filter(r => !r.known)
                        const uniqueKnown = uniq(knownSubSequences.map(w => w.word));
                        const uniqueUnknown = uniq(unknownSubSequences.map(w => w.word));
                        return {
                            label,
                            knownSubSequences,
                            unknownSubSequences,
                            subSequences: {
                                subsequences: knowableSubSequences,
                                segmentText: notableSubSequences.map(({segmentText}) => segmentText)
                                    .join('\n')
                            },
                            knownCount: sumBy(knownSubSequences, v => v.wordCount),
                            unknownCount: sumBy(unknownSubSequences, v => v.wordCount),
                            uniqueKnownCount: uniqueKnown.length,
                            uniqueUnknownCount: uniqueUnknown.length,
                            uniqueKnown,
                            uniqueUnknown,
                        };
                    },
                )
            }),
            shareReplay(1),
        )
    }
}