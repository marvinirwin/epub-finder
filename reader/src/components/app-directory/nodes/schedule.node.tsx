import { TreeMenuNode } from '../tree-menu-node.interface'
import React from 'react'
import { Schedule } from '@material-ui/icons'
import { PROGRESS_NODE } from 'languagetrainer-server/src/shared'
import { ScheduleRowsComponent } from '../../quiz-progress/progress-table.component'

export const ScheduleNode: TreeMenuNode = {
    name: PROGRESS_NODE,
    label: 'Progress',
    Component: ScheduleRowsComponent,
    LeftIcon: () => <Schedule />,
}
