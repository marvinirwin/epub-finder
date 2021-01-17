import {QuizCardTableComponent} from "../../quiz/quiz-card-table.component";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {CalendarToday} from "@material-ui/icons";

export function QuizScheduleNode(): TreeMenuNode {
    return {
        name: 'quiz-card',
        label: 'Quiz Schedule',
        Component: QuizCardTableComponent,
        LeftIcon: () => <CalendarToday/>
    };
}