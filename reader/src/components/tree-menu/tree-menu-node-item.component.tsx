import { TreeMenuNode } from '../app-directory/tree-menu-node.interface'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { Settings } from '@material-ui/icons'
import React from 'react'

export function TreeMenuNodeItem({
                                     treeNode,
                                     directoryPath,
                                     componentChanged,
                                     actionSelected,
                                     directoryChanged,
                                     hidden,
                                 }: {
    treeNode: TreeMenuNode
    directoryPath: string[]
    componentChanged: (s: string[]) => void
    actionSelected: (s: string[]) => void
    directoryChanged: (s: string[]) => void
    hidden: boolean,
}) {
    return (
        treeNode.ReplaceComponent ? <treeNode.ReplaceComponent /> :
            <ListItem
                button
                selected={false}
                id={treeNode.name}
                style={{ display: hidden ? 'none' : '' }}
                onClick={() => {
                    const newPath = directoryPath.concat(treeNode?.name)
                    if (treeNode.Component) {
                        componentChanged(newPath)
                    }
                    if (treeNode.action) {
                        actionSelected(newPath)
                    }
                    if (treeNode.moveDirectory) {
                        directoryChanged(newPath)
                    }
                }}
            >
                <ListItemIcon>
                    {treeNode.LeftIcon ? <treeNode.LeftIcon /> : <Settings />}
                </ListItemIcon>
                <ListItemText primary={treeNode.label} />
            </ListItem>
    )
}
