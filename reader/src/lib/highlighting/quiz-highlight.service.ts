import { HighlighterService } from './highlighter.service'
import { QuizService } from '../../components/quiz/quiz.service'
import {map, shareReplay} from 'rxjs/operators'
import { SettingsService } from '../../services/settings.service'
import { combineLatest } from 'rxjs'
import { QUIZ_NODE } from '@shared/'

export class QuizHighlightService {
    constructor({
        highlighterService,
        quizService,
        settingsService,
    }: {
        highlighterService: HighlighterService
        quizService: QuizService
        settingsService: SettingsService
    }) {
        highlighterService.singleHighlight(
            combineLatest([
                quizService.quizCard.word$,
                settingsService.componentPath$.obs$,
            ]).pipe(
                map(([word, componentPath]) => {
                        return (componentPath === QUIZ_NODE || !componentPath)
                            ? word
                            : 'DONT_HIGHLIGHT_ANYTHING';
                    },
                ),
                map(HighlighterService.wordToMap([28, 176, 246, 0.5])),
                shareReplay(1)
            ),
            [0, 'QUIZ_WORD_HIGHLIGHT'],
        )
    }
}
