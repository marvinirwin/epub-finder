import introJs from "intro.js";
import {SettingsService} from "../../services/settings.service";
import {fromEvent} from "rxjs";


export class Intro {
    private intro: introJs.IntroJs;

    private stepIndex = 0;

    constructor({settingsService}: { settingsService: SettingsService }) {
        this.intro = introJs();
        this.intro.oncomplete(() => {

        });
        this.intro.onexit(() => {

        });
        settingsService.completedSteps$
    }

    addSteps(steps: introJs.Step[]) {

    }
}