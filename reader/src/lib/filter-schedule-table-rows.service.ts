import {ScheduleService} from "./manager/schedule.service";
import {combineLatest, Observable} from "rxjs";
import {NormalizedScheduleRowData, ScheduleRow} from "./schedule/schedule-row";
import {SettingsService} from "../services/settings.service";
import {debounceTime, map, shareReplay} from "rxjs/operators";

export class FilterScheduleTableRowsService {
    public filteredScheduleRows$: Observable<ScheduleRow<NormalizedScheduleRowData>[]>;
    constructor({
        scheduleService,
        settingsService
                }: {
        scheduleService: ScheduleService,
        settingsService: SettingsService
    }) {
        this.filteredScheduleRows$ = combineLatest([
            settingsService.scheduleTableWordFilterValue$,
            settingsService.scheduleTableShowUnderDue$,
            settingsService.scheduleTableShowUncounted$,
            scheduleService.sortedScheduleRows$
        ]).pipe(
            debounceTime(500),
            map(([scheduleTableWordFilterValue, showUnderDue, showUncounted, sortedScheduleRows]) => {
                const now = new Date();
                const filterFuncs: ((r: ScheduleRow<NormalizedScheduleRowData>) => boolean)[] = [
                    row => row.d.word.includes(scheduleTableWordFilterValue)
                ];
                if (!showUnderDue) {
                    filterFuncs.push(r => r.dueDate() > now);
                }
                if (!showUncounted) {
                    filterFuncs.push(r => r.count() > 0)
                }
                return sortedScheduleRows.filter(row => filterFuncs.every(filterFunc => filterFunc(row)))
            }),
/*
            map(filterQuizRows),
*/
            shareReplay(1)
        )
    }
}