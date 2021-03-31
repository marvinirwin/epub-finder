import React from 'react'
import { LibraryBooks } from '@material-ui/icons'
import { Manager } from '../../../lib/manager/Manager'
import { LIBRARY } from '@shared/'

export const LibraryNode = (m: Manager) => ({
    name: LIBRARY,
    label: 'Library',
    LeftIcon: () => <LibraryBooks />,
    action: () => m.modalService.library.open$.next(true),
})
