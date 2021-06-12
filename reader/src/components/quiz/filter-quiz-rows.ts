import {ScheduleRow, SortQuizData} from "../../lib/schedule/schedule-row";
import {sumWordCountRecords} from "../../lib/schedule/schedule-math.service";

export const filterQuizRows = (
    rows: ScheduleRow<SortQuizData>[],
) =>
    rows
        .filter((r) => r.dueDate() < new Date())
        .filter((r) => sumWordCountRecords(r) > 0)