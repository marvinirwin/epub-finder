import { Profile } from '../../../lib/auth/loggedInUserService'
import { TreeMenuNode } from '../tree-menu-node.interface'
import React from 'react'
import { AccountCircle } from '@material-ui/icons'
import { AUTH } from '@shared/'

export const SignInWithNode = (): TreeMenuNode => ({
    name: AUTH,
    label: 'Sign In With',
    action: () =>
        (window.location.href = `${process.env.PUBLIC_URL}/languagetrainer-auth/keycloak`),
    LeftIcon: () => <AccountCircle />,
})
