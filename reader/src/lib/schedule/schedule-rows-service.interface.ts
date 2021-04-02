import { Observable } from 'rxjs'
import { ds_Dict } from '../delta-scan/delta-scan.module'
import { ScheduleRow } from './schedule-row'

export interface ScheduleRowsService<T> {
    scheduleRows$: Observable<ScheduleRow<T>[]>
}
