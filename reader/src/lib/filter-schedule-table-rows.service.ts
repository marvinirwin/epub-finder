import {ScheduleService} from "./manager/schedule.service";
import {combineLatest, Observable} from "rxjs";
import {NormalizedScheduleRowData} from "./schedule/schedule-row.interface";
import {ScheduleRow} from "./schedule/ScheduleRow";
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
            scheduleService.sortedScheduleRows$
        ]).pipe(
            debounceTime(500),
            map(([scheduleTableWordFilterValue, sortedScheduleRows]) => {
                return sortedScheduleRows.filter(row => row.d.word.includes(scheduleTableWordFilterValue))
            }),
            shareReplay(1)
        )
    }
}