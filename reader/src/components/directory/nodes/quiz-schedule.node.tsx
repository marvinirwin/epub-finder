import {QuizCardTableComponent} from "../../quiz/quiz-card-table.component";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function QuizScheduleNode(): TreeMenuNode {
    return {
        name: 'quiz-card',
        label: 'Quiz Schedule',
        Component: QuizCardTableComponent,
    };
}