import {SettingsService} from "../../services/settings.service";
import {ScheduleService} from "./schedule.service";
import set = Reflect.set;
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";

export class SortedLimitScheduleRowsService {
    constructor(
        {
            settingsService,
            scheduleService,
        }: {

            settingsService: SettingsService,
            scheduleService: ScheduleService,
        }
    ) {
        this.sortedLimitedScheduleRows$ = combineLatest([
            scheduleService.sortedScheduleRows$,
            settingsService.newQuizWordLimit$
        ]).pipe(
            map(([sortedScheduleRows, newQuizWordLimit$]) => {
                // UnlearnedWords =
            })
        )
    }
}