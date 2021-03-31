import {observableLastValue, SettingsService} from "../../services/settings.service";
import {QUIZ_NODE} from "@shared/";
import {TimeService} from "./time.service";
import {QuizService} from "../../components/quiz/quiz.service";
import {QuizResultService} from "../quiz/quiz-result.service";

export class AdvanceTimeService {
    constructor({
                    settingsService,
                    timeService,
                    quizService,
        quizResultService
                }: {
        settingsService: SettingsService
        timeService: TimeService,
        quizService: QuizService,
        quizResultService: QuizResultService
    }) {
        setInterval(async () => {
            const currentComponent = await observableLastValue(settingsService.componentPath$);
            if (currentComponent !== QUIZ_NODE) {
                timeService.quizNow$.next(new Date())
            }
            /**
             * If we're not in the quizComponent, set time to now
             */
        }, 1000);
        quizResultService.quizResult$.subscribe(v => timeService.quizNow$.next(new Date()))

    }
}