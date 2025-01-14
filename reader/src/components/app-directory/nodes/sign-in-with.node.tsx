import { Profile } from '../../../lib/auth/logged-in-user.service'
import { TreeMenuNode } from '../tree-menu-node.interface'
import React, { useContext, useState } from 'react'
import {AccountCircle, Settings} from '@material-ui/icons'
import { AUTH, loggedInProfileNode, notLoggedInProfileNode } from '@shared/'
import { ManagerContext } from '../../../App'
import { useObservableState } from 'observable-hooks'
import { ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { TutorialPopper } from '../../tutorial-popover/tutorial-popper.component'
import { getApiUrl } from '../../../lib/util/getApiUrl'

export const signInUrl = getApiUrl("/languagetrainer-auth/keycloak");
export const goToSignIn = () => {
    window.location.href = signInUrl
}

export const IsNotLoggedInProfile = () => {
    const [ref, setRef] = useState<HTMLDivElement | null>()
    return <>
        <ListItem
            button
            ref={setRef}
            selected={false}
            id={notLoggedInProfileNode}
            onClick={() => {
                goToSignIn()
            }}
        >
            <ListItemIcon>
                <AccountCircle />
            </ListItemIcon>
            <ListItemText primary={'Login or Sign Up'} />
        </ListItem>
        {ref && <TutorialPopper storageKey={'is-logged-in'} referenceElement={ref}>
            <Typography>Log in to save your learning progress and learning material</Typography>
        </TutorialPopper>
        }
    </>
}

export const LoggedInProfile: React.FC<{ profile: Profile }> = ({ profile }) => {
    return <ListItem
        selected={false}
        id={loggedInProfileNode}
    >
        <ListItemIcon>
            <AccountCircle/>
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{variant: 'subtitle2'}} primary={profile.email} />
    </ListItem>
}

export const ProfileNodeComponent = () => {
    const m = useContext(ManagerContext)
    const profile = useObservableState(m.loggedInUserService.profile$)
    const isTemporaryUser = !profile?.email

    return (profile && !isTemporaryUser) ? <LoggedInProfile profile={profile} /> : <IsNotLoggedInProfile />
}

export const SignInWithNode = (): TreeMenuNode => ({
    name: AUTH,
    label: '',
    ReplaceComponent: () => <ProfileNodeComponent />,
})
