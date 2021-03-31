import { Observable } from "rxjs";
import { ds_Dict } from "../delta-scan/delta-scan.module";
import { ScheduleRow } from "./schedule-row";

export interface ScheduleRowsService<T> {
  indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<T>>>;
}
