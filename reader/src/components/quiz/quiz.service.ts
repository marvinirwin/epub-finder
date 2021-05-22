import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs'
import { OpenExampleSentencesFactory } from '../../lib/document-frame/open-example-sentences-document.factory'
import { debounceTime, distinctUntilChanged, map, mapTo, shareReplay } from 'rxjs/operators'
import { QuizCard } from './word-card.interface'
import { orderBy, uniq } from 'lodash'
import CardsRepository from 'src/lib/manager/cards.repository'
import { ExampleSegmentsService } from '../../lib/quiz/example-segments.service'
import { EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService } from '../../lib/manager/open-documents.service'
import { ScheduleRow, SortQuizData } from '../../lib/schedule/schedule-row'
import { LanguageConfigsService } from '../../lib/language/language-configs.service'
import { FlashCardType } from '../../lib/quiz/hidden-quiz-fields'
import { SettingsService } from '../../services/settings.service'
import {
    scheduleRowKey,
    SortedLimitScheduleRowsService,
    SpacedScheduleRow,
} from '../../lib/manager/sorted-limit-schedule-rows.service'
import { wordCardFactory } from './card-card.factory'
import { TabulationConfigurationService } from '../../lib/language/language-maps/tabulation-configuration.service'
import { sumWordCountRecords } from '../../lib/schedule/schedule-math.service'
import { TranslationAttemptScheduleService } from '../../lib/schedule/translation-attempt-schedule.service'
import { OnSelectService } from '../../lib/user-interface/on-select.service'
import { WordRecognitionProgressRepository } from '../../lib/schedule/word-recognition-progress.repository'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'

export const filterQuizRows = (
    rows: ScheduleRow<SortQuizData>[],
) =>
    rows
        .filter((r) => r.dueDate() < new Date())
        .filter((r) => sumWordCountRecords(r) > 0)

const isRepeatRecord = <T, U>(lastNItems: T[], nextItem: T, keyFunction: (v: T) => U) => {
    const us = lastNItems.map(keyFunction)
    const searchElement = keyFunction(nextItem)
    if (us.includes(searchElement)) {
        return true
    }
    return false;
}

export class QuizService {
    quizCard: QuizCard
    currentScheduleRow$: Observable<SpacedScheduleRow | undefined>
    manualHiddenFieldConfig$ = new ReplaySubject<string>()

    constructor({
                    cardsRepository,
                    sortedLimitedQuizScheduleRowsService,
                    exampleSentencesService,
                    openDocumentsService,
                    languageConfigsService,
                    settingsService,
                    tabulationConfigurationService,
                    translationAttemptScheduleService,
                    onSelectService,
                    wordRecognitionProgressRepository,
                }: {
        cardsRepository: CardsRepository
        sortedLimitedQuizScheduleRowsService: SortedLimitScheduleRowsService
        exampleSentencesService: ExampleSegmentsService
        openDocumentsService: OpenDocumentsService
        languageConfigsService: LanguageConfigsService
        settingsService: SettingsService
        tabulationConfigurationService: TabulationConfigurationService
        translationAttemptScheduleService: TranslationAttemptScheduleService
        onSelectService: OnSelectService,
        wordRecognitionProgressRepository: WordRecognitionProgressRepository
    }) {
        this.manualHiddenFieldConfig$.next('')
        this.currentScheduleRow$ = combineLatest(
            [
                sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
                wordRecognitionProgressRepository.recordList$.pipe(
                    map(recordList => orderBy(recordList, r => r.created_at, 'desc') as WordRecognitionRow[]),
                    shareReplay(1),
                ),
            ],
        ).pipe(
            map(([rows, previousRecords]) => {
                const firstRow = rows.limitedScheduleRows[0]
                const itemPreventedRepeat = rows.limitedScheduleRows.find(limitedScheduleRow => !isRepeatRecord<{ word: string }, string>(
                    previousRecords.slice(0, 5),
                    limitedScheduleRow.d,
                    r => r.word,
                    ),
                )
                if (itemPreventedRepeat) {
                    return itemPreventedRepeat
                }
                return firstRow
            }),
        )
        const currentWord$ = this.currentScheduleRow$.pipe(
            map((row) => row?.d.word),
            distinctUntilChanged(),
        )
        const openExampleSentencesDocument = OpenExampleSentencesFactory({
            tabulationConfigurationService,
            settingsService,
            languageConfigsService,
            onSelectService,
            name: 'example-sentences',
            sentences$: combineLatest([
                exampleSentencesService.exampleSegmentMap$,
                currentWord$,
                translationAttemptScheduleService.scheduleRows$,
            ]).pipe(
                debounceTime(0),
                map(
                    ([
                         exampleSegmentMap,
                         currentWord,
                         translationAttemptScheduleIndex,
                     ]) => {
                        if (!currentWord) return []
                        const firstTranslationAttempt =
                            translationAttemptScheduleIndex[0]?.d?.segmentText || ''
                        const exampleSegmentTexts = Array.from(
                            exampleSegmentMap.get(currentWord) || new Set<string>(),
                        )
                        return uniq(
                            orderBy(
                                exampleSegmentTexts,
                                [
                                    (segmentText) =>
                                        firstTranslationAttempt.includes(
                                            segmentText,
                                        )
                                            ? 1
                                            : 0,
                                    (v) => v.length,
                                ],
                                ['desc', 'asc'],
                            ),
                        ).slice(0, 10)
                    },
                ),
                shareReplay(1),
            ),
        })
        openDocumentsService.openDocumentTree.appendDelta$.next({
            nodeLabel: 'root',
            children: {
                [EXAMPLE_SENTENCE_DOCUMENT]: {
                    nodeLabel: EXAMPLE_SENTENCE_DOCUMENT,
                    value: openExampleSentencesDocument,
                },
            },
        })

        const wordCard = wordCardFactory(
            currentWord$,
            cardsRepository,
            languageConfigsService,
        )

        this.quizCard = {
            ...wordCard,
            flashCardType$: this.currentScheduleRow$.pipe(
                map(scheduleRow => scheduleRow?.d?.flash_card_type || FlashCardType.WordExamplesAndPicture),
                shareReplay(1),
            ),
            answerIsRevealed$: new BehaviorSubject<boolean>(false),
            exampleSentenceOpenDocument: openExampleSentencesDocument,
        }

        this.currentScheduleRow$
            .pipe(distinctUntilChanged(
                (r1, r2) => {
                    if (!r1 || !r2) return false
                    return scheduleRowKey(r1) === scheduleRowKey(r2)
                }),
                mapTo(false),
            )
            .subscribe(this.quizCard.answerIsRevealed$)
    }
}
