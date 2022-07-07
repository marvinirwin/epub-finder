import React, {useContext, useMemo} from "react";
import {QuizCard} from "../word-card.interface";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {Paper, Table, TableBody, TableContainer} from "@material-ui/core";
import {quizRowsNotInProgressTable} from "languagetrainer-server/src/shared";
import {QuizCardTableHead} from "../quiz-card-table-head.component";
import {QuizCardTableRow} from "../quiz-card-table-row.component";
import {quizCardKey} from "../../../lib/util/Util";

export const CardOrderMetadata = ({quizCard}: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext);
    const indexedSortedRows = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
        ?.limitedScheduleRows
        ?.filter(r => r.d.count.value > 0)
    const word = useObservableState(quizCard.word$) || '';
    const flashCardType = useObservableState(quizCard.flashCardType$) || '';
    const endIndex = useMemo(() => {
        return indexedSortedRows && indexedSortedRows
            .findIndex(r => quizCardKey({word, flashCardType}) ===
                quizCardKey({word: r.d.word, flashCardType: r.d.flash_card_type}))
    }, [indexedSortedRows, word, flashCardType]);


    return (endIndex && indexedSortedRows) ? <TableContainer component={Paper} style={{ flex: 1, overflow: 'hidden' }}>
        <Table size="small" id={quizRowsNotInProgressTable}>
            <QuizCardTableHead />
            <TableBody>
                {indexedSortedRows.slice(0, endIndex + 1).map((row) => (
                    <QuizCardTableRow row={row} key={quizCardKey({word: row.d.word, flashCardType: row.d.flash_card_type})} />
                ))}
            </TableBody>
        </Table>
    </TableContainer> : <></>
};