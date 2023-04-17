import { combineLatest, Observable } from 'rxjs'
import { ScheduleRow, SortQuizData } from './schedule-row'
import { SettingsService } from '../../services/settings.service'
import { debounceTime, map, shareReplay } from 'rxjs/operators'
import { sumWordCountRecords } from './schedule-math.service'
import { SortedLimitScheduleRowsService} from '../manager/sorted-limit-schedule-rows.service'
import { uniq } from 'lodash'
import {SpacedScheduleRow} from "../manager/space-schedule-row.type";

export class FilterScheduleTableRowsService {
    public filteredScheduleRows$: Observable<SpacedScheduleRow[]>

    constructor({
                    scheduleService,
                    settingsService,
                }: {
        scheduleService: SortedLimitScheduleRowsService
        settingsService: SettingsService
    }) {
        this.filteredScheduleRows$ = combineLatest([
            settingsService.scheduleTableWordFilterValue$.obs$,
            settingsService.scheduleTableShowUnderDue$.obs$,
            settingsService.scheduleTableShowUncounted$.obs$,
            scheduleService.sortedLimitedScheduleRows$.pipe(
                map(({
                         wordsToReview,
                         limitedScheduleRows,
                         wordsLearnedToday,
                         wordsLearning,
                         wordsLeftForToday,
                         unStartedWords,
                     }) => {
                    return uniq(
                        [
                            ...wordsToReview,
                            ...limitedScheduleRows,
                            ...wordsLearnedToday,
                            ...wordsLearning,
                            ...wordsLeftForToday,
                            ...unStartedWords,
                        ],
                    )
                }),
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
                        r: ScheduleRow<SortQuizData>,
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
        );
    }
}
