import {
    SettingsService,
} from '../../services/settings.service'
import { QUIZ_NODE } from '@shared/'
import { TimeService } from './time.service'
import { QuizService } from '../../components/quiz/quiz.service'
import { QuizResultService } from '../quiz/quiz-result.service'
import {observableLastValue} from "../../services/observableLastValue";

export class AdvanceTimeService {
    constructor({
        settingsService,
        timeService,
        quizService,
        quizResultService,
    }: {
        settingsService: SettingsService
        timeService: TimeService
        quizService: QuizService
        quizResultService: QuizResultService
    }) {
        setInterval(async () => {
            const currentComponent = await observableLastValue(
                settingsService.componentPath$,
            )
            // TODO this is a hack, QUIZ_NODE is the default component
            if (currentComponent !== QUIZ_NODE && currentComponent !== '') {
                timeService.quizNow$.next(new Date())
            }
            /**
             * If we're not in the quizComponent, set time to now
             */
        }, 5000)
        quizResultService.quizResult$.subscribe((v) =>
            timeService.quizNow$.next(new Date()),
        )
    }
}
