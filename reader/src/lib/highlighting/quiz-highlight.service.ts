import {HighlighterService} from "./highlighter.service";
import {QuizService} from "../../components/quiz/quiz.service";
import {map} from "rxjs/operators";
import {SettingsService} from "../../services/settings.service";
import {combineLatest} from "rxjs";
import {QUIZ_NODE} from "@shared/";

export class QuizHighlightService {
    constructor(
        {
            highlighterService,
            quizService,
            settingsService
        }: {
            highlighterService: HighlighterService,
            quizService: QuizService,
            settingsService: SettingsService
        }
    ) {
        highlighterService.singleHighlight(
            combineLatest([
                quizService.quizCard.word$,
                settingsService.componentPath$,
            ]).pipe(
                map(([word, componentPath]) => componentPath === QUIZ_NODE ? word : 'DONT_HIGHLIGHT_ANYTHING'),
                map(HighlighterService.wordToMap([28, 176, 246, 0.5]))
            ),
            [0, 'QUIZ_WORD_HIGHLIGHT']
        );
    }
}