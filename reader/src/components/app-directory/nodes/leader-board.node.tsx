import { TreeMenuNode } from '../tree-menu-node.interface'
import React from 'react'
import {LEADER_BOARD} from '@shared/'
import { Manager } from '../../../lib/manager/Manager'
import {LeaderBoard} from "../../../lib/user-interface/leader-board.component";

export function LeaderBoardNode(m: Manager): TreeMenuNode {
    return {
        name: LEADER_BOARD,
        label: 'Leader Board',
        LeftIcon: () => <LeaderBoard />,
        action: () => {
            m.modalService.leaderBoard.open$.next(true)
        },
    }
}
