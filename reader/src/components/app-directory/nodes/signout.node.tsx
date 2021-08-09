import { Manager } from '../../../lib/manager/Manager'
import { Profile } from '../../../lib/auth/logged-in-user.service'
import { Settings } from '@material-ui/icons'
import React from 'react'
import { TreeMenuNode } from '../tree-menu-node.interface'

export function SignoutNode(
    m: Manager,
    profile: undefined | Profile,
): TreeMenuNode {
    return {
        name: 'signOut',
        label: 'Sign Out',
        action: () => m.loggedInUserService.signOut(),
        LeftIcon: () => <Settings />,
        hidden: !profile?.email,
    }
}
