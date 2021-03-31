import { QuizCardTableComponent } from "../../quiz/quiz-card-table.component";
import { TreeMenuNode } from "../tree-menu-node.interface";
import React from "react";
import { CalendarToday, TrendingUp } from "@material-ui/icons";
import { QUIZ_SCHEDULE } from "@shared/";
import { Manager } from "../../../lib/manager/Manager";

export function QuizScheduleNode(m: Manager): TreeMenuNode {
  return {
    name: QUIZ_SCHEDULE,
    label: "Quiz Schedule",
    LeftIcon: () => <TrendingUp />,
    action: () => {
      m.modalService.quizScheduleOverView.open$.next(true);
    },
  };
}
