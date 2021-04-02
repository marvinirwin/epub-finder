import { ScheduleService } from './schedule.service'
import { combineLatest, Observable } from 'rxjs'
import {
    NormalizedQuizCardScheduleRowData,
    QuizScheduleRowData,
    ScheduleRow,
} from './schedule-row'
import { SettingsService } from '../../services/settings.service'
import { debounceTime, map, shareReplay } from 'rxjs/operators'
import { sumWordCountRecords } from './schedule-math.service'
import { QuizCardScheduleRowsService } from './quiz-card-schedule-rows.service'

export class FilterScheduleTableRowsService {
    public filteredScheduleRows$: Observable<
        ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    >
    constructor({
        scheduleService,
        settingsService,
    }: {
        scheduleService: QuizCardScheduleRowsService
        settingsService: SettingsService
    }) {
        this.filteredScheduleRows$ = combineLatest([
            settingsService.scheduleTableWordFilterValue$,
            settingsService.scheduleTableShowUnderDue$,
            settingsService.scheduleTableShowUncounted$,
            scheduleService.scheduleRows$.pipe(
                map((v) => Object.values(v)),
            ),
        ]).pipe(
            debounceTime(500),
            map(
                ([
                    scheduleTableWordFilterValue,
                    showUnderDue,
                    showUncounted,
                    sortedScheduleRows,
                ]) => {
                    const now = new Date()
                    const filterFuncs: ((
                        r: ScheduleRow<NormalizedQuizCardScheduleRowData>,
                    ) => boolean)[] = [
                        (row) =>
                            row.d.word.includes(scheduleTableWordFilterValue),
                    ]
                    if (!showUnderDue) {
                        filterFuncs.push((r) => r.dueDate() > now)
                    }
                    if (!showUncounted) {
                        filterFuncs.push((r) => sumWordCountRecords(r) > 0)
                    }
                    return sortedScheduleRows.filter((row) =>
                        filterFuncs.every((filterFunc) => filterFunc(row)),
                    )
                },
            ),
            /*
            map(filterQuizRows),
*/
            shareReplay(1),
        )
    }
}
