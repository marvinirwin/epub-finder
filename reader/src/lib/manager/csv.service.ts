import CardsRepository from './cards.repository'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { ICard } from '../../../../server/src/shared/ICard'
import { cardForWord } from '../util/Util'
import { combineLatest, Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { SerializeCardForCsv } from '../serialize-card-for-csv'
import { ExampleSegmentsService } from '../quiz/example-segments.service'
import uniqueBy from '@popperjs/core/lib/utils/uniqueBy'
import JSZip from 'jszip'
import {CsvCard} from "../csv-card.interface";

export class CsvService {
    csvAndZip$: Observable<{ csvRows: CsvCard[], zip: JSZip }>

    constructor(
        {
            quizCardScheduleRowsService,
            cardsRepository,
            exampleSegmentsService,
            languageConfigsService,
        }:
            {
                languageConfigsService: LanguageConfigsService,
                quizCardScheduleRowsService: QuizCardScheduleRowsService,
                cardsRepository: CardsRepository,
                exampleSegmentsService: ExampleSegmentsService,
            },
    ) {
        this.csvAndZip$ = combineLatest([
            languageConfigsService.readingLanguageCode$,
            quizCardScheduleRowsService.scheduleRows$,
            cardsRepository.cardIndex$,
            exampleSegmentsService.exampleSegmentMap$,
            languageConfigsService.learningLanguageTextToSpeechConfig$,
        ]).pipe(
            switchMap(async ([
                                 readingLanguageCode,
                                 scheduleRows,
                                 cardIndex,
                                 exampleSegments,
                                 textToSpeechConfig,
                             ]) => {
                const scheduleRowsWithCount = scheduleRows.filter(r => r.d.wordCountRecords.length)
                const zip = new JSZip()
                const cards: ICard[] = await Promise.all(scheduleRowsWithCount.map(r => cardIndex[r.d.word]?.[0] || cardForWord(r.d.word, readingLanguageCode)))
                return {
                    csvRows: await Promise.all(uniqueBy(cards, c => c.learning_language).slice(0,3).map(c => SerializeCardForCsv({
                        c,
                        exampleSegments,
                        textToSpeechConfig,
                        zip,
                    }))),
                    zip
                }
            }),
            shareReplay(1),
        )
    }
}