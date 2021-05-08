import CardsRepository from './cards.repository'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { ICard } from '../../../../server/src/shared/ICard'
import { cardForWord } from '../util/Util'
import { combineLatest, Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { CsvCard, SerializeCardForCsv } from '../serialize-card-for-csv'
import { ExampleSegmentsService } from '../quiz/example-segments.service'
import uniqueBy from '@popperjs/core/lib/utils/uniqueBy'

export class CsvService {
    csv$: Observable<CsvCard[]>

    constructor(
        {
            languageConfigsService,
            quizCardScheduleRowsService,
            cardsRepository,
            exampleSentencesService,
        }:
            {
                languageConfigsService: LanguageConfigsService,
                quizCardScheduleRowsService: QuizCardScheduleRowsService,
                cardsRepository: CardsRepository,
                exampleSentencesService: ExampleSegmentsService,
            },
    ) {
        this.csv$ = combineLatest([
            languageConfigsService.readingLanguageCode$,
            quizCardScheduleRowsService.scheduleRows$,
            cardsRepository.cardIndex$,
            exampleSentencesService.exampleSegmentMap$,
        ]).pipe(
            switchMap(async ([readingLanguageCode, scheduleRows, cardIndex, exampleSegments]) => {
                const scheduleRowsWithCount = scheduleRows.filter(r => r.d.wordCountRecords.length)
                const cards: ICard[] = await Promise.all(scheduleRowsWithCount.map(r => cardIndex[r.d.word]?.[0] || cardForWord(r.d.word, readingLanguageCode)))
                return await Promise.all(uniqueBy(cards, c => c.learning_language).map(c => SerializeCardForCsv({
                    c,
                    exampleSegments,
                })))
            }),
            shareReplay(1),
        )
    }
}