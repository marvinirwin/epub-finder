import React, {useContext} from "react";
import {QuizCard} from "../word-card.interface";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {quizCardKey} from "../../../lib/util/Util";

export const CardOrderMetadata = ({quizCard}: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext);
    const indexedSortedRows = useObservableState(m.sortedLimitedQuizScheduleRowsService.indexedSortedLimitedScheduleRows$) || new Map();
    const word = useObservableState(quizCard.word$) || '';
    const flashCardType = useObservableState(quizCard.flashCardType$) || '';
    const key = quizCardKey({word, flashCardType});
    const index = indexedSortedRows.get(key);

    return <div>
        {
            index !== undefined && <div>Total Index: {index} </div>
        }
    </div>
};