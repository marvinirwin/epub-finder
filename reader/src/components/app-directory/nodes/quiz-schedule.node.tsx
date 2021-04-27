import { TreeMenuNode } from '../tree-menu-node.interface'
import React from 'react'
import { CalendarToday } from '@material-ui/icons'
import { QUIZ_SCHEDULE } from '@shared/'
import { Manager } from '../../../lib/manager/Manager'

export function QuizScheduleNode(m: Manager): TreeMenuNode {
    return {
        name: QUIZ_SCHEDULE,
        label: 'Quiz Schedule',
        LeftIcon: () => <CalendarToday />,
        action: () => {
            m.modalService.quizScheduleOverView.open$.next(true)
        },
    }
}
