import {QuizCardTableComponent} from "../../quiz/quiz-card-table.component";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {CalendarToday} from "@material-ui/icons";
import { QUIZ_SCHEDULE } from "@shared/";


export function QuizScheduleNode(): TreeMenuNode {
    return {
        name: QUIZ_SCHEDULE,
        label: 'Quiz Schedule',
        Component: QuizCardTableComponent,
        LeftIcon: () => <CalendarToday/>
    };
}