import { TreeMenuNode } from '../tree-menu-node.interface'
import React from 'react'
import {LEADER_BOARD} from 'languagetrainer-server/src/shared'
import { Manager } from '../../../lib/manager/Manager'
import { FormatListNumbered } from '@material-ui/icons';

export function LeaderBoardNode(m: Manager): TreeMenuNode {
    return {
        name: LEADER_BOARD,
        label: 'Leader Board',
        LeftIcon: () => <FormatListNumbered/>,
        action: () => {
            m.modalService.leaderBoard.open$.next(true)
        },
    }
}
