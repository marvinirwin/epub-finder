import introJs from "intro.js";
import {SettingsService} from "../../services/settings.service";
import {fromEvent, Observable} from "rxjs";
import {filter, skip, take, withLatestFrom} from "rxjs/operators";


export class IntroSeriesService {
    private intro: introJs.IntroJs;
    private settingsService: SettingsService;
    private currentSteps: introJs.Step[] = [];

    constructor(
        {settingsService}: { settingsService: SettingsService }
    ) {
        this.settingsService = settingsService;
        this.intro = introJs();
        this.intro.onchange(() => {
            const index = this.intro.currentStep();
            // Find the index of the new element
            if (index !== undefined && index > 0) {
                // Previous step has been completed
                this.markStepCompleted(this.currentSteps[index - 1]);
            }
        })
    }

    private async executeSeries(steps: introJs.Step[]) {
        if (this.intro.currentStep()) {
            this.intro.exit(true)
        }
        this.currentSteps = steps;
        this.intro.setOptions({steps});
        this.intro.start();
    }

    private markStepCompleted(step: introJs.Step) {
        const uniqueSteps = new Set(this.settingsService.completedSteps$.getValue().concat(step.intro));
        this.settingsService.completedSteps$.next(Array.from(uniqueSteps));
    }

    addSteps(steps: introJs.Step[], startSignal$: Observable<void>) {
        startSignal$
            .pipe(
                // Skip the default value, it takes a while to load
                withLatestFrom(this.settingsService.completedSteps$.pipe(skip(1)))
            ).subscribe(([, completedSteps]) => {
                const filteredSteps = steps.filter(step => !completedSteps.includes(step.intro));
                if (filteredSteps.length) {
                    this.executeSeries(filteredSteps);
                }
            }
        )
    }
}