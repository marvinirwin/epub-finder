import introJs from "intro.js";
import {SettingsService} from "../../services/settings.service";
import {combineLatest, fromEvent, Observable} from "rxjs";
import {filter, take, withLatestFrom} from "rxjs/operators";


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
        });
        this.intro.oncomplete(() => {
            const lastStep = this.currentSteps[this.currentSteps.length - 1];

            if (lastStep) {
                this.markStepCompleted(lastStep)
            }
        });
        // TODO these functions should be put into a que to prevent race conditions

        this.intro.onexit(() => {
            this.markStepCompleted(...this.currentSteps);
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

    private async markStepCompleted(...steps: introJs.Step[]) {
        const currentSteps = await this.settingsService.completedSteps$.pipe(take(1)).toPromise();
        const uniqueSteps = new Set([...(currentSteps || []), ...steps.map(step => step.intro)]);
        this.settingsService.completedSteps$.next(Array.from(uniqueSteps));
    }

    addSteps(steps: introJs.Step[], startSignal$: Observable<void>) {
        combineLatest([
            startSignal$,
            this.settingsService.completedSteps$
        ]).subscribe(([, completedSteps]) => {
                if (completedSteps) {
                    const filteredSteps = steps.filter(step => !completedSteps.includes(step.intro));
                    if (filteredSteps.length) {
                        this.executeSeries(filteredSteps);
                    }
                }
            }
        )
    }
}