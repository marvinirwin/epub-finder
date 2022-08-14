import React from 'react'
import { LibraryBooks } from '@material-ui/icons'
import { Manager } from '../../../lib/manager/Manager'
import { LIBRARY_NODE } from '@shared/'

export const LibraryNode = {
    name: LIBRARY_NODE,
    label: 'My Library',
    LeftIcon: () => <LibraryBooks />,
}
