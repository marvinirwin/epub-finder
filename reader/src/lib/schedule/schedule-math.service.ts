import { orderBy, sum, sumBy } from "lodash";
import {
  NormalizedQuizCardScheduleRowData,
  QuizScheduleRowData,
  ScheduleRow,
  SortValue,
} from "./schedule-row";
import { getSortValue } from "../manager/sort-value.interface";
import { NormalizedValue } from "../manager/normalized-value.interface";

export const sumWordCountRecords = (row: ScheduleRow<QuizScheduleRowData>) =>
  sum(row.d.wordCountRecords.map((w) => w.count));

export type SortConfig<T, U extends number> = {
  fn: (v: T) => U;
  weight: number;
};

export class ScheduleMathService {
  public static normalizeAndSortQuizScheduleRows<
    U extends {
      [label: string]: SortConfig<any, any>;
    },
    R,
    T = ScheduleRow<QuizScheduleRowData>
  >(
    sortConfigs: U,
    scheduleRows: T[],
    assembleSortObject: (sortValues: SortValue<any>[], sortConfigs: U) => R
  ): { row: T; finalSortValue: number; sortValues: R }[] {
    const rowNormalMaps = Object.values(sortConfigs).map(
      (sortConfig) =>
        new Map<T, NormalizedValue>(
          ScheduleMathService.normalizeScheduleRows(
            scheduleRows,
            sortConfig.fn
          ).map(([n, row]) => [row, n])
        )
    );
    const sortableScheduleRows = scheduleRows.map((scheduleRow) => {
      const sortValues = Object.values(sortConfigs).map((sortConfig, index) => {
        const normalValue = rowNormalMaps[index].get(
          scheduleRow
        ) as NormalizedValue;
        return getSortValue(
          normalValue,
          sortConfig.weight,
          sortConfig.fn(scheduleRow)
        );
      });
      return {
        row: scheduleRow,
        finalSortValue: sumBy(
          sortValues,
          (v) => v.weightedInverseLogNormalValue
        ),
        sortValues: assembleSortObject(sortValues, sortConfigs),
      };
    });

    return orderBy(sortableScheduleRows, (r) => r.finalSortValue, "desc");
  }

  private static normalizeScheduleRows<T>(
    scheduleRows: T[],
    valueFunction: (r: T) => number
  ): [NormalizedValue, T][] {
    let maxValue = Number.MIN_SAFE_INTEGER;
    let minValue = Number.MAX_SAFE_INTEGER;
    let offset = 0;
    scheduleRows.forEach((row) => {
      const rowValue = valueFunction(row) || 0;
      if (maxValue < rowValue) {
        maxValue = rowValue;
      }
      if (minValue > rowValue) {
        minValue = rowValue;
      }
    });
    if (minValue < 0) {
      offset = Math.abs(minValue);
    }
    return scheduleRows.map((row) => {
      const normalizedValue = ScheduleMathService.normalize(
        valueFunction(row) + offset || 0,
        minValue + offset,
        maxValue + offset
      );
      return [
        {
          normalizedValue,
          value: valueFunction(row) + offset,
          min: minValue + offset,
          max: maxValue + offset,
          offset,
        },
        row,
      ];
    });
  }

  private static normalize(val: number, min: number, max: number) {
    return (val - min) / (max - min);
  }
}
