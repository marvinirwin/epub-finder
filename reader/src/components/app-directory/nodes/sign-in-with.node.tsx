import { Profile } from '../../../lib/auth/loggedInUserService'
import { TreeMenuNode } from '../tree-menu-node.interface'
import React, { useContext } from 'react'
import { AccountCircle } from '@material-ui/icons'
import { AUTH, loggedInProfileNode, notLoggedInProfileNode } from '@shared/'
import { ManagerContext } from '../../../App'
import { useObservableState } from 'observable-hooks'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'

export const IsNotLoggedInProfile = () => {
    return <ListItem
        button
        selected={false}
        id={notLoggedInProfileNode}
        onClick={() => {
            window.location.href = `${process.env.PUBLIC_URL}/languagetrainer-auth/keycloak`
        }}
    >
        <ListItemIcon>
            <AccountCircle/>
        </ListItemIcon>
        <ListItemText primary={'Login or Sign Up to save your progress'}/>
    </ListItem>
}

export const LoggedInProfile: React.FC<{profile: Profile}> = ({profile}) => {
    return <ListItem
        selected={false}
        id={loggedInProfileNode}
    >
        <ListItemText primary={profile.email}/>
    </ListItem>
}

export const ProfileNodeComponent = () => {
    const m = useContext(ManagerContext);
    const profile = useObservableState(m.loggedInUserService.profile$);
    const isTemporaryUser = !profile?.email;
    return (profile && !isTemporaryUser) ? <LoggedInProfile profile={profile}/> : <IsNotLoggedInProfile/>
}

export const SignInWithNode = (): TreeMenuNode => ({
    name: AUTH,
    label: '',
    ReplaceComponent: () => <ProfileNodeComponent/>,
})
